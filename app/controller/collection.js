'use strict';

const utils = require('../common/utils');
const { createFill, updateFill } = utils;
const arrayToTree = require('array-to-tree');

exports.collectionsIndex = async function (ctx) {
  const Collection = ctx.model.Collection;
  const CollectionAPI = ctx.model.CollectionApi;

  // 所有的接口集列表
  let collections = await Collection.find({}).sort({ createdAt: 'desc' }).lean();
  const collectionIds = collections.map(item => item._id);

  // 一次查询接口集接口关联表
  const collectionAPIList = await CollectionAPI.find({
    collectionId: { $in: collectionIds },
  });

  // 每个接口集下接口个数
  collections = collections.map(item => {
    const apisCount = collectionAPIList.filter(c => c.collectionId + '' === item._id + '' && c.type !== 'folder').length;
    return {
      ...item,
      _id: item._id.toString(),
      apisCount,
    };
  });

  const tree = arrayToTree(collections, {
    parentProperty: 'parentId',
    customID: '_id',
  });

  // 把无分组的归类到默认分组
  const defaultGroup = {
    name: '默认分组',
    parentId: '',
    _id: '',
    type: 'folder',
    children: tree.filter(item => item.type !== 'folder'),
  };

  const last = tree.filter(item => item.type === 'folder');
  last.push(defaultGroup);

  this.body = {
    status: 'success',
    data: last,
  };
};

exports.collectionsShow = async function (ctx) {
  const Collection = ctx.model.Collection;
  const detail = await Collection.findOne({
    _id: this.params.id,
  });

  this.body = {
    status: 'success',
    data: detail,
  };
};

exports.collectionsNew = async function (ctx) {
  const Collection = ctx.model.Collection;
  const { owners = [], type } = this.request.body;

  // 如果是项目必须这是管理员
  if (type !== 'folder' && owners.length <= 0) {
    this.body = {
      status: 'fail',
      message: '管理员不能为空',
    };

    return;
  }

  const result = await Collection.create(createFill(this.request.body));

  this.body = {
    status: 'success',
    data: result,
  };
};

exports.collectionsUpdate = async function (ctx) {
  // const workid = this.session.user.workid;
  const Collection = ctx.model.Collection;
  delete this.request.body._id;
  // const colData = await Collection.findOne({
  //   _id: this.params.id,
  // });
  // const users = colData.owners.concat(colData.members) || [];
  // workid不在owner或members列表中
  // if (!users.map(v => v.key).includes(workid)) {
  //   this.body = {
  //     status: 'fail',
  //     data: {},
  //     msg: '没有权限',
  //   };
  //   return;
  // }

  const result = await Collection.updateOne({
    _id: this.params.id,
  }, {
    $set: updateFill(this.request.body),
  });

  this.body = {
    status: 'success',
    data: result,
  };
};

/* *
 * 删除接口集
 * 同时需要去 CollectionAPI 中间表删除相关记录
 */
exports.collectionsDestroy = async function (ctx) {
  const workid = this.session.user.workid;
  const Collection = ctx.model.Collection;
  const CollectionAPI = ctx.model.CollectionApi;
  const colData = await Collection.findOne({
    _id: this.params.id,
  });
  // workid不在owner列表中
  if (!colData.owners.map(v => v.key).includes(workid)) {
    this.body = {
      status: 'fail',
      data: {},
      msg: '没有权限',
    };
    return;
  }

  const result = await Collection.deleteOne({ _id: this.params.id });

  await CollectionAPI.deleteMany({
    collectionId: this.params.id,
  });

  this.body = {
    status: 'success',
    data: result,
  };
};
