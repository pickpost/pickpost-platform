'use strict';
const _ = require('lodash');

exports.index = async function (ctx) {
  await this.render('home.jsx', {
    user: {
      cname: _.get(ctx, 'session.user.cname'),
      email: _.get(ctx, 'session.user.email'),
      avatar: _.get(ctx, 'session.user.avatar_url'),
      workid: _.get(ctx, 'session.user.workid'),
    },
  });
};

exports.app = async function (ctx) {
  await this.render('app.jsx', {
    user: {
      cname: _.get(ctx, 'session.user.cname'),
      email: _.get(ctx, 'session.user.email'),
      avatar: _.get(ctx, 'session.user.avatar_url'),
      workid: _.get(ctx, 'session.user.workid'),
    },
  });
};

exports.proxy = async function () {
  await this.render('proxy.html');
};
