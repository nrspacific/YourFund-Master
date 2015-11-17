'use strict';

describe('Controller: AssetallocationCtrl', function () {

  // load the controller's module
  beforeEach(module('yourfundFullstackApp'));

  var AssetallocationCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AssetallocationCtrl = $controller('AssetallocationCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
