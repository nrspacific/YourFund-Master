'use strict';

angular.module('yourfundFullstackApp')
  .controller('InvestmentstrategiesCtrl', function ($scope,$location) {
    $scope.pageName = 'Investment Strategies';

    $scope.isActive = function (viewLocation) {
      return viewLocation === $location.path();
    };
  });
