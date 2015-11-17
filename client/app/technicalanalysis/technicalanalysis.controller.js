'use strict';

angular.module('yourfundFullstackApp')
  .controller('TechnicalanalysisCtrl', function ($scope, $location) {
    $scope.pageName = 'Technical Analysis';

    $scope.isActive = function (viewLocation) {
      return viewLocation === $location.path();
    };
  });
