'use strict';

angular.module('yourfundFullstackApp')
  .controller('FinancialstatementsCtrl', function ($scope,$location) {
    $scope.pageName = 'Financial Statements';

    $scope.isActive = function (viewLocation) {
      return viewLocation === $location.path();
    };
  });
