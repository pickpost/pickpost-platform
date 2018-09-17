'use strict';

const utils = require('../common/utils');
const { createFill, updateFill } = utils;
/**
 * @param {Object} ctx
 * 页面列表
 */
exports.folderIndex = async function (ctx) {
  const Folder = ctx.model.Folder;
  const folder = await Folder.find({});

  this.body = {
    status: 'success',
    data: folder,
  };
};

exports.folderShow = async function (ctx) {
  const Folder = ctx.model.Folder;
  const detail = await Folder.findOne({
    _id: this.params.id,
  });

  this.body = {
    status: 'success',
    data: detail,
  };
};

exports.folderNew = async function (ctx) {
  const Folder = ctx.model.Folder;
  const folderStr = this.request.body.folder;
  const c = JSON.parse(folderStr);

  const result = await Folder.insertOne(createFill(c));

  this.body = {
    status: 'success',
    data: result,
  };
};

exports.folderUpdate = async function (ctx) {
  const Folder = ctx.model.Folder;
  const folderStr = this.request.body.folder;
  const c = JSON.parse(folderStr);
  delete c._id;
  const result = await Folder.updateOne({ _id: this.params.id }, { $set: updateFill(c) });

  this.body = {
    status: 'success',
    data: result,
  };
};

/**
 * @param {Object} ctx
 * 删除接口集
 * 同时需要去 CollectionAPI 中间表删除相关记录
 */
exports.folderDestroy = async function (ctx) {
  const Folder = ctx.model.Folder;
  const result = await Folder.deleteOne({ _id: this.params.id });

  this.body = {
    status: 'success',
    data: result,
  };
};
