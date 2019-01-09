'use strict';

const fs = require('fs');
const path = require('path');
const sendToWormhole = require('stream-wormhole');
const pump = require('mz-modules/pump');
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
/**
 * 上传swagger文档接口
 * @param {Object} ctx
 * this.params 获取url中的:xx
 * this.query 获取url中的QueryString参数
 * this.request.body 获取请求body
 */
exports.uploadSwagger = async function (ctx) {
  const stream = await ctx.getFileStream();
  const filename = Date.now() + '' + Number.parseInt(Math.random() * 10000) + path.extname(stream.filename);
  const target = path.join('app/public', filename);
  const writeStream = fs.createWriteStream(target);
  try {
    // 写入文件
    const resultFile = await pump(stream, writeStream);
    const result = await swagger.sync(ctx.model, resultFile);
    ctx.body = result;
  } catch (err) {
    // 必须将上传的文件流消费掉，要不然浏览器响应会卡死
    await sendToWormhole(stream);
    this.body = {
      status: 'fail',
      msg: err.message,
    };
  }
};
