'use strict';

describe('Controller: AnalyzingstatementsCtrl', function () {

  // load the controller's module
  beforeEach(module('yourfundFullstackApp'));

  var AnalyzingstatementsCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AnalyzingstatementsCtrl = $controller('AnalyzingstatementsCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
