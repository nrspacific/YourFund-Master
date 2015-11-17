'use strict';

angular.module('yourfundFullstackApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('fundamentalvstechnical', {
        url: '/fundamentalvstechnical',
        templateUrl: 'app/fundamentalvstechnical/fundamentalvstechnical.html',
        controller: 'FundamentalvstechnicalCtrl'
      });
  });