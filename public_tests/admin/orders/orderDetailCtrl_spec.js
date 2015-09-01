'use strict';
/*global describe, beforeEach, it, inject, expect*/

describe('test orderDetailCtrl', function () {

  var $rootScope, $scope, $controller, CustomerService;


  beforeEach(function () {
    module('clipApp', function ($provide) {
      $provide.constant('orderConstant');
      $provide.constant('contactConstant');
      $provide.constant('userConstant');
    });
  });
  beforeEach(module('toaster'));
  beforeEach(module('oitozero.ngSweetAlert'));

  beforeEach(inject(function (_$rootScope_, _$controller_, $q) {
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    $controller = _$controller_;

    CustomerService = {
      getCustomers: function () {
        def = $q.defer();
        return def.promise;
      }
    };

    spyOn(CustomerService, 'getCustomers').andReturn("Foo");

    $controller('OrderDetailCtrl', {
      '$rootScope': $rootScope,
      '$scope': $scope,
      'CustomerService': CustomerService
    });
  }));

  describe('$scope.totalWithDiscount', function () {
    it('should equal 2', function () {
      expect($scope.totalWithDiscount(1, 1)).toEqual(2);
    });
  });


  it('should assign data to scope', function () {
    spyOn(CustomerService, 'getCustomers').andCallThrough();
    deferred.resolve(data);
    scope.$digest();
    expect(CustomerService.getCustomers).toHaveBeenCalled();
    expect(scope.customers).toBe(data);
  });

});
