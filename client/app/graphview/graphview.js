'use strict';

angular.module('yourfundFullstackApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('graphview', {
        url: '/graphview',
        templateUrl: 'app/graphview/graphview.html',
        controller: 'GraphviewCtrl'
      });
  });

