'use strict';

angular.module('yourfundFullstackApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('orientation', {
        url: '/orientation',
        templateUrl: 'app/orientation/orientation.html',
        controller: 'OrientationCtrl'
      });
  });