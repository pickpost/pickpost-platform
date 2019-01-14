'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const starSchema = new Schema({
    type: { type: String },
    targetId: { type: String },
    userId: { type: String },
    spaceId: { type: String },
  }, {
    timestamps: true,
  });

  return mongoose.model('Star', starSchema);
};
