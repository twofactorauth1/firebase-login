'use strict';
/*global describe, beforeEach, it, inject, expect*/

describe('test orderDetailCtrl', function () {

  var $rootScope, $scope, $controller;


  beforeEach(function () {
    module('clipApp', function ($provide) {
      $provide.constant('orderConstant');
      $provide.constant('contactConstant');
      $provide.constant('userConstant');
    });
  });
  beforeEach(module('toaster'));
  beforeEach(module('oitozero.ngSweetAlert'));

  beforeEach(inject(function (_$rootScope_, _$controller_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    $controller = _$controller_;

    $controller('OrderDetailCtrl', {
      '$rootScope': $rootScope,
      '$scope': $scope
    });
  }));

  it('$scope.number', function () {
    expect($scope.totalWithDiscount(1, 1)).toEqual(2);
  });
});
