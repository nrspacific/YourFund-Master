'use strict';

angular.module('yourfundFullstackApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('tutorials', {
        url: '/tutorials',
        templateUrl: 'app/tutorials/tutorials.html',
        controller: 'TutorialsCtrl'
      });
  });