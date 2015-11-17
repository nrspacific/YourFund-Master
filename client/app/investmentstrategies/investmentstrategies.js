'use strict';

angular.module('yourfundFullstackApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('investmentstrategies', {
        url: '/investmentstrategies',
        templateUrl: 'app/investmentstrategies/investmentstrategies.html',
        controller: 'InvestmentstrategiesCtrl'
      });
  });