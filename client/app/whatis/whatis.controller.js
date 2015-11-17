'use strict';

angular.module('yourfundFullstackApp')
  .controller('WhatisCtrl', function ($scope,$location) {
    $scope.isActive = function (viewLocation) {
      return viewLocation === $location.path();
    };

  });
