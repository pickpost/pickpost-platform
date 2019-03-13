'use strict';

const uuid = require('uuid');

module.exports = app => {

  // TODO 需修改
  const localHandler = async (ctx, { username, password }) => {
    const getUser = username => {
      if (username.indexOf('@') > 0) {
        return ctx.service.user.getUserByMail(username);
      }
      return ctx.service.user.getUserByLoginName(username);
    };
    const existUser = await getUser(username);

    // 用户不存在
    if (!existUser) {
      return null;
    }

    const passhash = existUser.pass;
    // TODO: change to async compare
    const equal = ctx.helper.bcompare(password, passhash);
    // 密码不匹配
    if (!equal) {
      return null;
    }

    // 用户未激活
    if (!existUser.active) {
      // 发送激活邮件
      return null;
    }

    // 验证通过
    return existUser;
  };

  const githubHandler = async (ctx, { profile }) => {
    const email = profile.emails && profile.emails[0] && profile.emails[0].value;
    let existUser = await ctx.model.User.findOne({ githubId: profile.id }) || await ctx.model.User.findOne({ email });

    // 用户不存在则创建
    if (!existUser) {
      existUser = new ctx.model.User();
    }

    // 用户存在，更新字段
    existUser.githubId = profile.id;
    existUser.email = email;
    existUser.username = profile.username;
    existUser.avatar = profile._json.avatar_url;
    existUser.githubUsername = profile.username;
    existUser.githubAccessToken = profile.accessToken;

    try {
      await existUser.save();
    } catch (ex) {
      if (ex.message.indexOf('duplicate key error') !== -1) {
        let err;
        if (ex.message.indexOf('email') !== -1) {
          err = new Error('您 GitHub 账号的 Email 与之前在 pickpost 注册的 Email 重复了');
          err.code = 'duplicate_email';
          throw err;
        }
      }
      throw ex;
    }

    return existUser;
  };

  // 校验用户
  app.passport.verify(async (ctx, user) => {
    ctx.logger.debug('passport.verify', user);
    const handler = user.provider === 'github' ? githubHandler : localHandler;
    const existUser = await handler(ctx, user);
    if (existUser) {
      // id存入Cookie, 用于验证过期.
      const auth_token = existUser._id + '$$$$'; // 以后可能会存储更多信息，用 $$$$ 来分隔
      const opts = {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 30,
        signed: true,
        httpOnly: true,
      };
      ctx.cookies.set(app.config.auth_cookie_name, auth_token, opts); // cookie 有效期30天
    }

    return existUser;
  });

  // 反序列化后把用户信息从 session 中取出来，反查数据库拿到完整信息
  app.passport.deserializeUser(async (ctx, user) => {
    if (user) {
      const auth_token = ctx.cookies.get(ctx.app.config.auth_cookie_name, {
        signed: true,
      });

      if (!auth_token) {
        return user;
      }

      const auth = auth_token.split('$$$$');
      const user_id = auth[0];
      user = await ctx.model.User.findOne({ _id: user_id });
      if (!user) {
        return user;
      }
    }

    return user;
  });
};

