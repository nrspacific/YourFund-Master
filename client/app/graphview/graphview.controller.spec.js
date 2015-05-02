'use strict';

describe('Controller: GraphviewCtrl', function () {

  // load the controller's module
  beforeEach(module('yourfundFullstackApp'));

  var GraphviewCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    GraphviewCtrl = $controller('GraphviewCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
