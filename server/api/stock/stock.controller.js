'use strict';

var _ = require('lodash');
var Stock = require('./stock.model');
var fund = require('../fund/fund.model');
var userModel = require('../user/user.model');
var mongoose = require('mongoose');
var Request = require('request');
var transaction = require('../transaction/transaction.model');


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
    if (!error && response.statusCode === 200) {
      var result = JSON.parse(body.replace("//", ""));

      console.log("stockConroller.add - returning result for symbol:" + symbol + " ["  + JSON.stringify(body) + "]");

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
        req.body.change = result[0].c;

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
            var description = stock.action + ' ' + stock.description + ' ' + stock.numberOfShares + ' at $' +  stock.price;

            transaction.create(
              {
                fundId: selectedFund._id,
                date: new Date(),
                symbol: 'YMMF',
                description: description,
                price: 1,
                action: stock.action,
                numberOfShares: stock.numberOfShares,
                total: stock.price * stock.numberOfShares,
                company: 'Your Money Market Fund',
                active: true
              },
              function (err, result) {
                if (err) {
                  return handleError(result, err);
                }
                console.log('saving YMMF transaction for stock purchase');
              });


            var datePlusOneSecond = new Date();
            datePlusOneSecond.setSeconds(datePlusOneSecond.getSeconds() + 1);

            transaction.create(
              {
                fundId: selectedFund._id,
                date: datePlusOneSecond ,
                symbol: req.body.symbol,
                description: description,
                price: req.body.price,
                action: stock.action,
                numberOfShares: req.body.numberOfShares,
                total: req.body.price * req.body.numberOfShares,
                company: stock.description,
                active: true
              },
              function (err, result) {
                if (err) {
                  return handleError(result, err);
                }
                console.log('saving YMMF transaction for stock purchase');
              });



            return res.json(201, selectedFund);
          });
        }); //Stock.create
      });//fund.findById
    }
  });
};

// Updates an existing stock in the DB.
exports.update = function (req, res) {

  var user = req.user;

  if (!req.body) {
    return res.send(400);
  }

  if (req.body._id) {
    delete req.body._id;
  }

  fund.findById(user.selectedFund, function (err, selectedFund) {
    if (err) {
      return handleError(res, err);
    }
    if (!selectedFund) {
      return res.send(404);
    }

    Stock.findById(req.params.id, function (err, stock) {
      if (err) {
        return handleError(res, err);
      }
      if (!stock) {
        return res.send(404);
      }

      var cashForPurchase = (selectedFund.goal * (req.body.originalPercentOfFund / 100));

      req.body.numberOfShares = cashForPurchase / req.body.price;

      var purchasePrice = req.body.numberOfShares * req.body.price;
      var amountToReturnToFund = stock.numberOfShares * req.body.price;

      selectedFund.cash = selectedFund.cash + amountToReturnToFund;
      selectedFund.cash = selectedFund.cash - purchasePrice;

      selectedFund.save(function (e) {
        if (e) {
          return handleError(res, err);
        }
      });

      var updatedStock = _.merge(stock, req.body);

      updatedStock.save(function (err) {
        if (err) {
          return handleError(res, err);
        }
      });

      console.log('Updating fund:' + selectedFund.name + ' stock: ' + updatedStock.symbol);

      fund.update(
        {'_id': user.selectedFund, 'stocks._id': mongoose.Types.ObjectId(updatedStock._id)},
        {$set: {'stocks.$.originalPercentOfFund': updatedStock.originalPercentOfFund,
                'stocks.$.numberOfShares': updatedStock.numberOfShares
                }},
          function (err, result) {
            if (err) {
              return handleError(result, err);
            }
            else {
              var action = 'Buy';

              if(updatedStock.action == 'buy'){
                action = 'Sell';
              }

              transaction.create(
                {
                  fundId: selectedFund._id,
                  date: new Date(),
                  symbol: 'YMMF',
                  description: updatedStock.action + ' ' + updatedStock.description + ' ' + req.body.numberOfShares + ' at $' +  req.body.price,
                  price: 1,
                  action: action,
                  numberOfShares: req.body.numberOfShares,
                  total: req.body.price * req.body.numberOfShares,
                  company: 'Your Money Market Fund',
                  active: true
                },
                function (err, result) {
                  if (err) {
                    return handleError(result, err);
                  }
                  console.log('saving YMMF fund transaction for stock purchase');
                });

              var datePlusOneSecond = new Date();
              datePlusOneSecond.setSeconds(datePlusOneSecond.getSeconds() + 1);

              transaction.create(
                  {
                    fundId: selectedFund._id,
                    date: datePlusOneSecond,
                    symbol: updatedStock.symbol,
                    description: updatedStock.action + ' ' + updatedStock.description + ' ' + req.body.numberOfShares + ' at $' +  req.body.price,
                    price: req.body.price,
                    action: updatedStock.action,
                    numberOfShares: req.body.numberOfShares,
                    total: req.body.price * req.body.numberOfShares,
                    company: updatedStock.description,
                    active: true
                  },function (err, result) {
                  if (err) {
                    return handleError(result, err);
                  }
                  console.log('saving fund transaction for stock purchase');
                });

            console.log('Updating fund:' + user.selectedFund + ' stock: ' + updatedStock.symbol);
            return res.send(204);
          }
        });

    });

  });

};


// Updates an existing stock in the DB.
exports.trade = function (req, res) {

  var user = req.user;

  if (!req.body) {
    return res.send(400);
  }

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

      fund.findById(user.selectedFund, function (err, selectedFund) {
        if (err) {
          return handleError(res, err);
        }
        if (!selectedFund) {
          return res.send(404);
        }
          if(req.params.action === 'buy'){

            var amountToPurchase = req.params.amount * stock.price;
            stock.originalPercentOfFund  = parseInt(stock.originalPercentOfFund) + parseInt(req.params.amount);
            selectedFund.cash = selectedFund.cash - amountToPurchase;

            stock.save();
            selectedFund.save();
          }
          else{

          }
      });



  });

};

// Deletes a stock from the DB.
exports.destroy = function (req, res) {
  var user = req.user;
  var selectedStock;

  Stock.findById(req.params.id, function (err, stock) {
    if (err) {
      return handleError(res, err);
    }
    if (!stock) {
      return res.send(404);
    }

    console.log(stock);

    fund.update({'_id': user.selectedFund},
      {$pull: {"stocks": {_id: mongoose.Types.ObjectId(req.params.id)}}},
      function (err, result) {
        if (err) {
          return handleError(result, err);
        }
        else {
          // return res.send(204);
          console.log(result);
        }
      });

    fund.findById(user.selectedFund, function (err, fund) {
      if (err) {
        return handleError(res, err);
      }
      if (!stock) {
        return res.send(404);
      }

      var updatedCash = fund.cash + (stock.price * stock.numberOfShares);

      fund.set({"cash": updatedCash});
      fund.save();

      return res.send(204);

    });

  });
};

function handleError(res, err) {
  return res.send(500, err);
}
