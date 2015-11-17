'use strict';

angular.module('yourfundFullstackApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('analyzingstatements', {
        url: '/analyzingstatements',
        templateUrl: 'app/analyzingstatements/analyzingstatements.html',
        controller: 'AnalyzingstatementsCtrl'
      });
  });