'use strict';

angular.module('yourfundFullstackApp')
  .service('transactionService',

  function ($q, $http) {

    var transactionService = {

      GetTransactionHistory: function (id) {

        var def = $q.defer();

        console.log("transactionService.GetTransactionHistory for fund: " + id);

        getTransactionHistory(id);

        function getTransactionHistory(id) {

          console.log("transactionService.GetTransactionHistory resolved for fund: " + id);

          $http.get('/api/transaction/' + id)
            .success(function (fund) {
              def.resolve(fund);
            });
        }
        return def.promise;
      }
    }

    return transactionService;

  });
