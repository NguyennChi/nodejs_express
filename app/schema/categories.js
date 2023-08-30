const mongoose = require('mongoose');
const databaseConfig = require('../config/database');

const schema = new mongoose.Schema({
    name: String,
    status: String,
    ordering: Number,
    slug: String,
    created: {
      user_name: String,
      user_id: Number
    },
    menus:{
      id: String,
      slug: String
    },
    modify: {
      user_name: String,
      user_id: Number
    },
    editorData:String,
    parentId: String,
    acticles: [
    {type: mongoose.Schema.Types.ObjectId, ref: 'acticles'}
  ]
},
  { timestamps: true });

module.exports = mongoose.model(databaseConfig.COL_CATEGORIES, schema)