'use strict';

angular.module('yourfundFullstackApp')
  .controller('AboutUsCtrl', function ($scope,$location) {


    $scope.isActive = function (viewLocation) {
      return viewLocation === $location.path();
    };


  });
