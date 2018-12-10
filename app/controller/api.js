'use strict';

// const axios = require('axios');
const schema = require('../common/schema');
const utils = require('../common/utils');
const { createFill, updateFill } = utils;
const { APISchema } = schema;

/**
 * 接口列表
 * @param {Object} ctx
 * this.params获取url中的:xx
 * this.query 获取url中的QueryString参数
 * this.request.body 获取请求body
 */
exports.apisIndex = async function (ctx) {
  const API = ctx.model.Api;
  const CollectionAPI = ctx.model.CollectionApi;
  const Project = ctx.model.Project;
  const { projectId, collectionId } = this.query;

  const params = {};
  if (projectId) {
    params.projectId = projectId;
  }

  const projects = await Project.find();
  const projectMap = {};
  projects.forEach(item => {
    projectMap[item._id] = item;
  });

  if (collectionId) {
    const collectionAPIList = await CollectionAPI.find({
      collectionId,
    });
    const apiIds = collectionAPIList.filter(item => item.apiId).map(item => item.apiId);
    params._id = { $in: apiIds };
  }
  let apis = await API.find({
    ...params,
  }, {
    name: 1,
    url: 1,
    methods: 1,
    apiType: 1,
    projectId: 1,
    updatedAt: 1,
    createdAt: 1,
    creater: 1,
  }).sort({ createdAt: -1 }).lean();

  apis = apis.map(item => ({
    ...item,
    projectName: projectMap[item.projectId] ? projectMap[item.projectId].name : '',
    projectDesc: projectMap[item.projectId] ? projectMap[item.projectId].desc : '',
    creater: item.creater ? item.creater.cname : '',
  }));

  this.body = {
    status: 'success',
    data: {
      apis,
    },
  };
};

exports.apisShow = async function (ctx) {
  const API = ctx.model.Api;
  const Project = ctx.model.Project;
  const detail = await API.findOne({
    _id: this.params.id,
  }).lean();

  if (detail) {
    const project = await Project.findOne({
      _id: detail.projectId,
    });

    if (project) {
      detail.projectName = project.name;
      detail.accounts = project.accounts || [];
      detail.envs = project.envs || [];
      detail.gateways = project.gateways || [];
    }

    this.body = {
      status: 'success',
      data: detail,
    };
  } else {
    this.body = {
      status: 'fail',
      data: {},
      msg: '没有查询到数据',
    };
  }
};

/**
 * @param {Object} ctx
 * 新建接口
 * 1. 在接口集新建
 *    需要判断该接口是否已经在项目池存在：如果存在的话只做接口和接口集的关联操作
 *    再判断是否接口集中已存在，如果存在，返回错误提示，不允许新增重复记录。
 *
 * 2. 在项目池新建
 *    判断该接口是否已在项目池存在
 *    直接生成一条项目下的接口记录。
 */
exports.apisNew = async function (ctx) {
  const API = ctx.model.Api;
  const CollectionAPI = ctx.model.CollectionApi;
  const reqBody = this.request.body;
  const api = JSON.parse(reqBody.api);
  const newApi = Object.assign(APISchema, api);
  let apiId = api._id;

  const sameAPI = await API.findOne({
    url: newApi.url,
    projectId: newApi.projectId,
  });

  let result = {};
  let errMsg = '';
  // 如果项目中没有相同的接口，则创建一个接口
  if (!sameAPI) {
    result = await API.create(createFill(newApi));
    apiId = result._id;
  } else {
    apiId = sameAPI._id;
    errMsg = `项目中已存在路径规则为 ${newApi.url} 的接口`;
  }

  // 如果传入了 collectionId 则需要做接口集的关联操作
  if (api.collectionId) {
    const sameCollectionApi = await CollectionAPI.findOne({
      apiId,
      _id: api.collectionId,
    });

    if (!sameCollectionApi) {
      await CollectionAPI.create(createFill({
        apiId,
        collectionId: api.collectionId,
      }));
      result = {
        insertedId: apiId,
      };
      errMsg = '';
    } else {
      errMsg = `接口集中已存在路径规则为 ${newApi.url} 的接口`;
    }
  }

  if (errMsg) {
    this.body = {
      status: 'fail',
      errMsg,
    };
  } else {
    this.body = {
      status: 'success',
      data: result,
    };
  }
};

exports.apisUpdate = async function (ctx) {
  const API = ctx.model.Api;
  const reqBody = this.request.body;
  const api = JSON.parse(reqBody.api);
  delete api._id; // 更新接口不能包含_id
  const result = await API.updateOne({ _id: this.params.id }, { $set: updateFill(api) });

  this.body = {
    status: 'success',
    data: result,
  };
};

