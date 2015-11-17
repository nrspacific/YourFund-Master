'use strict';

describe('Controller: FundamentalvstechnicalCtrl', function () {

  // load the controller's module
  beforeEach(module('yourfundFullstackApp'));

  var FundamentalvstechnicalCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    FundamentalvstechnicalCtrl = $controller('FundamentalvstechnicalCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
