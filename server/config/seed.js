/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var User = require('../api/user/user.model');
var funds = require('../api/fund/fund.model');
var transcations = require('../api/transaction/transaction.model');

funds.find({}).remove(function () {
 funds.create({
     name: 'Default Fund',
     cash: 4000,
     goal: 4000,
     accountId: '1',
     stocks: [], //ticker symbol, purchase price, date, # of shares
     finalized: false,
     created: Date(),
     percentLeftToInvest: 100
   },
   function () {
     console.log('finished populating funds');

     var defaultFunds = [];

     funds.find(function (err, fund) {
         if (err) {
           return handleError(res, err);
         }
         if (!fund) {
           return res.send(404);
         }
         defaultFunds = fund;

         transcations.find({}).remove(function () {
           transcations.create(
             {
               fundId: defaultFunds[0]._id,
               date: new Date(),
               symbol: 'YMMF',
               description: 'Add money to YMMF',
               price: 1,
               action: 'Buy',
               numberOfShares: defaultFunds[0].cash,
               total: defaultFunds[0].cash,
               company: 'Your Money Market Fund',
               active: true,
               renderOnPreInit: true
             }), function () {
             console.log('finished populating transactions');
           };
         });
       }
     );


     User.find({}).remove(function () {
       User.create({
           provider: 'local',
           name: 'Test User',
           email: 'test@test.com',
           password: 'test'
         },
         {
           provider: 'local',
           role: 'admin',
           name: 'Admin',
           email: 'admin@admin.com',
           password: 'admin',
           funds: defaultFunds,
           selectedFund: defaultFunds[0]._id
         }, function () {
           console.log('finished populating users');
         }
       );
     });


   }
 );
});











