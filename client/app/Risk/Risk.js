'use strict';

angular.module('yourfundFullstackApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('Risk', {
        url: '/Risk',
        templateUrl: 'app/Risk/Risk.html',
        controller: 'RiskCtrl'
      });
  });