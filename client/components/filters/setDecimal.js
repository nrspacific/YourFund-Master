'use strict';

angular.module('yourfundFullstackApp')
  .filter('setDecimal', function ($filter) {
    return function (input, places) {
      if (isNaN(input)) return input;

      var factor = "1" + Array(+(places > 0 && places + 1)).join("0");
      return parseInt(input * factor) / factor;
    };
});


