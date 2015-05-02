'use strict';

describe('Service: stocklookupservice', function () {

  // load the service's module
  beforeEach(module('yourfundFullstackApp'));

  // instantiate service
  var stocklookupservice;
  beforeEach(inject(function (_stocklookupservice_) {
    stocklookupservice = _stocklookupservice_;
  }));

  it('should do something', function () {
    expect(!!stocklookupservice).toBe(true);
  });

});
