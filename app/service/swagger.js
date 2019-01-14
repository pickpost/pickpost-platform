'use strict';

const { APISchema } = require('../common/schema');
const get = require('lodash/get');

exports.sync = async function(model, swagger) {
  const API = model.Api;
  const Project = model.Project;
  const { host, paths } = swagger;

  const project = await Project.findOne({
    name: host,
  });

  // 判断是否存在该后端应用
  if (!project) {
    throw new Error('该应用不存在，请先到平台新增应用，并开启开关');
  }

  const actions = [];

  // 查询现有的所有接口
  const projectApis = await API.find({ apiType: 'SPI' });
  const projectApiUrls = projectApis.map(item => item.url);

  Object.keys(swagger.paths).forEach(bizType => {
    const item = paths[bizType];
    let action = null;
    // 判断接口是否存在，存在走更新，不存在走创建
    const requestAutoSchema = get(item, 'spi.parameters[0].schema') || {};
    const responseAutoSchema = get(item, 'spi.responses["200"].schema') || {};

    if (projectApiUrls.includes(bizType)) {
      action = API.updateOne({ url: bizType }, { $set: {
        projectId: project._id.toString(),
        requestAutoSchema,
        responseAutoSchema,
        swaggerSyncAt: new Date(),
      } });
    } else {
      action = API.create({
        ...APISchema,
        projectId: project._id.toString(),
        apiType: 'SPI',
        url: bizType,
        requestAutoSchema,
        responseAutoSchema,
        swaggerSyncAt: new Date(),
      });
    }

    actions.push(action);
  });

  return await Promise.all(actions);
};
