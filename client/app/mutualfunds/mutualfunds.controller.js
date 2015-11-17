'use strict';

angular.module('yourfundFullstackApp')
  .controller('MutualfundsCtrl', function ($scope,$location) {
    $scope.pageName = 'Mutual Funds';

    $scope.isActive = function (viewLocation) {
      return viewLocation === $location.path();
    };
  });
