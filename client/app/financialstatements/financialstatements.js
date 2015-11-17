'use strict';

angular.module('yourfundFullstackApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('financialstatements', {
        url: '/financialstatements',
        templateUrl: 'app/financialstatements/financialstatements.html',
        controller: 'FinancialstatementsCtrl'
      });
  });