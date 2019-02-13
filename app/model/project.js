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
  });

  return mongoose.model('Project', projectSchema);
};
