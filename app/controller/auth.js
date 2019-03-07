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

  if (errorMsg) {
    this.body = {
      status: 'fail',
      message: errorMsg,
    };
    return;
  }

  await UserModel.create({
    email: reqbody.email,
    password: bhash(reqbody.password),
  });

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
      this.body = {
        status: 'fail',
        message: '该邮箱已经被注册',
      };
    } else {
      const randomCode = generateRandomCode();
      await service.mail.sendVerifyCode(email, randomCode);
      // 将 email 和 随机验证码建立一个对应关系，在注册接口进行匹对校验
      const { smsCodeMap = {} } = ctx.session;
      smsCodeMap[email] = randomCode;
      ctx.session.smsCodeMap = smsCodeMap;

      this.body = {
        status: 'success',
      };
    }
  } else {
    this.body = {
      status: 'fail',
      message: errorMsg,
    };
  }
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
      this.body = {
        status: 'fail',
        message: '该邮箱还没有注册',
      };
    } else {
      const randomCode = generateRandomCode();
      await service.mail.sendResetPasswordCode(email, randomCode);
      // 将 email 和 随机验证码建立一个对应关系，在注册接口进行匹对校验
      const { smsCodeMap = {} } = ctx.session;
      smsCodeMap[email] = randomCode;
      ctx.session.smsCodeMap = smsCodeMap;

      this.body = {
        status: 'success',
      };
    }
  } else {
    this.body = {
      status: 'fail',
      message: errorMsg,
    };
  }
};

exports.login = async function (ctx) {
  const UserModel = ctx.model.User;
  const reqBody = ctx.request.body;
  const email = validator.trim(reqBody.email || '').toLowerCase();

  let errorMsg;
  if (!validator.isEmail(email)) {
    errorMsg = '邮箱不合法';
  }

  if (errorMsg) {
    this.body = {
      status: 'fail',
      message: errorMsg,
    };
    return;
  }

  const result = await UserModel.findOne({ email });
  const equal = bcompare(reqBody.password, result.password);

  if (equal) {
    // 将用户信息记录到 session
    await ctx.login({
      avatar: result.avatar,
      email: result.email,
      id: result.id,
      username: result.username,
      userId: result.userId,
    });

    this.body = {
      status: 'success',
      data: {},
    };
  } else {
    this.body = {
      status: 'fail',
      message: '登录失败',
    };
  }
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
    if (user) {
      this.body = {
        status: 'success',
      };
    } else {
      this.body = {
        status: 'fail',
        message: '该邮箱没有注册',
      };
    }
  } else {
    this.body = {
      status: 'fail',
      message: errorMsg,
    };
  }
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

  if (errorMsg) {
    this.body = {
      status: 'fail',
      message: errorMsg,
    };
    return;
  }

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

    this.body = {
      status: 'success',
      data: {},
    };
  } else {
    this.body = {
      status: 'fail',
      message: '重置失败',
    };
  }
};
