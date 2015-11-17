'use strict';

angular.module('yourfundFullstackApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('assetallocation', {
        url: '/assetallocation',
        templateUrl: 'app/assetallocation/assetallocation.html',
        controller: 'AssetallocationCtrl'
      });
  });