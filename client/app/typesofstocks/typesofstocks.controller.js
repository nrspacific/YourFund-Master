'use strict';

angular.module('yourfundFullstackApp')
  .controller('TypesofstocksCtrl', function ($scope,$location) {
    $scope.pageName = 'Types of Stocks';

    $scope.isActive = function (viewLocation) {
      return viewLocation === $location.path();
    };
  });
