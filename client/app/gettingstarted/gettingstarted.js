'use strict';

angular.module('yourfundFullstackApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('gettingstarted', {
        url: '/gettingstarted',
        templateUrl: 'app/gettingstarted/gettingstarted.html',
        controller: 'GettingstartedCtrl'
      });
  });
