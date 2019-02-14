'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const userSchema = new Schema({
    userId: { type: String },
    username: { type: String },
    avatar: { type: String },
    email: { type: Array },
    spaceId: { type: String }, // 当前选中空间
  }, {
    timestamps: true,
  });

  return mongoose.model('User', userSchema);
};
