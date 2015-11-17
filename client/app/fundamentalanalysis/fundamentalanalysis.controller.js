'use strict';

angular.module('yourfundFullstackApp')
  .controller('FundamentalanalysisCtrl', function ($scope, $location) {
    $scope.pageName = 'Fundamental Analysis';

    $scope.isActive = function (viewLocation) {
      return viewLocation === $location.path();
    };
  });
