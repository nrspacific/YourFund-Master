'use strict';

angular.module('yourfundFullstackApp')
  .service('loginModal', function ($modal, $rootScope) {

    function assignCurrentUser (user) {
      $rootScope.currentUser = user;
      return user;
    }

    return function() {
      var instance = $modal.open({
        templateUrl: 'app/account/login/login.html',
        controller: 'LoginCtrl',
        controllerAs: 'LoginCtrl',
        backdrop: true,
        backdropClass: 'fade'
      })
    };

  })
  .controller('LoginCtrl', function ($scope, Auth, $location, $window,$modalInstance, User) {
    $scope.user = {};
    $scope.errors = {};

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

    $scope.user.password = 'admin';
    $scope.user.email = 'admin@admin.com';

    $scope.login = function(form) {
      $scope.submitted = true;

      if(form.$valid) {
        Auth.login({
          email: $scope.user.email,
          password: $scope.user.password
        })
        .then( function() {
          // Logged in, redirect to home
            var funds = User.get();
          $location.path('/');

            $modalInstance.dismiss('cancel');
        })
        .catch( function(err) {
          $scope.errors.other = err.message;
        });
      }
    };

    $scope.loginOauth = function(provider) {
      $window.location.href = '/auth/' + provider;
    };
  });
