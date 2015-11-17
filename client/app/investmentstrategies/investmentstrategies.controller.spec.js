'use strict';

describe('Controller: InvestmentstrategiesCtrl', function () {

  // load the controller's module
  beforeEach(module('yourfundFullstackApp'));

  var InvestmentstrategiesCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    InvestmentstrategiesCtrl = $controller('InvestmentstrategiesCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
