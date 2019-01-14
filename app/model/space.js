'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const spaceSchema = new Schema({
    name: { type: String },
    desc: { type: String },
  }, {
    timestamps: true,
  });

  return mongoose.model('Space', spaceSchema);
};
