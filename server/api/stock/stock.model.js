'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var StockSchema = new Schema({
  symbol: "string",
  exchange: "string",
  price: "string",
  currentPrice: "string",
  description: "string",
  action: "string", //Buy or Sell
  originalPercentOfFund: "string",
  numberOfShares: Number,
  currentNumberOfShares: Number,
  currentCashInvestment: Number,
  originalCashInvestment: Number,
  currentPercentOfFund: "string",
  change: "string",
  explanation: "string",
  finalized: Boolean,
  active: Boolean,
  created: Date
});


module.exports = mongoose.model('Stock', StockSchema);
