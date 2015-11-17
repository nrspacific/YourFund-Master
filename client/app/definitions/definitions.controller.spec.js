'use strict';

describe('Controller: DefinitionsCtrl', function () {

  // load the controller's module
  beforeEach(module('yourfundFullstackApp'));

  var DefinitionsCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    DefinitionsCtrl = $controller('DefinitionsCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
