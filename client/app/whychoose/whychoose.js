'use strict';

angular.module('yourfundFullstackApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('whychoose', {
        url: '/whychoose',
        templateUrl: 'app/whychoose/whychoose.html',
        controller: 'WhychooseCtrl'
      });
  });