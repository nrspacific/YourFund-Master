'use strict';

describe('Controller: InvestingadvantagesCtrl', function () {

  // load the controller's module
  beforeEach(module('yourfundFullstackApp'));

  var InvestingadvantagesCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    InvestingadvantagesCtrl = $controller('InvestingadvantagesCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
