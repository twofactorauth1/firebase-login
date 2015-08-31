'use strict';

describe('test gettingStartedCtrl', function () {

  var $rootScope, $scope, $controller;

  beforeEach(module('clipApp'));

  beforeEach(inject(function (_$rootScope_, _$controller_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    $controller = _$controller_;

    $controller('GettingStartedCtrl', {
      '$rootScope': $rootScope,
      '$scope': $scope
    });
  }));

  it('$scope.number', function () {
    expect($scope.number).toEqual(1);
    $scope.multiplyBy10();
    expect($scope.number).toEqual(11);
  });
});
