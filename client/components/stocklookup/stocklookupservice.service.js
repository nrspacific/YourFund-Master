'use strict';

angular.module('yourfundFullstackApp')
  .factory('stocklookupservice', function($q, $http) {
    // Service logic
    // ...



    return {
      getHistoricalData: function(symbol, start, end) {
        var deferred = $q.defer();

        var YAHOO = window.YAHOO = {Finance: {SymbolSuggest: {}}};

        console.log("stocklookupservice.getHistoricalData - searching for symbol:" + symbol);

        $.ajax({
          type: "GET",
          dataType: "jsonp",
          jsonp: "callback",
          jsonpCallback: "YAHOO.Finance.SymbolSuggest.ssCallback",
          data: {
            query: symbol
          },
          cache: true,
          url: "http://autoc.finance.yahoo.com/autoc"
        });

        YAHOO.Finance.SymbolSuggest.ssCallback = function (data) {

          console.log("stocklookupservice.getHistoricalData - returning result for symbol:" + symbol + " ["  + JSON.stringify(data) + "]");
          deferred.resolve(data);
        };

        return deferred.promise;
      }}
  });
