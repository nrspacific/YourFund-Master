/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var User = require('../api/user/user.model');
var funds = require('../api/fund/fund.model');


funds.find({}).remove(function() {
  funds.create({
      name: 'Default Fund',
      cash : 4000,
      goal : 4000,
      accountId: '1',
      stocks: [], //ticker symbol, purchase price, date, # of shares
      finalized:  false,
      created:  Date()
    },
    function() {
      console.log('finished populating funds');

      var defaultFunds = [];

      funds.find(function (err, fund)
      {
        if(err) { return handleError(res, err); }
        if(!fund) { return res.send(404); }
        defaultFunds = fund;

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
            funds : defaultFunds,
            selectedFund : defaultFunds[0]._id
          }, function() {
            console.log('finished populating users');
          }
        );
      });
    }
  )
});











