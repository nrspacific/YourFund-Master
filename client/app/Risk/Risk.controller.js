'use strict';

angular.module('yourfundFullstackApp')
  .controller('RiskCtrl', function ($scope, $location) {

    $scope.isActive = function (viewLocation) {
      return viewLocation === $location.path();
    };

  });
