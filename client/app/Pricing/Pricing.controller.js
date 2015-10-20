'use strict';

angular.module('yourfundFullstackApp')
  .controller('PricingCtrl', function ($scope, $location) {


    $scope.isActive = function (viewLocation) {
      return viewLocation === $location.path();
    };


  });
