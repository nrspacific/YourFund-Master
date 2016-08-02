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

  var symbol = req.params.id;

  var options = {
    url: 'http://finance.google.com/finance/info?q=' + symbol,
    json: true
  };

  console.log('Getting stock:' + symbol );

  Request(options, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      var result = JSON.parse(body.replace("//", ""));

      console.log('Returned stock:' + symbol );

      var stock = {};
      stock.currentPrice = result[0].l;

      return res.json(200, stock);
    }
  });
};

// Get a single stock
exports.getCompany = function (req, res) {

  var symbol = req.params.symbol;

  var options = {
    url: 'http://dev.markitondemand.com/MODApis/Api/v2/Lookup/JSON/?input=' + symbol
  };

  console.log('Getting stock:' + symbol );

  Request(options, function (error, response) {
    if (!error && response.statusCode === 200) {

      console.log('Returned stock:' + symbol );

      return res.json(response);
    }
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

  console.log('executing: stock.Create');

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
        var cashForPurchase = req.body.tradeAmountCash;
        var sharesToPurchase = (cashForPurchase / req.body.price) * 100 / 100;
        req.body.numberOfShares = sharesToPurchase;
        req.body.change = result[0].c;


        Stock.create(req.body, function (err, stock) {
          if (err) {
            return handleError(res, err);
          }

          var investmentAmount = req.body.numberOfShares * req.body.price;

          stock.currentPrice = req.body.price;
          stock.currentNumberOfShares = req.body.numberOfShares;
          stock.currentPercentOfFund = req.body.originalPercentOfFund;
          stock.originalPercentOfFund = req.body.originalPercentOfFund;
          stock.currentCashInvestment =  req.body.numberOfShares * req.body.price * 100 / 100;
          stock.originalCashInvestment =  req.body.numberOfShares * req.body.price * 100 / 100;

          console.log('stock:' + req.body.symbol + ' has been created');

          selectedFund.stocks.push(stock);

          selectedFund.cash = selectedFund.cash - investmentAmount;

          if (selectedFund.cash < 0) {
            selectedFund.cash = 0; //don't let this go in the negative
          }

          selectedFund.originalCash = selectedFund.cash;

          setPercentLeftToInvest(selectedFund);

          selectedFund.save(function (e) {
            if (e) {
              return handleError(res, err);
            }

            console.log('stock:' + req.body.symbol + ' has been added to fund: ' + req.body.fundId);

            var description = stock.action + ' ' + stock.description + ' ' + stock.numberOfShares.toFixedDown(2) + ' shares at $' +  stock.price;

            if(stock.action == 'buy' || stock.action == 'Buy'){
              stock.action = 'Buy'
            }
            else
            {
              stock.action = 'Sell'
            }

            if(selectedFund.finalized){

              transaction.create(
                {
                  fundId: selectedFund._id,
                  date: new Date() ,
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

              var datePlusOneSecond = new Date();
              datePlusOneSecond.setSeconds(datePlusOneSecond.getSeconds() + 5);

              transaction.create(
                {
                  fundId: selectedFund._id,
                  date: datePlusOneSecond,
                  symbol: 'YMMF',
                  description: stock.action + ' ' + stock.description + ' ' + stock.numberOfShares.toFixedDown(2) + ' shares at $' +  stock.price,
                  price: 1,
                  action: stock.action,
                  numberOfShares: stock.price * stock.numberOfShares,
                  total:  stock.price * stock.numberOfShares,
                  company: 'Your Money Market Fund',
                  active: true
                },
                function (err, result) {
                  if (err) {
                    return handleError(result, err);
                  }
                  console.log('saving YMMF transaction for stock purchase');
                });
            }

            return res.json(201, selectedFund);
          });
        }); //Stock.create
      });//fund.findById
    }
  });
};

Number.prototype.toFixedDown = function(digits) {
  var re = new RegExp("(\\d+\\.\\d{" + digits + "})(\\d)"),
    m = this.toString().match(re);
  return m ? parseFloat(m[1]) : this.valueOf();
};


