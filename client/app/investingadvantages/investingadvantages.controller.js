'use strict';

angular.module('yourfundFullstackApp')
  .controller('InvestingadvantagesCtrl', function ($scope,$location) {
    $scope.pageName = 'Investing Advantages';

    $scope.isActive = function (viewLocation) {
      return viewLocation === $location.path();
    };
  });
