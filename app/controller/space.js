'use strict';

const utils = require('../common/utils');
const { createFill, updateFill } = utils;

/**
 * @param {Object} ctx
 * this.params获取url中的:xx
 * this.query 获取url中的QueryString参数
 * this.request.body 获取请求body
 */
exports.index = async function (ctx) {
  const Space = ctx.model.Space;
  const list = await Space.find({ ...this.query });
  this.body = {
    status: 'success',
    data: list,
  };
};

exports.create = async function (ctx) {
  const Space = ctx.model.Space;
  const data = createFill(this.request.body);

  try {
    const result = await Space.create(data);
    this.body = {
      status: 'success',
      data: result,
    };
  } catch (err) {
    this.body = {
      status: 'fail',
      message: err.errmsg || '系统错误',
    };
  }
};

exports.update = async function (ctx) {
  const spaceModel = ctx.model.Space;
  const reqBody = this.request.body;

  try {
    const result = await spaceModel.updateOne({ _id: this.params.id }, { $set: updateFill(reqBody) });

    this.body = {
      status: 'success',
      data: result,
    };
  } catch (err) {
    this.body = {
      status: 'fail',
      message: err.errmsg || '系统错误',
    };
  }
};

exports.destroy = async function (ctx) {
  const spaceModel = ctx.model.Space;
  const result = await spaceModel.deleteOne({ _id: this.params.id });

  this.body = {
    status: 'success',
    data: result,
  };
};
