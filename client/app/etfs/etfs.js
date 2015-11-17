'use strict';

angular.module('yourfundFullstackApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('etfs', {
        url: '/etfs',
        templateUrl: 'app/etfs/etfs.html',
        controller: 'EtfsCtrl'
      });
  });