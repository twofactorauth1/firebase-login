'use strict';

describe('test billingctrl', function () {

  var $rootScope, $scope, $controller;

  beforeEach(module('indigenousApp'));
  beforeEach(module('toaster'));
  beforeEach(module('ipCookie'));

  beforeEach(inject(function (_$rootScope_, _$controller_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    $controller = _$controller_;

    $controller('BillingCtrl', {
      '$rootScope': $rootScope,
      '$scope': $scope
    });
  }));

  it('$scope.number', function () {
    expect($scope.number).toEqual(1);
    $scope.plus();
    expect($scope.number).toEqual(2);
  });
});
