'use strict';

describe('Controller: TypesofstocksCtrl', function () {

  // load the controller's module
  beforeEach(module('yourfundFullstackApp'));

  var TypesofstocksCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    TypesofstocksCtrl = $controller('TypesofstocksCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
