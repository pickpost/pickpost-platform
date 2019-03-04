'use strict';

// 从接口集中移除接口，但不物理删除接口
exports.register = async function (ctx) {
  const reqBody = this.request.body;
  const UserModel = ctx.model.User;

  const result = await UserModel.create({
    email: reqBody.email,
    password: reqBody.password,
  });

  this.body = {
    status: 'success',
    data: result,
  };
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
    const loginResult = await ctx.login({
      result,
    });

    this.body = {
      status: 'success',
      data: loginResult,
    };
  } else {
    this.body = {
      status: 'fail',
      data: '登录失败',
    };
  }
};

exports.logout = async function(ctx) {
  ctx.logout();
  ctx.redirect(ctx.get('referer') || '/');
};
