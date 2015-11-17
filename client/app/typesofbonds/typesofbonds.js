'use strict';

angular.module('yourfundFullstackApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('typesofbonds', {
        url: '/typesofbonds',
        templateUrl: 'app/typesofbonds/typesofbonds.html',
        controller: 'TypesofbondsCtrl'
      });
  });