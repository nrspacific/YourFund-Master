'use strict';

angular.module('yourfundFullstackApp')
  .controller('EtfsCtrl', function ($scope,$location) {
    $scope.pageName = 'ETFs';

    $scope.isActive = function (viewLocation) {
      return viewLocation === $location.path();
    };
  });
