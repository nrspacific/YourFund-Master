/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var User = require('../api/user/user.model');
var funds = require('../api/fund/fund.model');


funds.find({}).remove(function() {
  funds.create({
      name: 'Test Fund 1',
      "cash" : 4000.00,
      "goal" : 34344,
      accountId: '1',
      stocks: [], //ticker symbol, purchase price, date, # of shares
      finalized:  false,
      created:  Date()
    },{
      name: 'Test Fund 2',
      "cash" : 8000,
      "goal" : 34344,
      accountId: '1',
      stocks: [], //ticker symbol, purchase price, date, # of shares
      finalized:  false,
      created:  Date()
    }, {
    "cash" : 13737.600000000004,
    "goal" : 34344,
    "name" : "Test Fund 3",
    "finalized" : true,
      "stocks" : [{
        "numberOfShares" : 65.334178820545333,
        "action" : "Buy",
        "price" : "157.70",
        "exchange" : "NYSE",
        "originalPercentOfFund" : "30",
        "explanation" : "",
        "symbol" : "IBM (International Business Machines Corporation)",
        "created" :Date()
      }]
    },
    function() {
      console.log('finished populating funds');

      var allFunds = [];

      funds.find(function (err, fund)
      {
        if(err) { return handleError(res, err); }
        if(!fund) { return res.send(404); }
        allFunds = fund;

      });


      User.find({}).remove(function() {
        User.create({
            provider: 'local',
            name: 'Test User',
            email: 'test@test.com',
            password: 'test'
          }, {
            provider: 'local',
            role: 'admin',
            name: 'Admin',
            email: 'admin@admin.com',
            password: 'admin',
            funds : allFunds
          }, function() {
            console.log('finished populating users');
          }
        );
      });
    }
  )
});











