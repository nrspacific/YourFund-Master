'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var fundSchema = new Schema({
  name: "string",
  originalGoal: Number,
  goal: Number,
  cash: Number,
  originalCash: Number,
  accountId: "string",
  stocks: [], //ticker symbol, purchase price, date, # of shares
  finalized: { type: Boolean, default: false },
  created: Date,
  selectedFund :"string",
  percentLeftToInvest: Number
});

module.exports = mongoose.model('Funds', fundSchema);
