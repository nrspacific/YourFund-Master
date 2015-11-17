'use strict';

angular.module('yourfundFullstackApp')
  .controller('InvestmentresearchCtrl', function ($scope, $location, stocklookupservice) {

    $scope.stockservice = stocklookupservice;

    $scope.isActive = function (viewLocation) {
      return viewLocation === $location.path();
    };


  });