// 物理删除API，要删除关联该API的CollectionAPI
exports.apisDestroy = async function (ctx) {
  const API = ctx.model.Api;
  const CollectionAPI = ctx.model.CollectionApi;
  const result = await API.deleteOne({ _id: this.params.id });
  // 同时要删除CollectionAPI中的数据
  await CollectionAPI.deleteMany({
    apiId: this.params.id,
  });

  this.body = {
    status: 'success',
    data: result,
  };
};

// 从接口集中移除接口，但不物理删除接口
exports.apisUnlink = async function (ctx) {
  const reqBody = this.request.body;
  const CollectionAPI = ctx.model.CollectionApi;
  const result = await CollectionAPI.deleteOne({
    apiId: reqBody.apiId,
    collectionId: reqBody.collectionId,
  });

  this.body = {
    status: 'success',
    data: result,
  };
};

exports.getUser = async function () {
  const user = await this.bucClient.get('user');

  if (!user) {
    this.status = 404;
    this.body = {
      error: this.params.name + ' not exists',
    };
    return;
  }

  this.body = {
    status: 'success',
    user: {
      name: user.login,
      nick: user.name,
      email: user.email,
    },
  };
};

exports.searchByKeyWord = async function () {
  const result = await this.bucClient.searchByKeyWord(this.query.keyword);
  result.users = result.users.map(item => ({
    empId: item.empId,
    name: item.name,
    avatar_url: item.avatar_url,
    email: item.email,
  }));

  this.body = {
    status: 'success',
    data: result,
  };
};

// exports.searchByKeyWord = async function (ctx) {
//   try {
//     const result = await axios({
//       url: 'http://office.choicesaas.cn/external/getUser',
//       method: 'post',
//       headers: {
//         cookie: ctx.request.header.cookie,
//       },
//       data: {
//         value: this.query.keyword || '',
//       },
//     });

//     const users = result.data.data.map(item => ({
//       empId: item.userId,
//       name: item.realyName,
//       email: item.username,
//     }));

//     this.body = {
//       status: 'success',
//       data: {
//         users,
//       },
//     };
//   } catch (err) {
//     this.body = {
//       status: 'success',
//       data: {
//         users: [],
//       },
//     };
//   }
// };

exports.globalSearch = async function (ctx) {
  const keyword = this.query.keyword;
  const Project = ctx.model.Project;
  const Collection = ctx.model.Collection;
  const Api = ctx.model.Api;
  const keywordPattern = new RegExp(keyword, 'gim');
  const LIMITCOUNT = 6;

  const results = [];
  const projectList = await Project.find({
    $or: [
      { name: keywordPattern },
      { url: keywordPattern },
    ],
  }).limit(LIMITCOUNT);

  results.push({
    type: 'project',
    title: '后端应用',
    list: projectList.map(item => ({
      id: item._id,
      label: item.desc,
      path: item.name,
    })),
  });

  const collectionList = await Collection.find({
    name: keywordPattern,
  }).limit(LIMITCOUNT);

  results.push({
    type: 'collection',
    title: '需求',
    list: collectionList.map(item => ({
      id: item._id,
      label: item.name,
      path: '',
    })),
  });

  const apiList = await Api.find({
    $or: [
      { name: keywordPattern },
      { url: keywordPattern },
    ],
  }).limit(LIMITCOUNT);

  results.push({
    type: 'api-detail',
    title: '接口',
    list: apiList.map(item => ({
      id: item._id,
      label: item.name,
      path: item.url,
      projectId: item.projectId,
    })),
  });

  this.body = {
    status: 'success',
    data: results,
  };
};

// 通过 spi 的 bizType 重定向至接口测试界面
exports.spiTest = async function (ctx) {
  const API = ctx.model.Api;
  const Project = ctx.model.Project;
  const bizType = this.query.bizType;
  if (!bizType) {
    this.body = {
      status: 'fail',
      message: '请指定bizType',
    };
    return;
  }
  const result = await API.findOne({
    apiType: 'SPI',
    url: bizType,
  });
  if (result && result._id) {
    const { _id, projectId } = result;
    this.redirect(`/api-detail/${_id}/test?belong=project_${projectId}`);
  } else {
    // 查询项目
    const appName = this.query.appName;
    if (!appName) {
      this.body = {
        status: 'fail',
        message: '没有指定所属应用(appName)',
      };
      return;
    }
    const projectResult = await Project.findOne({ name: appName });
    if (projectResult && projectResult._id) {
      const apiCreateResult = await API.create(createFill({
        apiType: 'SPI',
        url: bizType,
        projectId: projectResult._id,
      }));
      this.redirect(`/api-detail/${apiCreateResult._id}/test?belong=project_${projectResult._id}`);
    } else {
      this.body = {
        status: 'fail',
        message: `没有找名称为 ${appName} 的应用用于创建接口，请先在应用管理中添加该应用。`,
      };
    }
  }
};
