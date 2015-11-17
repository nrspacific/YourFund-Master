'use strict';

angular.module('yourfundFullstackApp')
  .controller('InvestmenttoolsCtrl', function ($scope,$location) {
    $scope.pageName = 'Basics & Concepts';

    $scope.isActive = function (viewLocation) {
      return viewLocation === $location.path();
    };
  });
