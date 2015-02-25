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
      goal: 1,
      cash: 1,
      accountId: '1',
      stocks: [], //ticker symbol, purchase price, date, # of shares
      finalized:  false,
      user_id: User.Id,
      created:  Date()
    },{
      name: 'Test Fund 2',
      goal: 1,
      cash: 1,
      accountId: '1',
      stocks: [], //ticker symbol, purchase price, date, # of shares
      finalized:  false,
      user_id: User.Id,
      created:  Date()
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











