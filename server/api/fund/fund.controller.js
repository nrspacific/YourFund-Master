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
function UpdateInitializedFunds(selectedFund, res, updatedFund) {
  var investmentUpdateCount = 0;
  var selectedFundCash = selectedFund.goal;

  selectedFund.stocks.forEach(function (stock) {
    console.log('executing: fund.UpdateInitializedFunds');

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


          var currentPercentOfFund = ((stock.currentNumberOfShares * currentPrice) / selectedFund.goal) * 100;
          var cashForPurchase = (selectedFund.goal * (currentPercentOfFund / 100));
          var numberOfShares = cashForPurchase / currentPrice;
          var currentCashInvestment = (numberOfShares * currentPrice) * 100 / 100;

          console.log('stock.currentPrice: ' + currentPrice);
          console.log('stock.currentNumberOfShares: ' + numberOfShares);
          console.log('stock.currentPercentOfFund: ' + currentPercentOfFund);
          console.log('stock.currentCashInvestment: ' + currentCashInvestment);

          selectedFundCash -= cashForPurchase;

          fund.update(
            {
              '_id': mongoose.Types.ObjectId(selectedFund._id),
              'stocks._id': mongoose.Types.ObjectId(stock._id)
            },
            {
              $set: {
                'stocks.$.currentPrice': currentPrice,
                'stocks.$.created': Date(),
                'stocks.$.currentNumberOfShares': numberOfShares,
                'stocks.$.currentPercentOfFund': currentPercentOfFund,
                'stocks.$.currentCashInvestment': currentCashInvestment
              }
            },
            function (err, result) {
              if (err) {
                return handleError(result, err);
              }

              investmentUpdateCount++;

              if (selectedFund.stocks.length == investmentUpdateCount) {
                if (typeof updatedFund == "function") {
                  updatedFund(selectedFund);
                }
              }

              console.log('GetStockCurrentPrice: updating DB with current price for: ' + stock.symbol);
            });
        }
      }
    );
  });
}

function UpdatePreInitializedFunds(selectedFund, req, updatedFund) {

  var selectedFundCash = selectedFund.goal;
  var investmentUpdateCount = 0;

  selectedFund.stocks.forEach(function (stock) {

    console.log('GetStockCurrentPrice: updating DB with current price for: ' + stock.symbol);

    var stockRequestOptions = {
      url: 'http://finance.google.com/finance/info?q=' + stock.symbol,
      json: true
    };

    Request(stockRequestOptions, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        var result = JSON.parse(body.replace("//", ""));

        req.body.exchange = result[0].e;
        req.body.price = result[0].l; //Stock price
        var cashForPurchase = (selectedFund.goal * (stock.originalPercentOfFund / 100)); //goal is total amount invested
        var sharesToPurchase = (cashForPurchase / req.body.price) * 100 / 100;
        req.body.numberOfShares = sharesToPurchase;
        req.body.change = result[0].c; //Stock change
        var investmentAmount = req.body.numberOfShares * req.body.price; //Money invested
        //var percentOfFund = investmentAmount / selectedFund.goal * 100; //percent of fund allocated

        selectedFundCash -= cashForPurchase;

        fund.update(
          {
            '_id': mongoose.Types.ObjectId(selectedFund._id),
            'stocks._id': mongoose.Types.ObjectId(stock._id)
          },
          {
            $set: {
              'cash': selectedFundCash,
              'originalCash': selectedFundCash,
              'stocks.$.price': req.body.price,
              'stocks.$.created': Date(),
              'stocks.$.currentPrice': req.body.price,
              'stocks.$.numberOfShares': req.body.numberOfShares,
              'stocks.$.currentNumberOfShares': req.body.numberOfShares,

              //'stocks.$.currentPercentOfFund': percentOfFund,
              //'stocks.$.originalPercentOfFund': percentOfFund,
              //'stocks.$.currentCashInvestment': (req.body.numberOfShares * req.body.price) * 100 / 100,
              //'stocks.$.originalCashInvestment': (req.body.numberOfShares * req.body.price) * 100 / 100
            }
          },
          function (err, result) {
            if (err) {
              return handleError(result, err);
            }

            investmentUpdateCount++;

            if (selectedFund.stocks.length == investmentUpdateCount) {
              if (typeof updatedFund == "function") {
                updatedFund(selectedFund);
              }
            }
          });
      }
    })
  })
}

function logFundCashUpdate(updatedFund, action, cashDifference, res) {

  updatedFund.save(function (err) {
    if (err) {
      return handleError(res, err);
    }
    else {
      var total = Math.abs(cashDifference);
      transaction.create(
        {
          fundId: updatedFund._id,
          date: new Date(),
          symbol: 'YMMF',
          description: action + ' funds to/from YMMF',
          price: 1,
          action: action,
          numberOfShares: total,
          total: total,
          company: 'Your Money Market Fund',
          active: true,
          renderOnPreInit: true
        }, function (err, result) {
          if (err) {
            return handleError(result, err);
          }
          return res.json(200, updatedFund);
        });
    }
  });
}

