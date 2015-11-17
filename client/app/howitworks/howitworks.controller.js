'use strict';

angular.module('yourfundFullstackApp')
  .controller('HowitworksCtrl', function ($scope,$location) {
    $scope.isActive = function (viewLocation) {
      return viewLocation === $location.path();
    };
  });
