'use strict';

describe('Controller: InflationCtrl', function () {

  // load the controller's module
  beforeEach(module('yourfundFullstackApp'));

  var InflationCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    InflationCtrl = $controller('InflationCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
