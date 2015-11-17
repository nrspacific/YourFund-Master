'use strict';

describe('Controller: WhychooseCtrl', function () {

  // load the controller's module
  beforeEach(module('yourfundFullstackApp'));

  var WhychooseCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    WhychooseCtrl = $controller('WhychooseCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
