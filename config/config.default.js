'use strict';
const path = require('path');
// const API_RE = /^\/(mock\/|openapi\/|mockjsonp\/|mockrpc\/|mockspi\/|proxy\.html|mgw\.htm|auth).*/;
const API_RE_ALL = /.+/;

module.exports = appInfo => {
  const config = exports = {};

  config.security = {
    csrf: {
      ignoreJSON: false,
      ignore: API_RE_ALL,
    },
    ctoken: {
      ignore: API_RE_ALL,
    },
    xframe: {
      enable: false,
      value: 'SAMEORIGIN',
    },
  };

  config.cors = {
    origin: ctx => {
      return ctx.request.header.origin;
    },
    credentials: true,
  };

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1513765449219_5858';

  config.bodyParser = {
    enable: true,
    encoding: 'utf8',
    formLimit: '5120kb',
    jsonLimit: '5120kb',
    strict: true,
    // @see https://github.com/hapijs/qs/blob/master/lib/parse.js#L8 for more options
    queryString: {
      arrayLimit: 100,
      depth: 5,
      parameterLimit: 1000,
    },
  };

  config.passportLocal = {
    // usernameField: 'username',
    // passwordField: 'password',
  };

  config.mongoose = {
    client: {
      url: 'mongodb://0.0.0.0/pickpost',
      // url: 'mongodb://mongo:27017/pickpost',
      options: {},
    },
  };

  config.view = {
    root: path.join(appInfo.baseDir, 'app/assets'),
    mapping: {
      '.jsx': 'assets',
      '.html': 'nunjucks',
    },
  };

  config.assets = {
    publicPath: '/public/assets/',
    templatePath: path.join(appInfo.baseDir, 'app/view/template.html'),
    templateViewEngine: 'nunjucks',
    devServer: {
      debug: false,
      command: 'cross-env PORT=8787 roadhog dev',
      port: 8787,
      env: {
        BROWSER: 'none',
        ESLINT: 'none',
        SOCKET_SERVER: 'http://127.0.0.1:8787',
        PUBLIC_PATH: 'http://127.0.0.1:8787',
      },
    },
  };

  return config;
};
