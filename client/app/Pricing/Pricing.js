'use strict';

angular.module('yourfundFullstackApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('Pricing', {
        url: '/Pricing',
        templateUrl: 'app/Pricing/Pricing.html',
        controller: 'PricingCtrl'
      });
  });