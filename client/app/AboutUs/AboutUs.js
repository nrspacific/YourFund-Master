'use strict';

angular.module('yourfundFullstackApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('AboutUs', {
        url: '/AboutUs',
        templateUrl: 'app/AboutUs/AboutUs.html',
        controller: 'AboutUsCtrl'
      });
  });