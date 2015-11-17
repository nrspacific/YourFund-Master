'use strict';

angular.module('yourfundFullstackApp')
  .controller('GoalSettingCtrl', function ($scope, $location) {
    $scope.message = 'Hello';

    $scope.isActive = function (viewLocation) {
      return viewLocation === $location.path();
    };

  });
