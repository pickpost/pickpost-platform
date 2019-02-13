'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const spaceSchema = new Schema({
    name: { type: String }, // 空间名称
    alias: { // 英文路径别名，唯一。格式要求：小写英文字符、中划线、下划线、数字
      type: String,
      required: true,
      unique: true,
    },
    desc: { type: String },
  }, {
    timestamps: true,
  });

  return mongoose.model('Space', spaceSchema);
};
