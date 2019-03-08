'use strict';

const validator = require('validator');
const lodash = require('lodash');
const bcrypt = require('bcryptjs');

// 生成一个随机6位数字
function generateRandomCode() {
  return ('000000' + Math.floor(Math.random() * 999999)).slice(-6);
}

function validateCode(ctx, mail, code) {
  return lodash.get(ctx.session.smsCodeMap, mail) === code;
}

function bhash(str) {
  return bcrypt.hashSync(str, 10);
}

function bcompare(str, hash) {
  return bcrypt.compareSync(str, hash);
}

// 从接口集中移除接口，但不物理删除接口
exports.register = async function (ctx) {
  const reqbody = this.request.body;
  const UserModel = ctx.model.User;

  const reqBody = ctx.request.body;
  const email = validator.trim(reqBody.email || '').toLowerCase();

  let errorMsg;
  if (!validator.isEmail(email)) {
    errorMsg = '邮箱不合法';
  } else if (!validateCode(ctx, email, reqBody.code)) {
    errorMsg = '验证码不正确';
  }

  if (!errorMsg) {
    await UserModel.create({
      email: reqbody.email,
      password: bhash(reqbody.password),
    });
  }

  if (errorMsg) {
    this.body = {
      status: 'fail',
      message: errorMsg,
    };
    return;
  }

  this.body = {
    status: 'success',
  };
};

// 注册验证码
exports.sendVerfifyCode = async function (ctx) {
  const { service } = ctx;
  const reqBody = ctx.request.body;
  const email = validator.trim(reqBody.email || '').toLowerCase();

  let errorMsg;
  if (!validator.isEmail(email)) {
    errorMsg = '邮箱不合法';
  }

  if (!errorMsg) {
    const UserModel = ctx.model.User;
    const user = await UserModel.findOne({ email });
    if (user) {
      errorMsg = '该邮箱已经被注册';
    }
  }

  if (!errorMsg) {
    const randomCode = generateRandomCode();
    await service.mail.sendVerifyCode(email, randomCode);
    // 将 email 和 随机验证码建立一个对应关系，在注册接口进行匹对校验
    const { smsCodeMap = {} } = ctx.session;
    smsCodeMap[email] = randomCode;
    ctx.session.smsCodeMap = smsCodeMap;
  }

  if (errorMsg) {
    this.body = {
      status: 'fail',
      message: errorMsg,
    };
    return;
  }

  this.body = {
    status: 'success',
  };
};

// 重置密码验证码
exports.sendResetPasswordCode = async function (ctx) {
  const { service } = ctx;
  const reqBody = ctx.request.body;
  const email = validator.trim(reqBody.email || '').toLowerCase();

  let errorMsg;
  if (!validator.isEmail(email)) {
    errorMsg = '邮箱不合法';
  }

  if (!errorMsg) {
    const UserModel = ctx.model.User;
    const user = await UserModel.findOne({ email });
    if (!user) {
      errorMsg = '该邮箱还没有注册';
    }
  }

  if (!errorMsg) {
    const randomCode = generateRandomCode();
    await service.mail.sendResetPasswordCode(email, randomCode);
    // 将 email 和 随机验证码建立一个对应关系，在注册接口进行匹对校验
    const { smsCodeMap = {} } = ctx.session;
    smsCodeMap[email] = randomCode;
    ctx.session.smsCodeMap = smsCodeMap;
  }

  if (errorMsg) {
    this.body = {
      status: 'fail',
      message: errorMsg,
    };
    return;
  }

  this.body = {
    status: 'success',
  };
};

// 账号登录
exports.login = async function (ctx) {
  const UserModel = ctx.model.User;
  const reqBody = ctx.request.body;
  const email = validator.trim(reqBody.email || '').toLowerCase();
  let validUser = null;

  // 验证逻辑
  let errorMsg;
  if (!validator.isEmail(email)) {
    errorMsg = '邮箱不合法';
  }

  if (!errorMsg) {
    validUser = await UserModel.findOne({ email });

    if (!validUser) {
      errorMsg = '该账号尚未注册';
    } else {
      const equal = bcompare(reqBody.password, validUser.password);
      if (!equal) {
        errorMsg = '密码错误';
      }
    }
  }

  if (errorMsg) {
    this.body = {
      status: 'fail',
      message: errorMsg,
    };
    return;
  }

  // 将用户信息记录到 session
  await ctx.login({
    avatar: validUser.avatar,
    email: validUser.email,
    id: validUser.id,
    username: validUser.username,
    userId: validUser.userId,
  });

  this.body = {
    status: 'success',
  };
};

exports.logout = async function (ctx) {
  ctx.logout();
  ctx.redirect(ctx.get('referer') || '/');
};

exports.searchPass = async function (ctx) {
  const reqBody = ctx.request.body;
  const email = validator.trim(reqBody.email || '').toLowerCase();

  let errorMsg;
  if (!validator.isEmail(email)) {
    errorMsg = '邮箱不合法';
  }

  if (!errorMsg) {
    const UserModel = ctx.model.User;
    const user = await UserModel.findOne({ email });
    if (!user) {
      errorMsg = '该邮箱没有注册';
    }
  }

  if (errorMsg) {
    this.body = {
      status: 'fail',
      message: errorMsg,
    };
    return;
  }

  this.body = {
    status: 'success',
  };
};

exports.resetPassword = async function (ctx) {
  const UserModel = ctx.model.User;
  const reqBody = ctx.request.body;
  const email = validator.trim(reqBody.email || '').toLowerCase();
  const password = bhash(reqBody.password);

  let errorMsg;
  if (!validator.isEmail(email)) {
    errorMsg = '邮箱不合法';
  } else if (!validateCode(ctx, email, reqBody.code)) {
    errorMsg = '验证码不正确';
  }

  if (!errorMsg) {
    const result = await UserModel.findOneAndUpdate({ email }, { password });
    if (result) {
      // 将用户信息记录到 session
      await ctx.login({
        avatar: result.avatar,
        email: result.email,
        id: result.id,
        username: result.username,
        userId: result.userId,
      });
    } else {
      errorMsg = '重置失败，请检查是否该邮箱是否注册。';
    }
  }

  if (errorMsg) {
    this.body = {
      status: 'fail',
      message: errorMsg,
    };
    return;
  }

  this.body = {
    status: 'success',
  };
};
