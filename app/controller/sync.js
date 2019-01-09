'use strict';

const swagger = require('../service/swagger');

/**
 * 同步 SPI Schema
 * @param {Object} ctx
 * this.params 获取url中的:xx
 * this.query 获取url中的QueryString参数
 * this.request.body 获取请求body
 */
exports.spiSync = async function (ctx) {
  try {
    const result = await swagger.sync(ctx.model, ctx.request.body);
    this.body = {
      status: 'success',
      data: result,
    };
  } catch (err) {
    this.body = {
      status: 'fail',
      msg: err.message,
    };
  }
};
