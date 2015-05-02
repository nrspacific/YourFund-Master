'use strict';

angular.module('yourfundFullstackApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('Help', {
        url: '/Help',
        templateUrl: 'app/Help/Help.html',
        controller: 'HelpCtrl'
      });
  });