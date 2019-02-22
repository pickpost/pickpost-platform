'use strict';

const utils = require('../common/utils');
const { createFill, updateFill } = utils;

async function getSpaceIdByAlias(model, alias) {
  let spaceId = '';
  // 把 spaceAlias 转换为 spaceId
  const matchedSpace = await model.Space.findOne({ alias });
  if (matchedSpace) {
    spaceId = matchedSpace._id;
  }

  return spaceId;
}

/* *
 * this.params获取url中的:xx
 * this.query 获取url中的QueryString参数
 * this.request.body 获取请求body
 */
exports.projectsIndex = async function(ctx) {
  const Project = ctx.model.Project;
  const API = ctx.model.Api;
  const { collectionId, spaceAlias } = ctx.query;

  let spaceId = '';
  if (collectionId) {
    const matchedCollection = await ctx.model.Collection.findOne({ _id: collectionId });
    spaceId = matchedCollection.spaceId;
  } else if (spaceAlias) {
    spaceId = await getSpaceIdByAlias(ctx.model, spaceAlias);
  }

  const projects = await Project.find({ spaceId }).sort({ createdAt: 'desc' });
  const projectIds = projects.map(item => item._id);
  const apis = await API.find({
    projectId: { $in: projectIds },
  }, {
    _id: 1,
    url: 1,
    methods: 1,
    name: 1,
    desc: 1,
    projectId: 1,
    createdAt: 1,
    updatedAt: 1,
  });

  const projectData = projects.map(item => {
    const itemCopy = JSON.parse(JSON.stringify(item));
    return {
      ...itemCopy,
      apis: apis.filter(c => itemCopy._id === c.projectId),
    };
  });

  this.body = {
    status: 'success',
    data: projectData,
  };
};

exports.projectList = async function (ctx) {
  const Project = ctx.model.Project;
  const projectList = await Project.find({}, {
    _id: 1,
    name: 1,
  });
  this.body = {
    status: 'success',
    data: projectList,
  };
};

exports.projectsShow = async function (ctx) {
  const Project = ctx.model.Project;
  const detail = await Project.findOne({
    _id: this.params.id,
  }).populate({
    path: 'space', select: 'alias',
  });

  this.body = {
    status: 'success',
    data: detail,
  };
};

exports.projectsNew = async function (ctx) {
  const Project = ctx.model.Project;
  const { project, spaceAlias } = this.request.body;

  const spaceId = await getSpaceIdByAlias(ctx.model, spaceAlias);

  if (project.owners.length <= 0) {
    this.body = {
      status: 'fail',
      message: '项目管理员不能为空',
    };

    return;
  }

  const result = await Project.create(createFill({
    spaceId,
    ...project,
  }));

  this.body = {
    status: 'success',
    data: result,
  };
};

exports.projectsUpdate = async function (ctx) {
  const Project = ctx.model.Project;
  const reqBody = this.request.body;
  const project = reqBody.project;
  delete project._id;
  const result = await Project.updateOne({ _id: this.params.id }, { $set: updateFill(project) });

  this.body = {
    status: 'success',
    data: result,
  };
};

exports.projectsDestroy = async function (ctx) {
  const projectId = this.params.id;
  const API = ctx.model.Api;
  const Project = ctx.model.Project;
  const CollectionAPI = this.service.basement.db.collection('CollectionAPI');
  const result = await Project.deleteOne({ _id: projectId });

  // 查询出项目下的所有接口
  const apis = await API.find({
    projectId,
  });

  const apiIds = apis.map(item => item._id);

  if (apiIds && apiIds.length > 0) {
    // 删除所有跟接口相关的接口集记录
    await CollectionAPI.deleteMany({
      apiId: { $in: apiIds },
    });

    // 删除项目下的所有接口
    await API.deleteMany({
      projectId,
    });
  }

  this.body = {
    status: 'success',
    data: result,
  };
};
