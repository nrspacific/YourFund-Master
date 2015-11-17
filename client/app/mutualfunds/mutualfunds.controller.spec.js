'use strict';

describe('Controller: MutualfundsCtrl', function () {

  // load the controller's module
  beforeEach(module('yourfundFullstackApp'));

  var MutualfundsCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MutualfundsCtrl = $controller('MutualfundsCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
