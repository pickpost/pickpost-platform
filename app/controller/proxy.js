'use strict';

const axios = require('axios');
const Mock = require('mockjs');
const loginService = require('../service/login');
const safeEval = require('safer-eval');
const Random = Mock.Random;

// 处理用户填写的mock数据
function mockParse(mockStr, _req) {
  const req = JSON.parse(JSON.stringify(_req));
  req.query = _req.query;
  req.body = _req.body;

  if (typeof mockStr !== 'string') return '';
  let result;
  if (/^(\{|\[)(.|\n)+(\}|\])$/gmi.test(mockStr.trim())) { // 匹配完整对象或者数组
    // 将字符串代码规则执行输出结果
    result = Mock.mock(safeEval(mockStr, { Random, _req: req, Mock })); // Random, _req, Mock 默认注入
  } else {
    result = safeEval('(function(){' + mockStr + '})()', { _req: req }); // 自由代码执行
  }
  return result;
}

function load(method, url, data, cookieStr) {
  return new Promise(resolve => {
    axios({
      method,
      url: encodeURI(url),
      data: JSON.parse(data),
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
        Cookie: typeof cookieStr !== 'undefined' ? cookieStr : '',
        Referer: url.split('?')[0], // 自动增加 referer
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
 * mock登录获得cookie
 */
exports.auth = async function () {
  try {
    const { cookieStr } = await loginService.getCookie(this.request.query);
    this.body = {
      status: 'success',
      data: {
        cookieStr,
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

/**
 * 转发普通请求
 */
exports.proxy = async function () {
  const reqBody = this.request.body;
  const action = reqBody.method.toLowerCase();
  const loaded = await load(action, reqBody.url, reqBody.data, reqBody.cookieStr);

  this.body = {
    data: loaded,
  };
};

/**
 * @param {Object} ctx
 * 根据url和method返回responseRule
 */
exports.mockapi = async function (ctx) {
  const reqBody = this.request.body;
  const API = ctx.model.Api;
  const Project = ctx.model.Project;
  let allReponses = [];
  let result = '';
  // 通过 project name 找到 project id
  const project = await Project.findOne({
    name: this.params.project,
  });
  if (project) {
    const url = this.request.url.replace(/.+(mock|mockjsonp)\/[^\/]+/, '').replace(/\?.+/, '');
    const method = reqBody._mockMethod || this.request.method;
    const apiResult = await API.findOne({
      projectId: project._id,
      url: new RegExp(url, 'i'),
    });
    // 如果不存在的接口，直接走转发
    if (apiResult) {
      if (this.request.query.__allResponse) { // 是否返回所有response
        allReponses = apiResult.responses;
      } else {
        result = apiResult.responses[apiResult.responseIndex].content;
      }
    } else {
      result = await load(method, reqBody.url, reqBody.data, reqBody.cookieStr);
    }
  }
  try {
    if (this.request.query.__allResponse) {
      allReponses = allReponses.map(item => mockParse(item.content, this.request));
      this.body = allReponses;
    } else {
      this.body = mockParse(result, this.request);
    }
  } catch (e) {
    this.body = {
      status: 'fail',
      msg: '数据处理失败',
      error: e.toString(),
    };
  }
};
