'use strict';

describe('Controller: FundamentalanalysisCtrl', function () {

  // load the controller's module
  beforeEach(module('yourfundFullstackApp'));

  var FundamentalanalysisCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    FundamentalanalysisCtrl = $controller('FundamentalanalysisCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
