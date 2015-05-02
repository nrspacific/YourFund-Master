'use strict';

angular.module('yourfundFullstackApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('investmenttools', {
        url: '/investmenttools',
        templateUrl: 'app/investmenttools/investmenttools.html',
        controller: 'InvestmenttoolsCtrl'
      });
  });