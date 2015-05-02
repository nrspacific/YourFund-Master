'use strict';

describe('Controller: InvestmenttoolsCtrl', function () {

  // load the controller's module
  beforeEach(module('yourfundFullstackApp'));

  var InvestmenttoolsCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    InvestmenttoolsCtrl = $controller('InvestmenttoolsCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
