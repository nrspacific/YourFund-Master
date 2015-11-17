'use strict';

describe('Controller: GettingstartedCtrl', function () {

  // load the controller's module
  beforeEach(module('yourfundFullstackApp'));

  var GettingstartedCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    GettingstartedCtrl = $controller('GettingstartedCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
