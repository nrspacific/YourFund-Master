'use strict';

angular.module('yourfundFullstackApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('mutualfunds', {
        url: '/mutualfunds',
        templateUrl: 'app/mutualfunds/mutualfunds.html',
        controller: 'MutualfundsCtrl'
      });
  });