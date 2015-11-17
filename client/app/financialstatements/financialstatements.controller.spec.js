'use strict';

describe('Controller: FinancialstatementsCtrl', function () {

  // load the controller's module
  beforeEach(module('yourfundFullstackApp'));

  var FinancialstatementsCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    FinancialstatementsCtrl = $controller('FinancialstatementsCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
