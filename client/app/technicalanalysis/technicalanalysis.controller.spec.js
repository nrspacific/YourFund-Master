'use strict';

describe('Controller: TechnicalanalysisCtrl', function () {

  // load the controller's module
  beforeEach(module('yourfundFullstackApp'));

  var TechnicalanalysisCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    TechnicalanalysisCtrl = $controller('TechnicalanalysisCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
