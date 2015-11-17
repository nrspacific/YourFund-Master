'use strict';

angular.module('yourfundFullstackApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('whatis', {
        url: '/whatis',
        templateUrl: 'app/whatis/whatis.html',
        controller: 'WhatisCtrl'
      });
  });
