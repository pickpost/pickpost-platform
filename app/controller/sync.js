'use strict';

const schema = require('../common/schema');
const { APISchema } = schema;

/**
 * 同步 SPI Schema
 * @param {Object} ctx
 * this.params 获取url中的:xx
 * this.query 获取url中的QueryString参数
 * this.request.body 获取请求body
 */
exports.spiSync = async function (ctx) {
  const API = ctx.model.Api;
  const Project = ctx.model.Project;
  const { appName, apis } = this.request.body;

  const project = await Project.findOne({
    name: appName,
  });

  // 1. 判断是否存在该后端应用
  if (!project) {
    this.body = {
      status: 'fail',
      data: {},
      msg: '该应用不存在',
    };
    return;
  }

  const actions = [];

  // const apiList = JSON.parse(apis);
  const apiList = apis;
  const projectApis = await API.find({ projectId: project._id });
  const projectApiUrls = projectApis.map(item => item.url);

  apiList.forEach(item => {
    let action = null;
    // 判断接口是否存在，存在走更新，不存在走创建
    if (!item.bizType) return;

    if (projectApiUrls.includes(item.bizType)) {
      action = API.updateOne({ url: item.bizType }, { $set: {
        requestAutoSchema: item.requestSchema,
        responseAutoSchema: item.responseSchema,
      } });
    } else {
      action = API.create({
        ...APISchema,
        projectId: project._id.toString(),
        apiType: 'SPI',
        url: item.bizType,
        requestAutoSchema: item.requestSchema,
        responseAutoSchema: item.responseSchema,
      });
    }

    actions.push(action);
  });

  const result = await Promise.all(actions);

  this.body = {
    status: 'success',
    data: result,
  };
};
