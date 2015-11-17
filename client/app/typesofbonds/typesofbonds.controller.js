'use strict';

angular.module('yourfundFullstackApp')
  .controller('TypesofbondsCtrl', function ($scope,$location) {
    $scope.pageName = 'Types of Bonds';

    $scope.isActive = function (viewLocation) {
      return viewLocation === $location.path();
    };

  });
