'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const projectSchema = new Schema({
    name: {
      type: String,
      required: true,
      unique: true,
    },
    desc: { type: String },
    spaceId: { type: String },
    auth: { type: String },
    public: { type: Boolean },
    owners: { type: Array },
    members: { type: Array },
    envs: { type: Array },
    gateways: { type: Array },
    accounts: { type: Array },
    smartDoc: { type: Boolean },
  }, {
    timestamps: true,
    toJSON: { virtuals: true },
  });

  projectSchema.virtual('space', {
    ref: 'Space',
    localField: 'spaceId',
    foreignField: '_id',
    justOne: true,
  });

  return mongoose.model('Project', projectSchema);
};
