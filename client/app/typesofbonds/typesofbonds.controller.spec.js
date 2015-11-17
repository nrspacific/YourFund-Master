'use strict';

describe('Controller: TypesofbondsCtrl', function () {

  // load the controller's module
  beforeEach(module('yourfundFullstackApp'));

  var TypesofbondsCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    TypesofbondsCtrl = $controller('TypesofbondsCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
