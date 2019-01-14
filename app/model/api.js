'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const apiSchema = new Schema({
    projectId: { type: String },
    apiType: { type: String },
    name: { type: String },
    desc: { type: String },
    methods: { type: Array },
    url: { type: String },
    paramIndex: { type: Number },
    params: { type: Array },
    headerIndex: { type: Number },
    headers: { type: Array },
    requestIndex: { type: Number },
    requests: { type: Array },
    responseIndex: { type: Number },
    responses: { type: Array },
    requestSchema: { type: Object },
    responseSchema: { type: Object },
    requestAutoSchema: { type: Object },
    responseAutoSchema: { type: Object },
    creater: { type: Object },
    swaggerSyncAt: { type: Date },
  }, {
    timestamps: true,
  });

  return mongoose.model('API', apiSchema);
};
