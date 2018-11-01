'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const collectionSchema = new Schema({
    parentId: { type: String },
    collectionId: { type: String },
    apiId: { type: String },
  }, {
    timestamps: true,
  });

  return mongoose.model('CollectionAPI', collectionSchema);
};
