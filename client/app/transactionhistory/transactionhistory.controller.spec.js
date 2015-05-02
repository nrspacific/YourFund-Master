'use strict';

describe('Controller: TransactionhistoryCtrl', function () {

  // load the controller's module
  beforeEach(module('yourfundFullstackApp'));

  var TransactionhistoryCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    TransactionhistoryCtrl = $controller('TransactionhistoryCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
