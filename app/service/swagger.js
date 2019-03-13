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
  const projectSPIApis = await API.find({ apiType: 'SPI' });
  const projectRPCApis = await API.find({ apiType: 'RPC' });
  const projectSPIApiUrls = projectSPIApis.map(item => item.url);
  const projectRPCApiUrls = projectRPCApis.map(item => item.url);

  Object.keys(swagger.paths).forEach(bizType => {
    const item = paths[bizType];
    let action = null;
    let apiType = '';
    let requestAutoSchema;
    let responseAutoSchema;
    if (item.spi) {
      apiType = 'SPI';
      requestAutoSchema = get(item, 'spi.parameters[0].schema') || {};
      responseAutoSchema = get(item, 'spi.responses["200"].schema') || {};
    } else if (item.rpc) {
      apiType = 'RPC';
      requestAutoSchema = get(item, 'rpc.parameters[0].schema') || {};
      responseAutoSchema = get(item, 'rpc.responses["200"].schema') || {};
    }

    // 判断接口是否存在，存在走更新，不存在走创建
    if ((apiType === 'SPI' && projectSPIApiUrls.includes(bizType))
      || ((apiType === 'RPC') && projectRPCApiUrls.includes(bizType))) {
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
        apiType,
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
