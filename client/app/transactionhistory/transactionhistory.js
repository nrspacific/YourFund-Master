'use strict';

angular.module('yourfundFullstackApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('transactionhistory', {
        url: '/transactionhistory',
        templateUrl: 'transactionhistory.html',
        controller: 'TransactionhistoryCtrl'
      });
  });
