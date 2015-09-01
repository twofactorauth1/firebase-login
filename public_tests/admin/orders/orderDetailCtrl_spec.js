'use strict';
/*global describe, beforeEach, it, inject, expect*/

describe('test orderDetailCtrl', function () {

  var $rootScope, $scope, $controller, $httpBackend;


  beforeEach(function () {
    module('clipApp', function ($provide) {
      $provide.constant('orderConstant');
      $provide.constant('contactConstant');
      $provide.constant('userConstant');
    });
  });
  beforeEach(module('toaster'));
  beforeEach(module('oitozero.ngSweetAlert'));

  beforeEach(inject(function (_$rootScope_,
                              _$controller_,
                              _$httpBackend_) {
    $httpBackend = _$httpBackend_;
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

      // JKG- difficult to test preconditions
      // pre-conditions
      //expect($scope.users).toBeDefined();
      //expect($scope.users.length).toBe(0);

      // garbage data because the point is not the data schema,
      // but the point is that some data was moved.
      var perfectMembers = [
        {
          name: 'user1',
        },
        {
          name: 'user2',
        },
      ];

      // JKG - why all the extra api hits? should just be /members, right?
      $httpBackend.whenGET('assets/i18n/en.json').respond(perfectMembers);
      $httpBackend.whenGET('/api/1.0/contact').respond(perfectMembers);
      $httpBackend.whenGET('/api/1.0/user/members').respond(perfectMembers);
      $httpBackend.whenGET('/api/1.0/products').respond(perfectMembers);
      $httpBackend.whenGET('/api/1.0/orders/').respond(perfectMembers);

      // execute function to be tested
      $scope.getUsers();

      $httpBackend.flush();

      // post-conditions
      expect($scope.users.length).toBeGreaterThan(0);
    })
  });

});