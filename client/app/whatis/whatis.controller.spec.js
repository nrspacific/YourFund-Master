'use strict';

describe('Controller: WhatisCtrl', function () {

  // load the controller's module
  beforeEach(module('yourfundFullstackApp'));

  var WhatisCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    WhatisCtrl = $controller('WhatisCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
