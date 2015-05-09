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
var mongoose = require('mongoose');
var userModel = require('../user/user.model');
var transaction = require('../transaction/transaction.model');
var Request = require('request');
var Stock = require('../stock/stock.model');


function setPercentLeftToInvest(selectedFund) {
  var remainingInvestment = 100;

  selectedFund.stocks.forEach(function (stock) {
    if (selectedFund.stocks.length > 0 && selectedFund.finalized == true) {
      remainingInvestment -= stock.currentPercentOfFund;
    }
    else {
      remainingInvestment -= stock.originalPercentOfFund;
    }
  });

  selectedFund.set({"percentLeftToInvest": remainingInvestment});
}


// Get list of funds
exports.index = function (req, res) {

  fund.find(function (err, fund) {
    if (err) {
      return handleError(res, err);
    }
    if (!fund) {
      return res.send(404);
    }
    return res.json(fund);
  });
};

exports.getFund = function (req, res) {

  console.log('fund.controller: init');

  var user = req.user;

  fund.findById(req.params.id, function (err, selectedFund) {
    if (err) {
      return handleError(res, err);
    }
    if (!fund) {
      return res.send(404);
    }

    user.selectedFund = fund._id;

    user.save(function (errs) {
      if (errs) {
        console.log(errs);
        return res.render('500');
      }

      return res.json(selectedFund);

      console.log('saving user selectedFund');
    });
  });
};

// Get a single fund w/stock updates
exports.show = function (req, res) {

  console.log('fund.controller: init');

  var user = req.user;

  fund.findById(req.params.id, function (err, selectedFund) {
    if (err) {
      return handleError(res, err);
    }
    if (!fund) {
      return res.send(404);
    }


    if (selectedFund.stocks.length > 0) {
      selectedFund.stocks.forEach(function (stock) {

        var stockRequestOptions = {
          url: 'http://finance.google.com/finance/info?q=' + stock.symbol,
          json: true
        };

        console.log('GetStockCurrentPrice: getting current price for: ' + stock.symbol);

        Request(stockRequestOptions, function (error, response, body) {
            if (!error && response.statusCode === 200) {

              var result = JSON.parse(body.replace("//", ""));
              var currentPrice = result[0].l;
              console.log('GetStockCurrentPrice: current price for: ' + stock.symbol + ' - ' + currentPrice);

              var currentPercentOfFund = ((stock.numberOfShares * currentPrice) / selectedFund.goal) * 100;
              var cashForPurchase = (selectedFund.goal * (currentPercentOfFund / 100));

              console.log('stock.currentPrice: ' + currentPrice);
              console.log('stock.currentNumberOfShares: ' + cashForPurchase / currentPrice);
              console.log('stock.currentPercentOfFund: ' + currentPercentOfFund);

              fund.update(
                {'_id': mongoose.Types.ObjectId(selectedFund._id), 'stocks._id': mongoose.Types.ObjectId(stock._id)},
                {
                  $set: {
                    'stocks.$.currentPrice': currentPrice,
                    'stocks.$.currentNumberOfShares': cashForPurchase / currentPrice,
                    'stocks.$.currentPercentOfFund': currentPercentOfFund.toString()
                  }
                },
                function (err, result) {
                  if (err) {
                    return handleError(result, err);
                  }

                  console.log('GetStockCurrentPrice: updating DB with current price for: ' + stock.symbol);
                });
            }
          }
        );

        setPercentLeftToInvest(selectedFund);


        selectedFund.save(function (err) {
          if (err) {
            return handleError(res, err);
          }
        });

      });

    }

    user.selectedFund = fund._id;

    user.save(function (errs) {
      if (errs) {
        console.log(errs);
        return res.render('500');
      }

      return res.json(selectedFund);

      console.log('saving user selectedFund');
    });
  });
};

// Creates a new fund in the DB.
exports.create = function (req, res) {

  var user = req.user;

  fund.create(req.body, function (err, fund) {
    if (err) {
      return handleError(res, err);
    }

    console.log("create fund");

    user.funds.push(fund);
    user.selectedFund = fund._id;

    user.save(function (errs) {
      if (errs) {
        console.log(errs);
        return res.render('500');
      }

      transaction.create(
        {
          fundId: fund._id,
          date: new Date(),
          symbol: 'YMMF',
          description: 'Add money to YMMF',
          price: 1,
          action: 'Buy',
          numberOfShares: fund.cash,
          total: fund.cash,
          company: 'Your Money Market Fund',
          active: true,
          renderOnPreInit: true
        }, function (errs) {
          if (err) {
            return handleError(res, err);
          }

          console.log('fund.controller: saving fund transaction');
        });


      console.log('saving user fund');
    });

    return res.json(201, user);
  });

};

// Updates an existing fund in the DB.
exports.update = function (req, res) {
  if (req.body._id) {
    delete req.body._id;
  }

  function updateFundInvestementPercentages(updatedFund, selectedFund) {
    if (updatedFund.stocks.length > 0) {
      updatedFund.stocks.forEach(function (stock) {
        fund.update(
          {'_id': mongoose.Types.ObjectId(updatedFund._id), 'stocks._id': mongoose.Types.ObjectId(stock._id)},
          {
            $set: {
              'stocks.$.originalPercentOfFund': ((stock.numberOfShares * stock.price) / selectedFund.goal) * 100
            }
          }, function (err, result) {
            if (err) {
              return handleError(result, err);
            }
          }
        );
      });
    }
  }

  fund.findById(req.params.id, function (err, selectedFund) {
    if (err) {
      return handleError(res, err);
    }
    if (!selectedFund) {
      return res.send(404);
    }

    var cashDifference = req.body.cash - selectedFund.cash;

    var action = 'Add';

    if (req.body.cash <= selectedFund.cash) {
      action = 'Sell';
    }

    var updatedFund = _.merge(selectedFund, req.body);

    setPercentLeftToInvest(updatedFund);

    updatedFund.save(function (err) {
      if (err) {
        return handleError(res, err);
      }

      transaction.create(
        {
          fundId: fund._id,
          date: new Date(),
          symbol: 'YMMF',
          description: action + ' funds to/from YMMF',
          price: 1,
          action: action,
          numberOfShares: cashDifference,
          total: fund.cash,
          company: 'Your Money Market Fund',
          active: true,
          renderOnPreInit: true
        }, function (err, result) {
          if (err) {
            return handleError(result, err);
          }

          return res.json(200, updatedFund);

          console.log('fund.controller: Updating YMMF transaction');
        });
    });
  });
};

// Deletes a fund from the users fund collection.
exports.destroy = function (req, res) {

  var user = req.user;

  userModel.update({'_id': user._id},
    {$pull: {"funds": {_id: mongoose.Types.ObjectId(req.params.id)}}},
    function (err, result) {
      if (err) {
        return handleError(result, err);
      }
      else {
        console.log(result);
        return res.send(204);
      }
    });
};

exports.finalize = function (req, res) {

  var user = req.user;
  var selectedStock;

  fund.findById(req.params.id, function (err, fund) {
    if (err) {
      return handleError(res, err);
    }
    if (!fund) {
      return res.send(404);
    }

    fund.set({"finalized": true});
    fund.save();

    userModel.update(
      {'_id': user._id, 'funds._id': mongoose.Types.ObjectId(req.params.id)},
      {$set: {'funds.$.finalized': true}},
      function (err, result) {
        if (err) {
          return handleError(result, err);
        }
        else {
          console.log(result);
          return res.send(204);
        }
      });
  });

};


function handleError(res, err) {
  return res.send(500, err);
}
