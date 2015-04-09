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

// Get list of funds
exports.index = function(req, res) {

  fund.find( function (err, fund)
  {
    if(err) { return handleError(res, err); }
    if(!fund) { return res.send(404); }
    return res.json(fund);
  });
};

// Get a single fund
exports.show = function(req, res) {

  var user = req.user;

  fund.findById(req.params.id, function (err, fund) {
    if(err) { return handleError(res, err); }
    if(!fund) { return res.send(404); }

    var percentLeftToInvest = 0;
    var remainingInvestment = 100;

    if(fund.stocks.length > 0){
      fund.stocks.forEach(function(s) {
        remainingInvestment-= s.originalPercentOfFund;
      }) ;
    }

    fund.percentLeftToInvest = remainingInvestment;

    user.selectedFund = fund._id;

    user.save(function (errs) {
      if (errs) {
        console.log(errs);
        return res.render('500');
      }
      console.log('saving user selectedFund');
    });

    return res.json(fund);
  });
};

// Creates a new fund in the DB.
exports.create = function(req, res) {

  var user = req.user;

  fund.create(req.body, function(err, fund) {
    if(err) {
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
            numberOfShares: fund.cash,
            total: fund.cash,
            company: 'Your Money Market Fund',
            active: true
          }, function (errs) {
          if (err) { return handleError(res, err); }

          console.log('saving fund transaction');
        });


      console.log('saving user fund');
    });

    return res.json(201, user);
  });

};

// Updates an existing fund in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  fund.findById(req.params.id, function (err, fund) {
    if (err) { return handleError(res, err); }
    if(!fund) { return res.send(404); }

    var cashDifference = req.body.cash - fund.cash ;
    var action = 'add';

    if(req.body.cash < fund.cash){
      action = 'remove';
    }

    var updated = _.merge(fund, req.body);

    updated.save(function (err) {
      if (err) { return handleError(res, err); }

      transaction.create(
        {
          fundId: fund._id,
          date: new Date(),
          symbol: 'YMMF',
          description: 'Add/remove funds from YMMF',
          price: 1,
          action: action,
          numberOfShares: cashDifference,
          total: fund.cash,
          company: 'Your Money Market Fund',
          active: true
        }, function (err, result) {
          if (err) {
            return handleError(result, err);
          }
          console.log('Updating YMMF transaction for stock purchase');
        });

      return res.json(200, fund);
    });
  });
};

// Deletes a fund from the users fund collection.
exports.destroy = function(req, res) {

  var user = req.user;

  userModel.update({'_id': user._id},
                   { $pull: { "funds" : { _id :  mongoose.Types.ObjectId(req.params.id) }}},
                    function (err, result) {
                      if (err) {
                        return handleError(result, err);
                      }
                      else{
                        console.log(result);
                        return res.send(204);
                      }
                    });
};

exports.finalize = function(req, res) {

  var user = req.user;
  var selectedStock;

  fund.findById(user.selectedFund, function (err, fund) {
    if (err) {
      return handleError(res, err);
    }
    if (!fund) {
      return res.send(404);
    }

    fund.set({ "finalized" : true});
    fund.save();

    userModel.update(
        {'_id': user._id , 'funds._id' : mongoose.Types.ObjectId(req.params.id) },
        {$set : {'funds.$.finalized': 'true'} } ,
        function (err, result) {
          if (err) {
            return handleError(result, err);
          }
          else{
            console.log(result);
            return res.send(204);
          }
        });
  });

};


function handleError(res, err) {
  return res.send(500, err);
}
