const mongoose = require('mongoose');
const databaseConfig = require('../config/database');

const schema = new mongoose.Schema({
    name: String,
    slug: String,
    categoriesId: String,
    position: String,
    categories: [
      {type: mongoose.Schema.Types.ObjectId, ref: 'categories'}
    ],
    status: String,
    ordering: Number,
    thumb: String,
    created: {
      user_name: String,
      user_id: Number
    },
    modify: {
      user_name: String,
      user_id: Number
    },
    editorData:String

  },
  { timestamps: true });

module.exports = mongoose.model(databaseConfig.COL_ACTICLES, schema)