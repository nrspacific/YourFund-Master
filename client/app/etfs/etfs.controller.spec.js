'use strict';

describe('Controller: EtfsCtrl', function () {

  // load the controller's module
  beforeEach(module('yourfundFullstackApp'));

  var EtfsCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    EtfsCtrl = $controller('EtfsCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
