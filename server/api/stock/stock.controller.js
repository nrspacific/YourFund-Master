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

      fund.findById(req.body.fundId, function (err, selectedFund) {
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
        var sharesToPurchase = (cashForPurchase / req.body.price) * 100 / 100;
        req.body.numberOfShares = sharesToPurchase;
        req.body.change = result[0].c;


        function getNumberDecimalPlace(input,places){

          var factor = "1" + Array(+(places > 0 && places + 1)).join("0");
          return parseInt(input * factor) / factor;
        }


        Stock.create(req.body, function (err, stock) {
          if (err) {
            return handleError(res, err);
          }

          var investmentAmount = req.body.numberOfShares * req.body.price;
          var percentOfFund  =  investmentAmount / selectedFund.goal * 100;

          stock.currentPrice = req.body.price;
          stock.currentNumberOfShares = req.body.numberOfShares;
          stock.currentPercentOfFund = req.body.originalPercentOfFund;
          stock.originalPercentOfFund = req.body.originalPercentOfFund;
          stock.currentCashInvestment =  (req.body.numberOfShares * req.body.price)* 100 / 100;
          stock.originalCashInvestment =  (req.body.numberOfShares * req.body.price)* 100 / 100;

          console.log('stock:' + req.body.symbol + ' has been created');

          selectedFund.stocks.push(stock);

          selectedFund.cash = selectedFund.cash - investmentAmount;

          if (selectedFund.cash < 0) {
            selectedFund.cash = 0; //don't let this go in the negative
          }

          setPercentLeftToInvest(selectedFund);

          selectedFund.save(function (e) {
            if (e) {
              return handleError(res, err);
            }

            console.log('stock:' + req.body.symbol + ' has been added to fund: ' + req.body.fundId);
            var description = stock.action + ' ' + stock.description + ' ' + stock.numberOfShares + ' at $' +  stock.price;

            if(!selectedFund.finalized){
              transaction.remove( { fundId:selectedFund._id, symbol: req.body.symbol } );
            }

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
  var stockToUpdate = req.body.stockToUpdate;

  if (!req.body) { return res.send(400);}
  if (req.body._id) {delete req.body._id;}
  if (!stockToUpdate) {return res.send(404,'Missing stock to update');}

  fund.findById(req.body.fundId, function (err, selectedFund) {
    if (err) {
      return handleError(res, err);
    }

    if (!selectedFund) {
      return res.send(404, 'unable to locate fund');
    }

      var cashForPurchase = 0;
      var purchasePrice = 0;
      var amountToReturnToFund = 0;
      var stockStatus = true;

      if(selectedFund.finalized == true){
        cashForPurchase =(selectedFund.goal * (stockToUpdate.currentPercentOfFund / 100));
       // stockToUpdate.numberOfShares = cashForPurchase / stockToUpdate.currentPrice;
        purchasePrice = stockToUpdate.numberOfShares * stockToUpdate.currentPrice;
        amountToReturnToFund = stockToUpdate.numberOfShares * stockToUpdate.currentPrice;

        //Updated funds cash left
        stockToUpdate.numberOfShares = cashForPurchase / stockToUpdate.price;
        selectedFund.cash = selectedFund.cash + purchasePrice;
        selectedFund.cash = selectedFund.cash - cashForPurchase;
        //stockToUpdate.originalPercentOfFund =  stockToUpdate.currentPercentOfFund;
      }else{

        // Add funds back to fund
        if(req.body.originalAllocation){
          cashForPurchase =(selectedFund.goal * (req.body.originalAllocation / 100));
          stockToUpdate.numberOfShares = cashForPurchase / stockToUpdate.price;
          purchasePrice = stockToUpdate.numberOfShares * stockToUpdate.price;

          selectedFund.cash = selectedFund.cash + purchasePrice;
        }

        cashForPurchase =(selectedFund.goal * (stockToUpdate.originalPercentOfFund / 100));
        stockToUpdate.numberOfShares = cashForPurchase / stockToUpdate.price;
        purchasePrice = stockToUpdate.numberOfShares * stockToUpdate.price;

        //Updated funds cash left
        selectedFund.cash = selectedFund.cash - purchasePrice;
      }


      if(selectedFund.finalized == true){
        if(stockToUpdate.currentPercentOfFund == 0){
          stockStatus = false;
        }
      }else{
        if(stockToUpdate.originalPercentOfFund == 0){
          stockStatus = false;
        }
      }

     stockToUpdate.active = stockStatus;

     console.log('Updating fund:' + selectedFund.name + ' stock: ' + stockToUpdate.symbol);


    if(selectedFund.finalized == true){
      fund.update(
        {'_id': req.body.fundId, 'stocks._id': mongoose.Types.ObjectId(stockToUpdate._id)},
        {$set: {'stocks.$.currentPercentOfFund': stockToUpdate.currentPercentOfFund,
                'stocks.$.originalPercentOfFund': stockToUpdate.originalPercentOfFund,
                'stocks.$.currentNumberOfShares': stockToUpdate.numberOfShares,
                'stocks.$.currentCashInvestment': stockToUpdate.currentCashInvestment,
                'stocks.$.originalCashInvestment': stockToUpdate.originalCashInvestment,
                'stocks.$.active': stockToUpdate.active
        }},function (err, result) {
          if (err) {
            return handleError(result, err);
          }
          else {
            var action = 'Buy';

            if(stockToUpdate.action == 'buy'){
              action = 'Sell';
            }

            transaction.create(
              {
                fundId: selectedFund._id,
                date: new Date(),
                symbol: 'YMMF',
                description: stockToUpdate.action + ' ' + stockToUpdate.description + ' ' + stockToUpdate.numberOfShares + ' at $' +  stockToUpdate.price,
                price: 1,
                action: action,
                numberOfShares: stockToUpdate.numberOfShares,
                total: stockToUpdate.price * stockToUpdate.numberOfShares,
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
                symbol: stockToUpdate.symbol,
                description: stockToUpdate.action + ' ' + stockToUpdate.description + ' ' + stockToUpdate.numberOfShares + ' at $' +  stockToUpdate.price,
                price: stockToUpdate.price,
                action: stockToUpdate.action,
                numberOfShares: stockToUpdate.numberOfShares,
                total: stockToUpdate.price * stockToUpdate.numberOfShares,
                company: stockToUpdate.description,
                active: true
              },function (err, result) {
                if (err) {
                  return handleError(result, err);
                }
                console.log('saving fund transaction for stock purchase');
              });

            console.log('Updating fund:' + user.selectedFund + ' stock: ' + stockToUpdate.symbol);

          }
        });
    }
    else{
      fund.update(
        {'_id': req.body.fundId, 'stocks._id': mongoose.Types.ObjectId(stockToUpdate._id)},
        {$set: {'stocks.$.originalPercentOfFund': stockToUpdate.originalPercentOfFund,
                'stocks.$.numberOfShares': stockToUpdate.numberOfShares,
                'stocks.$.active': stockToUpdate.active
        }},function (err, result) {
          if (err) {
            return handleError(result, err);
          }
          else {
            var action = 'Buy';

            if(stockToUpdate.action == 'buy'){
              action = 'Sell';
            }

            transaction.create(
              {
                fundId: selectedFund._id,
                date: new Date(),
                symbol: 'YMMF',
                description: stockToUpdate.action + ' ' + stockToUpdate.description + ' ' + stockToUpdate.numberOfShares + ' at $' +  stockToUpdate.price,
                price: 1,
                action: action,
                numberOfShares: stockToUpdate.numberOfShares,
                total: stockToUpdate.price * stockToUpdate.numberOfShares,
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
                symbol: stockToUpdate.symbol,
                description: stockToUpdate.action + ' ' + stockToUpdate.description + ' ' + stockToUpdate.numberOfShares + ' at $' +  stockToUpdate.price,
                price: stockToUpdate.price,
                action: stockToUpdate.action,
                numberOfShares: stockToUpdate.numberOfShares,
                total: stockToUpdate.price * stockToUpdate.numberOfShares,
                company: stockToUpdate.description,
                active: true
              },function (err, result) {
                if (err) {
                  return handleError(result, err);
                }
                console.log('saving fund transaction for stock purchase');
              });

            console.log('Updating fund:' + user.selectedFund + ' stock: ' + stockToUpdate.symbol);

          }
        });
    }








    setPercentLeftToInvest(selectedFund);

    selectedFund.save(function (errs) {
      if (errs) {
        console.log(errs);
        return res.render('500');
      }
      return res.send(204);


    });

  })
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

    fund.update({'_id': req.body.fundId},
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

    fund.findById(req.body.fundId, function (err, fund) {
      if (err) {
        return handleError(res, err);
      }
      if (!stock) {
        return res.send(404);
      }

      var updatedCash = fund.cash + (stock.price * stock.numberOfShares);

      fund.set({"cash": updatedCash});

      setPercentLeftToInvest(fund);

      fund.save();

      return res.send(204);

    });

  });
};

function handleError(res, err) {
  return res.send(500, err);
}
