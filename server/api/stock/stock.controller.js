'use strict';

var _ = require('lodash');
var Stock = require('./stock.model');
var fund = require('../fund/fund.model');
var userModel = require('../user/user.model');
var mongoose = require('mongoose');
var Request = require('request');

// Get list of stocks
exports.index = function (req, res) {
  Stock.find(function (err, stocks) {
    if (err) {
      return handleError(res, err);
    }
    return res.json(200, stocks);
  });
};

// Get a single stock
exports.show = function (req, res) {
  Stock.findById(req.params.id, function (err, stock) {
    if (err) {
      return handleError(res, err);
    }
    if (!stock) {
      return res.send(404);
    }
    return res.json(stock);
  });
};

// Creates a new stock in the DB.
exports.create = function (req, res) {

  var symbol = req.body.symbol;
  var selectedFund;
  var user = req.user;

  var options = {
    url: 'http://finance.google.com/finance/info?q=' + symbol,
    json: true
  };

  Request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var result = JSON.parse(body.replace("//", ""));

      fund.findById(user.selectedFund, function (err, selectedFund) {
        if (err) {
          return handleError(res, err);
        }
        if (!selectedFund) {
          return res.send(404);
        }

        console.log('Adding stock:' + req.body.symbol + ' to fund: ' + selectedFund.Name);

        req.body.exchange = result[0].e;
        req.body.price = result[0].l;
        var cashForPurchase = (selectedFund.goal * (req.body.originalPercentOfFund / 100));
        req.body.numberOfShares = cashForPurchase / req.body.price;
        req.body.change =  result[0].c;

        Stock.create(req.body, function (err, stock) {
          if (err) {
            return handleError(res, err);
          }

          console.log('stock:' + req.body.symbol + ' has been created');

          selectedFund.stocks.push(stock);

          selectedFund.cash = selectedFund.cash - cashForPurchase;

          if (selectedFund.cash < 0) {
            selectedFund.cash = 0; //don't let this go in the negative
          }

          selectedFund.save(function (e) {
            if (e) {
              return handleError(res, err);
            }

            console.log('stock:' + req.body.symbol + ' has been added to fund: ' + req.body.fundId);

            return res.json(201, selectedFund);
          });
        }); //Stock.create
      });//fund.findById
    }
  });
};

// Updates an existing stock in the DB.
exports.update = function (req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  Stock.findById(req.params.id, function (err, stock) {
    if (err) {
      return handleError(res, err);
    }
    if (!stock) {
      return res.send(404);
    }
    var updated = _.merge(stock, req.body);
    updated.save(function (err) {
      if (err) {
        return handleError(res, err);
      }
      return res.json(200, stock);
    });
  });
};

// Deletes a stock from the DB.
exports.destroy = function (req, res) {
  Stock.findById(req.params.id, function (err, stock) {
    if (err) {
      return handleError(res, err);
    }
    if (!stock) {
      return res.send(404);
    }
    stock.remove(function (err) {
      if (err) {
        return handleError(res, err);
      }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
