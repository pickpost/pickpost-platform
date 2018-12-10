'use strict';

const arrayToTree = require('array-to-tree');

exports.getCollectionApis = async function (ctx) {
  const CollectionAPI = ctx.model.CollectionApi;
  const API = ctx.model.Api;
  const { collectionId } = this.query;

  const result = await CollectionAPI.find({
    collectionId,
  }).lean();

  const apiIds = result.filter(item => item.type !== 'folder' && item.apiId).map(item => item.apiId);
  const apis = await API.find({
    _id: { $in: apiIds },
  }, {
    name: 1,
    url: 1,
  }).sort({ createdAt: -1 }).lean();
  const apiMap = {};
  apis.forEach(item => {
    apiMap[item._id] = {
      name: item.name,
      url: item.url,
    };
  });

  const newResult = result.map(item => ({
    ...item,
    _id: item._id.toString(),
    parentId: item.type !== 'folder' && !item.parentId ? 'none_group_id' : item.parentId,
    ...apiMap[item.apiId],
  }));

  // 把无分组的归类到默认分组
  newResult.push({
    name: '默认分组',
    parentId: '',
    _id: 'none_group_id',
    type: 'folder',
  });

  // 将 list 转换为 tree
  const tree = arrayToTree(newResult, {
    parentProperty: 'parentId',
    customID: '_id',
  });

  this.body = {
    status: 'success',
    data: tree,
  };
};

exports.create = async function (ctx) {
  const CollectionAPI = ctx.model.CollectionApi;
  const { name, collectionId, parentId } = this.request.body;

  if (!name || !collectionId) {
    this.body = {
      status: 'fail',
      msg: '创建失败，目录名称未填写或者没有指定需求ID',
    };
    return;
  }

  const result = await CollectionAPI.create({
    parentId,
    collectionId,
    apiId: '',
    type: 'folder',
    name,
  });

  this.body = {
    status: 'success',
    data: result,
  };
};

exports.update = async function (ctx) {
  const CollectionAPI = ctx.model.CollectionApi;
  const { name } = this.request.body;
  const result = await CollectionAPI.updateOne({ _id: this.params.id }, { $set: {
    name,
  } });

  this.body = {
    status: 'success',
    data: result,
  };
};

/* *
 * 删除接口集
 * 同时需要去 CollectionAPI 中间表删除相关记录
 */
exports.destroy = async function (ctx) {
  const CollectionAPI = ctx.model.CollectionApi;
  const result = await CollectionAPI.deleteOne({ _id: this.params.id });

  this.body = {
    status: 'success',
    data: result,
  };
};
