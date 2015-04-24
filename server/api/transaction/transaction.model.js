'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var transactionSchema = new Schema({
  name: String,
  fundId : String,
  action : String,
  date: Date,
  symbol : String,
  description: String,
  price :Number,
  numberOfShares : Number,
  total: Number,
  company : String,
  active: Boolean,
  renderOnPreInit: Boolean
});

module.exports = mongoose.model('transaction', transactionSchema);
