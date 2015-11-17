'use strict';

angular.module('yourfundFullstackApp')
  .controller('InflationCtrl', function ($scope, $location) {
    $scope.pageName = 'Inflation';

    $scope.isActive = function (viewLocation) {
      return viewLocation === $location.path();
    };
  });
