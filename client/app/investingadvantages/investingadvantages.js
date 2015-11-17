'use strict';

angular.module('yourfundFullstackApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('investingadvantages', {
        url: '/investingadvantages',
        templateUrl: 'app/investingadvantages/investingadvantages.html',
        controller: 'InvestingadvantagesCtrl'
      });
  });