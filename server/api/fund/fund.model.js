'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var fundSchema = new Schema({
  name: "string",
  goal: Number,
  cash: Number,
  accountId: "string",
  stocks: [], //ticker symbol, purchase price, date, # of shares
  finalized: { type: Boolean, default: false },
  created: Date
});

module.exports = mongoose.model('Funds', fundSchema);