function updateFundInvestementPercentages(updatedFund, cashDifference, action, res) {
  if (updatedFund.stocks.length > 0) {
    if (updatedFund.finalized == false) {
      updatedFund.stocks.forEach(function (stock) {
        fund.update(
          {'_id': mongoose.Types.ObjectId(updatedFund._id), 'stocks._id': mongoose.Types.ObjectId(stock._id)},
          {
            $set: {
              'stocks.$.originalPercentOfFund': ((stock.numberOfShares * stock.price) / updatedFund.goal) * 100
            }
          }, function (err, result) {
            if (err) {
              return handleError(result, err);
            }
            else {
              logFundCashUpdate(updatedFund, action, cashDifference, res);
            }
          }
        );
      });
    }
    else {
      updatedFund.stocks.forEach(function (stock) {
        fund.update(
          {'_id': mongoose.Types.ObjectId(updatedFund._id), 'stocks._id': mongoose.Types.ObjectId(stock._id)},
          {
            $set: {
              // 'stocks.$.originalPercentOfFund': ((stock.numberOfShares * stock.currentPrice) / updatedFund.goal) * 100,
              'stocks.$.currentPercentOfFund': ((stock.numberOfShares * stock.currentPrice) / updatedFund.goal) * 100
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
  else{
    updatedFund.save();
  }

  logFundCashUpdate(updatedFund, action, cashDifference, res);
}

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

    if (selectedFund && selectedFund.stocks){
      if (selectedFund.stocks.length > 0) {
        if (selectedFund.finalized == true) {
          UpdateInitializedFunds(selectedFund, res, function (selectedFund) {
            setPercentLeftToInvest(selectedFund);
            return res.send(selectedFund);
          });
        }
        else {

          UpdatePreInitializedFunds(selectedFund, req, function (selectedFund) {
            return res.send(selectedFund);
          });
        }
      }
      else {
        return res.send(selectedFund);
      }

      user.selectedFund = fund._id;
    }



    user.save(function (errs) {
      if (errs) {
        console.log(errs);
        return res.render('500');
      }

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
          action: 'Add',
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


  console.log('executing: fund.update');

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

    req.body.originalCash = req.body.cash;
    var updatedFund = _.merge(selectedFund, req.body);

    updateFundInvestementPercentages(updatedFund, cashDifference, action, res);
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

  fund.findById(req.params.id, function (err, fund) {
    if (err) {
      return handleError(res, err);
    }
    if (!fund) {
      return res.send(404);
    }

    fund.set({"finalized": true});
    fund.set({"originalCash": fund.cash});
    fund.save();

    userModel.update(
      {'_id': user._id, 'funds._id': mongoose.Types.ObjectId(req.params.id)},
      {$set: {'funds.$.finalized': true}},
      function (err, result) {
        if (err) {
          return handleError(result, err);
        }
        else {
          createFinalizedTransactions(res, fund);
          console.log(result);
        }
      });
  });

  function createFinalizedTransactions(res, updatedFund) {

    var sec = 0;


    updatedFund.stocks.forEach(function (stock) {

      var description = stock.action + ' ' + stock.description + ' ' + Math.floor(stock.numberOfShares * 100) / 100 + ' shares at $' + stock.price;

      ++sec;

      var datePlusOneSecond = new Date();
      datePlusOneSecond.setSeconds(sec);

      ++sec;

      var datePlusTwoSecond = new Date();
      datePlusTwoSecond.setSeconds(sec);

      transaction.create(
        {
          fundId: updatedFund._id,
          date: datePlusOneSecond,
          symbol: stock.symbol,
          description: description,
          price: stock.price,
          action: stock.action,
          numberOfShares: stock.numberOfShares,
          total: stock.price * stock.numberOfShares,
          company: stock.description,
          active: true
        },function (err, result) {}
      );

      transaction.create(
        {
          fundId: updatedFund._id,
          date: datePlusTwoSecond,
          symbol: 'YMMF',
          description: stock.action + ' ' + stock.description + ' ' + Math.floor(stock.numberOfShares * 100) / 100 + ' shares at $' + stock.price,
          price: 1,
          action: stock.action,
          numberOfShares: stock.price * stock.numberOfShares,
          total: stock.price * stock.numberOfShares,
          company: 'Your Money Market Fund',
          active: true
        },
        function (err, result) {}
      );

      console.log('saving YMMF transaction for stock purchase');

    });

    return res.send(204);
  }

};

function handleError(res, err) {
  return res.send(500, err);
}
