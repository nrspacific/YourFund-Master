'use strict';

angular.module('yourfundFullstackApp')
  .controller('OrientationCtrl', function ($scope, $location) {
    $scope.message = 'Hello';

    $scope.isActive = function (viewLocation) {
      return viewLocation === $location.path();
    };

  });
