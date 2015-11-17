'use strict';

angular.module('yourfundFullstackApp')
  .controller('TutorialsCtrl', function ($scope,$location) {
    $scope.pageName = 'Tutorials';

    $scope.isActive = function (viewLocation) {
      return viewLocation === $location.path();
    };
  });
