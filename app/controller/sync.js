'use strict';

const fs = require('fs');
const fsExtra = require('fs-extra');
const path = require('path');
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
  const target = path.join('app/public/upload', filename);

  fsExtra.ensureDirSync('app/public/upload');
  const writeStream = fs.createWriteStream(target);

  try {
    // 写入文件
    await pump(stream, writeStream);
    const resultFile = fs.readFileSync(target, 'utf8');
    console.log(resultFile);
    const result = await swagger.sync(ctx.model, resultFile);
    this.body = {
      status: 'success',
      data: result,
    };
  } catch (err) {
    this.body = {
      status: 'fail',
      msg: err.message,
    };
  } finally {
    fsExtra.remove(target);
  }
};
