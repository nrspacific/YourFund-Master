'use strict';

angular.module('yourfundFullstackApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('howitworks', {
        url: '/howitworks',
        templateUrl: 'app/howitworks/howitworks.html',
        controller: 'HowitworksCtrl'
      });
  });