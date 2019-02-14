'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const collectionSchema = new Schema({
    name: { type: String },
    desc: { type: String },
    accounts: { type: Array },
    spaceId: { type: String },
    parentId: { type: String },
    type: { type: String }, // file or folder
    owners: { type: Array },
    members: { type: Array },
    envs: { type: Array },
    public: { type: Boolean },
    auth: { type: String },
  }, {
    timestamps: true,
    toJSON: { virtuals: true },
  });

  collectionSchema.virtual('space', {
    ref: 'Space',
    localField: 'spaceId',
    foreignField: '_id',
    justOne: true,
  });

  return mongoose.model('Collection', collectionSchema);
};
