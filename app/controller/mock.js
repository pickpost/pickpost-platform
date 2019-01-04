'use strict';

const Mock = require('mockjs');
const safeEval = require('safer-eval');
const Random = Mock.Random;
const { ApiTypes } = require('../common/constants');

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

/**
 * @param {Object} ctx
 * 根据 url 返回 response
 */
exports.mockapi = async function (ctx) {
  const { apiType, projectName } = this.params;
  const apiUrl = this.params[0];
  const API = ctx.model.Api;
  const Project = ctx.model.Project;

  const matchedConfig = ApiTypes.find(item => item.type === apiType.toUpperCase()) || {};

  let matchedProject = null;
  const findParams = {
    url: apiType.toUpperCase() === 'HTTP' ? new RegExp(`^/${apiUrl}$`, 'i') : new RegExp(`^${apiUrl}$`, 'i'),
  };

  // 判断是否需要判断接口项目
  if (!matchedConfig.globalUnique) {
    // 通过 project name 找到 project id
    matchedProject = await Project.findOne({
      name: projectName,
    });

    if (!matchedProject) {
      this.body = {
        status: 'fail',
        msg: `没有找到 ${projectName} 的应用`,
      };
      return;
    }

    findParams.projectId = matchedProject._id.toString();
  }

  try {
    const apiResult = await API.findOne({
      ...findParams,
    });

    if (apiResult) {
      this.body = mockParse(apiResult.responses[apiResult.responseIndex].content || '', this.request);
    } else {
      ctx.body = {
        status: 'fail',
        msg: '没有找到对应接口',
      };
    }
  } catch (e) {
    this.body = {
      status: 'fail',
      msg: '数据处理失败',
      error: e.toString(),
    };
  }
};
