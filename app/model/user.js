'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const userSchema = new Schema({
    userId: { type: String },
    username: { type: String },
    password: { type: String },
    avatar: { type: String },
    email: { // 一个邮件只能注册一个账号
      type: String,
      required: true,
      unique: true,
    },
    githubId: { type: String },
    githubUsername: { type: String },
    githubAccessToken: { type: String },
    spaceId: { type: String }, // 当前选中空间
  },
    {
      timestamps: true,
    });

  return mongoose.model('User', userSchema);
};
