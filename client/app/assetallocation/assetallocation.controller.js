'use strict';

angular.module('yourfundFullstackApp')
  .controller('AssetallocationCtrl', function ($scope, $location) {
    $scope.pageName = 'Asset Allocation';

    $scope.isActive = function (viewLocation) {
      return viewLocation === $location.path();
    };
  });
