'use strict';

const axios = require('axios');
const loginService = require('../service/login');

function formatRequest(apiType, normalRequest) {
  if (apiType === 'HTTP') {
    return JSON.parse(normalRequest.requestData);
  }

  return {
    bizType: normalRequest.url,
    bizCase: '',
    host: normalRequest.target,
    requestData: JSON.stringify([ JSON.parse(normalRequest.requestData) ]),
    _input_charset: 'utf-8',
  };
}

function load(url, config) {
  return new Promise(resolve => {
    axios({
      url: encodeURI(url),
      method: config.method,
      data: config.data,
      transformRequest: [ function(data) {
        let ret = '';
        for (const it in data) {
          ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&';
        }
        return ret;
      } ],
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        Referer: url.split('?')[0], // 自动增加 referer
        ...config.headers,
        // Cookie: typeof cookieStr !== 'undefined' ? cookieStr : '',
      },
    }).then(res => {
      resolve(res.data);
    }, err => {
      resolve({ err: 'PickPost 请求执行出错:' + err.message });
    });
  });
}

exports.load = load;

/**
 * 转发普通请求
 */
exports.proxy = async function () {
  const { method, gateway, target, cookieStr } = this.request.body;
  const { apiType } = this.params;
  const requestBody = formatRequest(apiType, this.request.body);

  const loaded = await load(gateway || target, {
    method: apiType === 'HTTP' ? method || 'post' : 'post', // 非 http 都走 post
    headers: {
      Cookie: typeof cookieStr !== 'undefined' ? cookieStr : '',
    },
    data: { // 构建 data 方法需要自定义
      ...requestBody,
    },
  });

  this.body = {
    data: loaded,
  };
};

/**
 * mock登录获得cookie
 */
exports.auth = async function () {
  try {
    const { cookieStr } = await loginService.getCookie(this.request.query);
    this.body = {
      status: 'success',
      data: {
        cookieStr: cookieStr.replace('route_group=alipay.net', ''),
      },
      msg: '登录成功',
    };
  } catch (e) {
    this.body = {
      status: 'fail',
      resultMsg: e.message,
    };
  }
};
