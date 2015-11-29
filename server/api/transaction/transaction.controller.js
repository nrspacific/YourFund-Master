'use strict';

var _ = require('lodash');
var transaction = require('./transaction.model');

// Get list of transactions
exports.index = function(req, res) {
  transaction.find(function (err, transactions) {
    if(err) { return handleError(res, err); }
    return res.json(200, transactions);
  });
};

// Get a single transaction
exports.show = function(req, res) {

  transaction.find( { fundId: req.params.id },function (err, transaction) {
    if(err) { return handleError(res, err); }
    if(!transaction) { return res.send(404); }
    return res.json(transaction);
  });


  //transaction.findById(req.params.id, function (err, transaction) {
  //  if(err) { return handleError(res, err); }
  //  if(!transaction) { return res.send(404); }
  //  return res.json(transaction);
  //});

};

// Creates a new transaction in the DB.
exports.create = function(req, res) {
  transaction.create(req.body, function(err, transaction) {
    if(err) { return handleError(res, err); }
    return res.json(201, transaction);
  });
};

// Updates an existing transaction in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }

  transaction.findById(req.params.id, function (err, transaction) {
    if (err) { return handleError(res, err); }
    if(!transaction) { return res.send(404); }
    var updated = _.merge(transaction, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, transaction);
    });
  });




};

// Deletes a transaction from the DB.
exports.destroy = function(req, res) {
  transaction.findById(req.params.id, function (err, transaction) {
    if(err) { return handleError(res, err); }
    if(!transaction) { return res.send(404); }
    transaction.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
