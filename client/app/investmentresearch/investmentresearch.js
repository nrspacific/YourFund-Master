'use strict';

angular.module('yourfundFullstackApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('investmentresearch', {
        url: '/investmentresearch',
        templateUrl: 'app/investmentresearch/investmentresearch.html',
        controller: 'InvestmentresearchCtrl'
      });
  });
