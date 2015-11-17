'use strict';

angular.module('yourfundFullstackApp')
  .controller('FundamentalvstechnicalCtrl', function ($scope,$location) {
    $scope.pageName = 'Fundamental Analysis vs. Technical Analysis';

    $scope.isActive = function (viewLocation) {
      return viewLocation === $location.path();
    };
  });
