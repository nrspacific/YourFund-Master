'use strict';

angular.module('yourfundFullstackApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('technicalanalysis', {
        url: '/technicalanalysis',
        templateUrl: 'app/technicalanalysis/technicalanalysis.html',
        controller: 'TechnicalanalysisCtrl'
      });
  });