// Updates an existing stock in the DB.
exports.update = function (req, res) {

  var user = req.user;
  var stockToUpdate = req.body.stockToUpdate;
  var fundToUpdate = req.body.fundToUpdate;
  var tradeAmount = req.body.tradeAmount;
  var tradeShares = req.body.tradeShares;
  var action = req.body.action;

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
        stockToUpdate.numberOfShares = stockToUpdate.currentNumberOfShares;

        purchasePrice = tradeAmount;

        //Updated funds cash left
        if(action == 'sell'){
          selectedFund.cash = parseFloat(selectedFund.cash) + parseFloat(purchasePrice);
          selectedFund.originalCash = selectedFund.cash;
        }
        else{
          selectedFund.cash = parseFloat(selectedFund.cash) - parseFloat(purchasePrice);
          selectedFund.originalCash = selectedFund.cash;
        }

        //Sell All
        if(action == 'sellall'){
          stockToUpdate.active = false;
          var investmentDiff = stockToUpdate.currentCashInvestment - stockToUpdate.originalCashInvestment;
          selectedFund.originalCash = parseFloat(fundToUpdate.originalCash) + parseFloat(stockToUpdate.originalCashInvestment);
          selectedFund.cash = parseFloat(fundToUpdate.cash) + parseFloat(stockToUpdate.currentCashInvestment);
          stockToUpdate.currentCashInvestment = 0;
        }
      }
      else
      {
        if(req.body.originalAllocation){
          cashForPurchase =(selectedFund.goal * (stockToUpdate.originalPercentOfFund / 100));
          stockToUpdate.numberOfShares = cashForPurchase / stockToUpdate.price;
          purchasePrice = stockToUpdate.numberOfShares * stockToUpdate.price;

          var cashToReturn =(selectedFund.goal * (req.body.originalAllocation / 100));

          selectedFund.cash = selectedFund.cash + cashToReturn;
          selectedFund.cash =  parseFloat(selectedFund.cash) -  parseFloat(purchasePrice);
          selectedFund.originalCash =  selectedFund.cash ;
        }
      }

     console.log('Updating fund:' + selectedFund.name + ' stock: ' + stockToUpdate.symbol);

     if(selectedFund.finalized == true){

      fund.update(
        {'_id': req.body.fundId, 'stocks._id': mongoose.Types.ObjectId(stockToUpdate._id)},
        {$set: {'cash': selectedFund.cash,
                'originalCash' : selectedFund.originalCash,
                'stocks.$.currentPercentOfFund': stockToUpdate.currentPercentOfFund,
                'stocks.$.originalPercentOfFund': stockToUpdate.originalPercentOfFund,
                'stocks.$.currentNumberOfShares': stockToUpdate.currentNumberOfShares,
                'stocks.$.currentCashInvestment': stockToUpdate.currentCashInvestment,
                'stocks.$.originalCashInvestment': stockToUpdate.originalCashInvestment,
                'stocks.$.active': stockToUpdate.active
        }},function (err, result) {
          if (err) {
            return handleError(result, err);
          }
          else {

            if(stockToUpdate.action == 'buy'){
              stockToUpdate.action = 'Buy'
            }
            else
            {
              stockToUpdate.action = 'Sell'
            }

            if(!tradeAmount){
              tradeAmount = stockToUpdate.currentNumberOfShares.toFixedDown(2);
            }

            var datePlusOneSecond = new Date();
            datePlusOneSecond.setSeconds(datePlusOneSecond.getSeconds() + 1);

            transaction.create(
              {
                fundId: selectedFund._id,
                date: new Date(),
                symbol: stockToUpdate.symbol,
                description: stockToUpdate.action + ' ' + stockToUpdate.description + ' ' + tradeShares.toFixedDown(2) + ' shares at $' +  stockToUpdate.currentPrice,
                price: stockToUpdate.currentPrice,
                action: stockToUpdate.action,
                numberOfShares: tradeShares,
                total: tradeAmount,
                company: stockToUpdate.description,
                active: true
              },function (err, result) {
                if (err) {
                  return handleError(result, err);
                }
                console.log('saving fund transaction for stock purchase');
              });

            transaction.create(
              {
                fundId: selectedFund._id,
                date: datePlusOneSecond,
                symbol: 'YMMF',
                description: stockToUpdate.action + ' ' + stockToUpdate.description + ' ' + tradeShares.toFixedDown(2)  + ' shares at $' +  stockToUpdate.currentPrice,
                price: 1,
                action: stockToUpdate.action,
                numberOfShares: tradeShares,
                total: tradeAmount,
                company: 'Your Money Market Fund',
                active: true
              },
              function (err, result) {
                if (err) {
                  return handleError(result, err);
                }
                console.log('saving YMMF fund transaction for stock purchase');
              });

            console.log('Updating fund:' + user.selectedFund + ' stock: ' + stockToUpdate.symbol);
          }

        });
    }
    else{
      fund.update(
        {'_id': req.body.fundId, 'stocks._id': mongoose.Types.ObjectId(stockToUpdate._id)},
        {$set: {'cash': selectedFund.cash,
                'originalCash' : selectedFund.cash,
                'stocks.$.originalPercentOfFund': stockToUpdate.originalPercentOfFund,
                'stocks.$.currentPercentOfFund': stockToUpdate.originalPercentOfFund,
                'stocks.$.currentNumberOfShares': stockToUpdate.numberOfShares,
                'stocks.$.numberOfShares': stockToUpdate.numberOfShares,
                'stocks.$.originalCashInvestment': stockToUpdate.currentPrice * stockToUpdate.numberOfShares,
                'stocks.$.currentCashInvestment': stockToUpdate.currentPrice * stockToUpdate.numberOfShares,
                'stocks.$.active': stockToUpdate.active
        }},function (err, result) {
          if (err) {
            return handleError(result, err);
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
            selectedFund.originalCash = selectedFund.cash;
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
      fund.set({"originalCash": updatedCash});

      setPercentLeftToInvest(fund);

      fund.save();

      return res.send(204);

    });

  });
};

function handleError(res, err) {
  return res.send(500, err);
}
