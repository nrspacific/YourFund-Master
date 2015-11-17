'use strict';

angular.module('yourfundFullstackApp')
  .controller('WhychooseCtrl', function ($scope, $location) {
    $scope.isActive = function (viewLocation) {
      return viewLocation === $location.path();
    };
  });
