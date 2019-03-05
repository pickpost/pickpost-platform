'use strict';

const _ = require('lodash');

// homepage 单独打包，加快页面加载速度
exports.home = async function (ctx) {
  if (ctx.headers && ctx.headers.cookie && ctx.headers.cookie.indexOf('pickpost_home=visited') >= 0) {
    ctx.redirect('/collections');
    return;
  }

  await this.render('home.jsx', {
    user: {
      cname: _.get(ctx, 'user.cname'),
      email: _.get(ctx, 'user.email'),
      avatar: _.get(ctx, 'user.avatar'),
      workid: _.get(ctx, 'user.workid'),
    },
  });
};

exports.app = async function (ctx) {
  if (ctx.isAuthenticated()) {
    await this.render('app.jsx', {
      user: {
        cname: _.get(ctx, 'user.cname'),
        email: _.get(ctx, 'user.email'),
        avatar: _.get(ctx, 'user.avatar'),
        workid: _.get(ctx, 'user.workid'),
      },
    });
  } else {
    ctx.redirect('/login');
  }
};

exports.login = async function (ctx) {
  await this.render('app.jsx', {
    user: {
      cname: _.get(ctx, 'user.cname'),
      email: _.get(ctx, 'user.email'),
      avatar: _.get(ctx, 'user.avatar'),
      workid: _.get(ctx, 'user.workid'),
    },
  });
};

exports.register = async function (ctx) {
  await this.render('app.jsx', {
    user: {
      cname: _.get(ctx, 'user.cname'),
      email: _.get(ctx, 'user.email'),
      avatar: _.get(ctx, 'user.avatar'),
      workid: _.get(ctx, 'user.workid'),
    },
  });
};

exports.resetPassword = async function (ctx) {
  await this.render('app.jsx', {
    user: {
      cname: _.get(ctx, 'user.cname'),
      email: _.get(ctx, 'user.email'),
      avatar: _.get(ctx, 'user.avatar'),
      workid: _.get(ctx, 'user.workid'),
    },
  });
};

exports.proxy = async function () {
  await this.render('proxy.html');
};
