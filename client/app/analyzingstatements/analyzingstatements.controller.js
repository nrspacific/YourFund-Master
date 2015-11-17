'use strict';

angular.module('yourfundFullstackApp')
  .controller('AnalyzingstatementsCtrl', function ($scope, $location) {
    $scope.pageName = 'Analyzing Statements';

    $scope.isActive = function (viewLocation) {
      return viewLocation === $location.path();
    };



  });
