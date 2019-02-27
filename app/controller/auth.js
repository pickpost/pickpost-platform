'use strict';

// 从接口集中移除接口，但不物理删除接口
exports.signup = async function (ctx) {
  const reqBody = this.request.body;
  const UserModel = ctx.model.User;

  const result = await UserModel.create({
    emial: reqBody.email,
    password: reqBody.password,
  });

  this.body = {
    status: 'success',
    data: result,
  };
};

exports.logout = async function() {
  const ctx = this.ctx;

  ctx.logout();
  ctx.redirect(ctx.get('referer') || '/');
};
