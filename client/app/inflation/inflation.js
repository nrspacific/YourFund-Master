'use strict';

angular.module('yourfundFullstackApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('inflation', {
        url: '/inflation',
        templateUrl: 'app/inflation/inflation.html',
        controller: 'InflationCtrl'
      });
  });