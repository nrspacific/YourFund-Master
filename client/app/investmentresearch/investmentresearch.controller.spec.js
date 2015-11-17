'use strict';

describe('Controller: InvestmentresearchCtrl', function () {

  // load the controller's module
  beforeEach(module('yourfundFullstackApp'));

  var InvestmentresearchCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    InvestmentresearchCtrl = $controller('InvestmentresearchCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
