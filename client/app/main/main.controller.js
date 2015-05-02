'use strict';

angular.module('yourfundFullstackApp')
    .controller('MainCtrl',
     function ($scope, $modal, $http, $filter, socket, Auth, transactionService, stocklookupservice) {

        $scope.getCurrentUser = Auth.getCurrentUser;
        $scope.selectedFund = null;
        $scope.stockPercentage = '';
        $scope.addFundOption = "CMMF";

        if ($scope.getCurrentUser().funds) {
            setSelectedFund($scope.getCurrentUser().funds[0]);
        }

       $scope.enableInvest = function (){
         if($scope.stockPercentage){
           return true;
         }
       };

       $scope.enableCreateFund = function (){
         if($scope.initialInvestment){
           return true;
         }
       };

        function setSelectedFundByID(fundID) {

            $http.get('/api/funds/' + fundID)
                .success(function (fund) {

                   // socket.syncUpdates('funds', $scope.selectedFund);

                    $scope.selectedFundName = fund.name;
                    $scope.totalInvested = fund.goal;
                    $scope.amountLeftToInvest = fund.cash;
                    $scope.percentLeftToInvest = fund.percentLeftToInvest;
                    $scope.totalStockAllocated = 0;
                    $scope.totalCashInvestedInFund = 0;

                    var gainLossPercent = 0;

                    fund.stocks.forEach(function (s) {
                      if(!fund.finalized){
                        $scope.totalStockAllocated = $scope.totalStockAllocated + Number(s.originalPercentOfFund);
                        $scope.totalCashInvestedInFund = $scope.totalCashInvestedInFund + Number(s.price * s.numberOfShares);
                      }
                      else{
                        $scope.totalStockAllocated = $scope.totalStockAllocated + Number(s.currentPercentOfFund);
                        $scope.totalCashInvestedInFund = $scope.totalCashInvestedInFund + Number(s.currentPrice * s.numberOfShares);
                      }

                      gainLossPercent += parseInt(s.change);
                    });


                    $scope.gainLossCash = 0;
                    $scope.gainLossPercent = gainLossPercent/fund.stocks.length;

                    getSelectedFundTransactionHistory(fundID);

                    $scope.selectedFund = fund;
                    console.log("selected fund = " + JSON.stringify(fund));
                });

        };

        function setSelectedFund(fund) {

          try {
            setSelectedFundByID(fund._id);
          }
          catch(err) {
            document.getElementById("demo").innerHTML = err.message;
          }
        }

        function getSelectedFundTransactionHistory(fundID) {

          console.log('Calling transactionService for fund:') + fundID;

          transactionService.GetTransactionHistory(fundID)
            .then(function(data) {
              var selectedFundHistory = data;

              selectedFundHistory.sort(function (a, b) {
                      var dateA = new Date(a.date),
                          dateB = new Date(b.date);
                      return dateB - dateA;
                  });

              $scope.selectedFundHistoryItems = selectedFundHistory;

             // console.log('transactionService service returned:' + JSON.stringify(selectedFundHistory));
            },
            function(data) {
              console.log('transactionService.GetTransactionHistory failed.')
            });

            return null;
        }

        $scope.getSuggestedStocks = function (val) {

            return stocklookupservice.getHistoricalData(val, $scope.startDate, $scope.endDate)
                .then(function ($response) {
                    var output = [];

                    $response.ResultSet.Result.forEach(function (stock) {
                        output.push(stock);
                    });

                    console.log(output);
                    return output;
                });
        };

        $scope.setSelectedFund = function (fund) {
            setSelectedFund(fund);
        };

        $scope.deleteFund = function (fund) {
            // need to call back into this controller for delete

            $scope.fundToDelete = $scope.selectedFund;
            var modalInstance = $modal.open({
                templateUrl: 'deleteFundModal.html',
                controller: 'DeleteFundModalInstanceCtrl',
                resolve: {
                    fundToDelete: function () {
                        return $scope.fundToDelete;
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
            }, function () {
                setSelectedFund($scope.selectedFund);
            });
        };

        $scope.deleteStock = function (stock) {
            // need to call back into this controller for delete

            $scope.stockToDelete = stock;

            var modalInstance = $modal.open({
                templateUrl: 'deleteStockModal.html',
                controller: 'DeleteStockModalInstanceCtrl',
                resolve: {
                    stockToDelete: function () {
                        return $scope.stockToDelete;
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                },
                function () {
                    setSelectedFund($scope.selectedFund);
                    $log.info('Modal dismissed at: ' + new Date());
                });
        };

        $scope.updateAllocationAmount = function (stock) {

            $scope.editMode = true;

            $scope.stockToUpdate = stock;

            $http.put('/api/stocks/' + $scope.stockToUpdate._id,  {
                stockToUpdate:  $scope.stockToUpdate,
                fundId: $scope.selectedFund._id
            }
         )
                .then(function (response) {
                    $scope.editMode = false;
                    $scope.getCurrentUser().funds = Auth.updateCurrentUser();
                    setSelectedFund($scope.selectedFund);
                },
                function (response) {

                });

            $scope.stockToUpdate = null;
        };

        $scope.modifyStockAlloction = function () {
            $scope.editMode = true;
        };

        $scope.finalizeFund = function (fund) {

            $http.put('/api/funds/finalize/' + fund._id)
                .then(function (response) {
                    $scope.isBusy = false;
                    $scope.getCurrentUser().funds = Auth.updateCurrentUser();
                    setSelectedFundByID(fund._id);
                },
                function (response) { // optional
                    $scope.isBusy = false;
                });
        };

       $scope.clearFundCreateVals  = function(){
         $scope.name = '';
         $scope.cash = '';
         $scope.goal = '';
         $scope.finalized = '';
         $scope.created = '';
         $scope.fundName = '';
         $scope.initialInvestment = '';
       };

       $scope.addFund = function () {
            if ($scope.fundName === '' || $scope.initialInvestment === '') {
                return;
            }
            $scope.isBusy = true;

            $http.post('/api/funds',
                {
                    name: $scope.fundName,
                    cash: $scope.initialInvestment,
                    goal: $scope.initialInvestment,
                    finalized: false,
                    created: Date()
                })
                .then(function (response) {
                    $scope.isBusy = false;
                    $scope.getCurrentUser().funds = response.data.funds;
                    setSelectedFund(response.data.funds[response.data.funds.length - 1]);
                },
                function (response) { // optional
                    $scope.isBusy = false;
                    $scope.name = '';
                    $scope.cash = '';
                    $scope.goal = '';
                    $scope.finalized = '';
                    $scope.created = '';
                    $scope.fundName = '';
                    $scope.initialInvestment = '';
                });
        };

        $scope.addCashToFund = function () {
            if ($scope.additionalInvestment === '') {
                return;
            }

            $scope.selectedFund.cash = parseInt($scope.selectedFund.cash) + parseInt($scope.additionalInvestment);
            $scope.selectedFund.goal = parseInt($scope.selectedFund.goal) + parseInt($scope.additionalInvestment);
            $scope.isBusy = true;

            if($scope.addFundOption == "CMMF"){ //Add additional funds only to CMMF
              $http.patch('/api/funds/' + $scope.selectedFund._id + '/action/CMMF', $scope.selectedFund)
                .success(function (fund) {
                  setSelectedFund(fund);
                },
                function (fund) { // optional
                  $scope.isBusy = false;
                });
            }
            else{ //Disperse funds amongst existing investments
              $http.patch('/api/funds/' + $scope.selectedFund._id + '/action/NA', $scope.selectedFund)
                .then(function (response) {

                  response.data.stocks.forEach(function (s) {
                    $scope.stockToUpdate = s;
                    $scope.stockToUpdate.fundId = $scope.selectedFund._id;
                    $http.put('/api/stocks/' + $scope.stockToUpdate._id, $scope.stockToUpdate)
                      .success(function (fund) {
                        setSelectedFund(response.data);;
                      },
                      function (fund) {
                        $scope.isBusy = false;
                      });
                  });

                },
                function (response) { // optional
                  $scope.isBusy = false;
                });
            }

            $scope.additionalInvestment = '';
        };

        $scope.withDrawlCashFromFund = function () {
            if ($scope.investmentWithdraw === '') {
                return;
            }

          $scope.selectedFund.cash = parseInt($scope.selectedFund.cash) - parseInt($scope.investmentWithdraw);
          $scope.selectedFund.goal = parseInt($scope.selectedFund.goal) - parseInt($scope.investmentWithdraw);
          $scope.isBusy = true;

          if($scope.addFundOption == "CMMF"){ //Withdraw funds only from CMMF
            $http.patch('/api/funds/' + $scope.selectedFund._id + '/action/CMMF', $scope.selectedFund)
              .then(function (fund) {
                setSelectedFund(fund.data);
              },
              function (fund) { // optional
                $scope.isBusy = false;
              });
          }
          else {
            $http.patch('/api/funds/' + $scope.selectedFund._id + '/action/NA', $scope.selectedFund)
              .then(function (response) {
                response.data.stocks.forEach(function (s) {
                  $scope.stockToUpdate = s;
                  $scope.stockToUpdate.fundId = $scope.selectedFund._id;

                  $http.put('/api/stocks/' + $scope.stockToUpdate._id, $scope.stockToUpdate)
                    .then(function (stock) {
                      setSelectedFund(response.data);
                    },
                    function (stock) {
                      $scope.isBusy = false;
                    });
                });
              },
              function (response) { // optional
                $scope.isBusy = false;
              });
          }

          $scope.investmentWithdraw = '';

        };

        $scope.setSelectedStockFromSuggested = function (selectedStock) {
            $scope.stockSymbol = selectedStock;
        };

        $scope.setSelectedStock  = function(stock){
            $scope.selectedStock = stock;
        };


       $scope.activeInvestments = function (item) {
         return item.active === 'true' || item.active === 'True';
       };

       $scope.performTradeOnInvestment  = function(){

            $scope.selectedStock.action = $scope.investmentAction;

            if($scope.selectedStock.action === 'sell'){
              $scope.selectedStock.originalPercentOfFund =  parseInt($scope.selectedStock.originalPercentOfFund) - parseInt($scope.tradeAmount);
            }
            else if ($scope.selectedStock.action === 'sellall'){
              $scope.selectedStock.originalPercentOfFund =  0;
            }
            else{
              $scope.selectedStock.originalPercentOfFund =  parseInt($scope.selectedStock.originalPercentOfFund) + parseInt($scope.tradeAmount);
            }

            $http.put('/api/stocks/' + $scope.selectedStock._id, $scope.selectedStock)
                .then(function (response) {
                    $scope.editMode = false;
                    $scope.getCurrentUser().funds = Auth.updateCurrentUser();
                    setSelectedFund($scope.selectedFund);
                },
                function (response) {

                });

            $scope.tradeAmount = '';
            $scope.stockToUpdate = null;
        };

       $scope.clearInvestmentVals  = function(){
         $scope.stockSymbol = ''; //value actually submitted
         $scope.stockPercentage = '';
         $scope.stock = ''; //value rendered in suggested stocks auto complete
       };


       $scope.addStockToFund = function () {
            if (!$scope.stockSymbol || !$scope.stockPercentage) {
                return;
            }
            $scope.isBusy = true;

            $http.post('/api/stocks',
                {
                    symbol: $scope.stockSymbol,
                    action: "Buy", //Buy or Sell
                    originalPercentOfFund: $scope.stockPercentage,
                    explanation: "",
                    description: $scope.stock,
                    active: true,
                    finalized: false,
                    created: Date(),
                    fundId: $scope.selectedFund._id
                })
                .then(function (fund) {
                    $scope.isBusy = false;
                    setSelectedFund(fund.data);
                },
                function (response) { // optional
                    $scope.isBusy = false;

                });



        };

    });

angular.module('yourfundFullstackApp')
    .controller('DeleteStockModalInstanceCtrl', function ($scope, $modalInstance, $http, Auth, stockToDelete) {

        $scope.stockToDelete = stockToDelete;

        $scope.ok = function () {
            $http.delete('/api/stocks/' + stockToDelete._id)
                .then(function (response) {
                    $scope.isBusy = false;
                    $scope.stockToDelete = null;
                    $scope.cancel();
                },
                function (response) {
                });
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    });

angular.module('yourfundFullstackApp')
    .controller('DeleteFundModalInstanceCtrl', function ($scope, $modalInstance, $http, Auth, fundToDelete) {

        $scope.fundToDelete = fundToDelete;

        $scope.ok = function () {
            $http.delete('/api/funds/' + fundToDelete._id)
                .then(function (response) {
                    $scope.isBusy = false;
                    Auth.updateCurrentUser();
                    $modalInstance.dismiss('cancel');
                },
                function (response) { // optional
                    $scope.isBusy = false;
                });

            $scope.fundToDelete.id = null;
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    });

angular.module('yourfundFullstackApp')
    .controller('FinalizeFundModalInstanceCtrl', function ($scope, $modalInstance, $http, Auth, fundToFinalize) {

        $scope.fundToFinalize = fundToFinalize;

        //$scope.ok = function () {
        //  $http.delete('/api/funds/' + fundToDelete._id)
        //    .then(function(response) {
        //      $scope.isBusy = false;
        //      Auth.updateCurrentUser();
        //      $modalInstance.dismiss('cancel');
        //    },
        //    function(response) { // optional
        //      $scope.isBusy = false;
        //    });


        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };


    });


