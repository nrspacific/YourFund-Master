'use strict';

angular.module('yourfundFullstackApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('typesofstocks', {
        url: '/typesofstocks',
        templateUrl: 'app/typesofstocks/typesofstocks.html',
        controller: 'TypesofstocksCtrl'
      });
  });