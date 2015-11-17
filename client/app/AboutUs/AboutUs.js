'use strict';

angular.module('yourfundFullstackApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('Aboutus', {
        url: '/Aboutus',
        templateUrl: 'app/AboutUs/AboutUs.html',
        controller: 'AboutUsCtrl'
      });
  });
