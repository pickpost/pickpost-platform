'use strict';

const validator = require('validator');

// 从接口集中移除接口，但不物理删除接口
exports.register = async function (ctx) {
  const reqbody = this.request.body;
  const usermodel = ctx.model.user;

  const result = await usermodel.create({
    email: reqbody.email,
    password: reqbody.password,
  });

  this.body = {
    status: 'success',
    data: result,
  };
};

exports.sendVerfifyCode = async function(ctx) {
  const { service } = ctx;

  const reqBody = ctx.request.body;
  const email = validator.trim(reqBody.email || '').toLowerCase();

  let errorMsg;
  if (!validator.isEmail(email)) {
    errorMsg = '邮箱不合法';
  }

  if (!errorMsg) {
    await service.mail.sendVerifyCode(email, '111111');
    this.body = {
      status: 'success',
    };
  } else {
    this.body = {
      status: 'fail',
      message: errorMsg,
    };
  }
};

exports.login = async function(ctx) {
  const UserModel = ctx.model.User;
  const { username, password } = ctx.request.body;

  const result = await UserModel.findOne({
    email: username,
    password,
  });

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
      message: '登录失败',
    };
  }
};

exports.logout = async function(ctx) {
  ctx.logout();
  ctx.redirect(ctx.get('referer') || '/');
};
