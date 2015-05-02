'use strict';

describe('Controller: RiskCtrl', function () {

  // load the controller's module
  beforeEach(module('yourfundFullstackApp'));

  var RiskCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    RiskCtrl = $controller('RiskCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
