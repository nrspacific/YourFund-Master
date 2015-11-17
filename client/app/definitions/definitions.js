'use strict';

angular.module('yourfundFullstackApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('definitions', {
        url: '/definitions',
        templateUrl: 'app/definitions/definitions.html',
        controller: 'DefinitionsCtrl'
      });
  });