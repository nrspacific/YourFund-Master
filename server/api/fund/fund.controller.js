/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /fund              ->  index
 * POST    /fund              ->  create
 * GET     /fund/:id          ->  show
 * PUT     /fund/:id          ->  update
 * DELETE  /fund/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var fund = require('./fund.model');



// Get list of things
exports.index = function(req, res) {

  var user = req.user;

  fund.find( function (err, fund)
  {
    if(err) { return handleError(res, err); }
    if(!fund) { return res.send(404); }
    return res.json(fund);
  });
};

// Get a single thing
exports.show = function(req, res) {
  fund.findById(req.params.id, function (err, fund) {
    if(err) { return handleError(res, err); }
    if(!fund) { return res.send(404); }
    return res.json(fund);
  });
};

// Creates a new thing in the DB.
exports.create = function(req, res) {
  fund.create(req.body, function(err, fund) {
    if(err) { return handleError(res, err); }
    return res.json(201, fund);
  });
};

// Updates an existing thing in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  fund.findById(req.params.id, function (err, fund) {
    if (err) { return handleError(res, err); }
    if(!fund) { return res.send(404); }
    var updated = _.merge(fund, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, fund);
    });
  });
};

// Deletes a thing from the DB.
exports.destroy = function(req, res) {
  fund.findById(req.params.id, function (err, fund) {
    if(err) { return handleError(res, err); }
    if(!fund) { return res.send(404); }
    fund.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}/**
 * Created by kyleb_000 on 2/24/2015.
 */
