const mongoose = require('mongoose');
const databaseConfig = require('./../config/database');

const Schema = new mongoose.Schema({
    Setting: []

  },
  { timestamps: true });

module.exports = mongoose.model(databaseConfig.COL_SETTING, Schema)