'use strict';

angular.module('yourfundFullstackApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('fundamentalanalysis', {
        url: '/fundamentalanalysis',
        templateUrl: 'app/fundamentalanalysis/fundamentalanalysis.html',
        controller: 'FundamentalanalysisCtrl'
      });
  });