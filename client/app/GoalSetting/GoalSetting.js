'use strict';

angular.module('yourfundFullstackApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('GoalSetting', {
        url: '/GoalSetting',
        templateUrl: 'app/GoalSetting/GoalSetting.html',
        controller: 'GoalSettingCtrl'
      });
  });