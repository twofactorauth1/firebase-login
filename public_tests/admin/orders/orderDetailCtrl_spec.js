'use strict';
/*global describe, beforeEach, it, inject, expect*/

describe('test orderDetailCtrl', function () {

  var $rootScope, $scope, $controller, $httpBackend;
  var perfectMembers;

  beforeEach(function () {
    module('indigenousApp', function ($provide) {
      // Example of mocking constants
      // http://stackoverflow.com/questions/23056089/unknow-providers-error-throw-when-injecting-constant

      // from /admin/assets/js/config.constant.js
      $provide.constant('orderConstant', {
        order_status: {
          FAILED: 'foo',
          dp: [{
            label: 'Bar',
            data: 'foo',
          }],
        }
      });
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

    // example of mocking $stateParams
    // http://stackoverflow.com/questions/21317377/injected-stateparams-and-state-into-jasmine-angular-js-test-getting-undefined

    $controller('OrderDetailCtrl', {
      '$rootScope': $rootScope,
      '$scope': $scope,
      '$stateParams' : {},
    });
  }));

  beforeEach(function() {
    // garbage data because the point is not the data schema,
    // but the point is that some data was moved.
    perfectMembers = [
      {
        name: 'user1',
      },
      {
        name: 'user2',
      },
    ];
  });

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

      // TODO: so many API calls make it difficult to test.
      // back-end might be better suited to give us what we want.
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

  describe('ctrl should be initialized', function() {
    it('should have FailedStatus defined', function() {
      expect($scope.FailedStatus).toBeDefined();
      expect($scope.FailedStatus).toBe('foo');
    });
    it('should have dateOptions defined', function() {
      expect($scope.dateOptions).toBeDefined();
    });
  });

  describe('$scope.formatOrderStatus', function() {
    // formatOrderStatus
    it('should format an order status', function() {
      // run the $scope function
      var formatted = $scope.formatOrderStatus('foo'); //orderConstant.order_status.FAILED);

      // OrderService tests will test specific formatting,
      // and the controller should just make sure something worked.
      expect(formatted).toBeDefined();
      expect(formatted).toBe('Bar');
    });

  });

  describe('$scope.getProducts', function() {
    it('should return some products', function() {
      $httpBackend.whenGET('/api/1.0/orders/').respond(perfectMembers);
      $httpBackend.whenGET('/api/1.0/user/members').respond(perfectMembers);
      $httpBackend.whenGET('/api/1.0/contact').respond(perfectMembers);
      $httpBackend.whenGET('assets/i18n/en.json').respond(perfectMembers);
      $httpBackend.whenGET('/api/1.0/products').respond(perfectMembers);

      // pre-conditions
      expect($scope.products).not.toBeDefined(); // not a requirement, but shows the state
      //expect($scope.products.length).toBe(0); // not a requirement, but shows the state

      // call the function
      $scope.getProducts();

      // force execution of promises
      $httpBackend.flush();

      // evaluate response
      expect($scope.products).toBeDefined();
      expect($scope.products.length).toBeGreaterThan(0);
    });
  });

  describe('$scope.eliminateUsedProducts', function() {
    it('should eliminate redundant products', function() {
      // mock API responses
      // so many API hits makes testing more challenging
      $httpBackend.whenGET('/api/1.0/orders/').respond(perfectMembers);
      $httpBackend.whenGET('/api/1.0/user/members').respond(perfectMembers);
      $httpBackend.whenGET('/api/1.0/products').respond(perfectMembers);
      $httpBackend.whenGET('/api/1.0/contact').respond(perfectMembers);
      $httpBackend.whenGET('assets/i18n/en.json').respond(perfectMembers);

      // initialize data
      $scope.getProducts();
      $scope.getOrder();

      // force execution of promises
      $httpBackend.flush();

      // evaluate pre-conditions
      expect($scope.products).toBeDefined();
      expect($scope.products.length).toBeGreaterThan(0);
      expect($scope.order).toBeDefined();
      expect($scope.order.line_items).toBeDefined();
      //expect($scope.order.line_items.length).toBeGreaterThan(0);

      // run function to be tested
      $scope.eliminateUsedProducts();

      // evaluate results
      console.log('------\n', $scope.filterProducts);
      //expect($scope.filterProducts.length).toBeLessThan($scope.products.length);
    });
  });

  describe('$scope.getOrder', function() {
    it('should populate a new order', function() {
      // mock API responses
      // so many API hits makes testing more challenging
      $httpBackend.whenGET('/api/1.0/orders/').respond(perfectMembers);
      $httpBackend.whenGET('/api/1.0/products').respond(perfectMembers);
      $httpBackend.whenGET('/api/1.0/user/members').respond(perfectMembers);
      $httpBackend.whenGET('/api/1.0/contact').respond(perfectMembers);
      $httpBackend.whenGET('assets/i18n/en.json').respond(perfectMembers);

      // test pre-conditions
      // --- for NEW ORDER
      expect($scope.order).not.toBeDefined();  // it is not wrong to already be defined
      expect($scope.dataLoaded).toBe(false);

      // execute function to be tested
      $scope.getOrder();

      // force execution of promises
      $httpBackend.flush();

      // test post-conditions
      expect($scope.order.created).toBeDefined();
      expect($scope.order.order_id).toBeDefined();  // TODO: does the value really need to be the length of the response?
      expect($scope.order.status).toBeDefined();
      expect($scope.order.status).toBe('pending_payment');  // TODO: this should be a constant
      expect($scope.order.line_items).toBeDefined();
      expect($scope.order.line_items.length).toBe(0);
      expect($scope.dataLoaded).toBe(true);
    });

    it('should retrieve an existing order', function() {
      //// TODO: mock router state
      //$stateParams = { orderId: 123 };

      // mock API responses
      // so many API hits makes testing more challenging
      var orderResponse = [
        {
          _id: 123,  // TODO: use value of $stateParams.orderId
          locked: true,
        },
      ];
      $httpBackend.whenGET('/api/1.0/orders/').respond(orderResponse);
      $httpBackend.whenGET('/api/1.0/products').respond(perfectMembers);
      $httpBackend.whenGET('/api/1.0/user/members').respond(perfectMembers);
      $httpBackend.whenGET('/api/1.0/contact').respond(perfectMembers);
      $httpBackend.whenGET('assets/i18n/en.json').respond(perfectMembers);
      // execute function to be tested
      $scope.getOrder();

      // force execution of promises
      $httpBackend.flush();

      expect($scope.order.locked).toBe(orderResponse.locked);
    });
  });
});
