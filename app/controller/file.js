'use strict';

const utils = require('../common/utils');
const { createFill, updateFill } = utils;

/**
 * @param {Object} ctx
 * this.params获取url中的:xx
 * this.query 获取url中的QueryString参数
 * this.request.body 获取请求body
 */
exports.fileIndex = async function (ctx) {
  const File = ctx.model.File;
  const files = await File.find({ ...this.query });
  this.body = {
    status: 'success',
    data: files,
  };
};

exports.fileShow = async function (ctx) {
  const File = ctx.model.File;
  const detail = await File.findOne({
    _id: this.params.id,
  });

  this.body = {
    status: 'success',
    data: detail,
  };
};

exports.fileNew = async function (ctx) {
  const File = ctx.model.File;
  const reqBody = this.request.body;
  const file = reqBody.file;
  const result = await File.insertOne(createFill(file));

  this.body = {
    status: 'success',
    data: result,
  };
};

exports.fileUpdate = async function (ctx) {
  const File = ctx.model.File;
  const reqBody = this.request.body;
  const file = reqBody.file;
  const result = await File.updateOne({ _id: this.params.id }, { $set: updateFill(file) });

  this.body = {
    status: 'success',
    data: result,
  };
};

exports.fileDestroy = async function (ctx) {
  const File = ctx.model.File;
  const result = await File.deleteOne({ _id: this.params.id });

  this.body = {
    status: 'success',
    data: result,
  };
};
