'use strict';

angular.module('yourfundFullstackApp')
  .controller('HelpCtrl', function ($scope, $location) {
    $scope.isActive = function (viewLocation) {
      return viewLocation === $location.path();
    };

  });
