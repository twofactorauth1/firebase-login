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

  describe('$scope.totalWithDiscount', function() {
    it('should equal 2', function () {
      expect($scope.totalWithDiscount(1, 1)).toEqual(2);
    });
  });

  describe('$scope.getUsers', function() {
    it('should return users', function() {

      // pre-conditions
      expect($scope.users).toBeDefined();
      expect($scope.users.length).toBe(0);

      var perfectMembers = [
        {
          name: 'user1',
        },
        {
          name: 'user2',
        },
      ];
      $httpBackend.whenGET('/api/1.0/user/members').respond(perfectMembers);

      // execute function to be tested
      $scope.getUsers();

      // post-conditions
      expect($scope.users.length).toBeGreaterThan(0);
      expect(false).toBe(true);

      //$httpBackend.flush();
    })
  });

});
