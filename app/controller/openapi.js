'use strict';

const login = require('../service/login');
const proxy = require('./proxy');

const cacheLogin = {};

function refreshUrl(url, params = {}) {
  return url + '?' + Object.keys(params).map(p => `${p}=${params[p]}`).join('&');
}

function getCtoken(cookieStr) {
  const matchCookie = /ctoken=([^;]*);/.exec(cookieStr);
  console.log('matchCookie', matchCookie);
  if (matchCookie && matchCookie[1]) {
    return matchCookie[1];
  }
  return '';
}

// Todo
function getEnvByUrl(url) {
  return 'dev';
}

exports.spiTest = async function () {
  const { bizType, requestData, auth, gateway, server } = this.request.body;
  let cookieStr = '';
  if (auth && auth.account && auth.password) {
    if (cacheLogin[auth.account]) {
      cookieStr = cacheLogin[auth.account];
    } else {
      // 根据环境去调用
      const env = getEnvByUrl(gateway);
      const loginResult = await login.getCookie({
        env,
        type: auth.type,
        userid: auth.account,
        pwd: auth.password,
      });
      if (loginResult && loginResult.cookieStr) {
        cookieStr = loginResult.cookieStr;
        cacheLogin[auth.account] = cookieStr;
      }
    }
  }

  const fullGateway = gateway.indexOf('/spigw.json') >= 0 ? gateway : `${gateway}/spigw.json`;
  const spiSendUrl = refreshUrl(fullGateway, {
    ctoken: getCtoken(cookieStr),
    _input_charset: 'utf-8',
  });

  const params = {
    bizType,
    bizCase: '',
    requestData: JSON.stringify([ requestData ]),
    host: server.replace(/^https?:\/\//, ''),
  };
  const result = await proxy.load('post', spiSendUrl, JSON.stringify(params), cookieStr);
  if (result && result.resultMsg === '用户未登录') {
    cacheLogin[auth.account] = '';
  }
  // 如果结果是未登录，则把 cookie 清空
  this.body = result;
};
