define(['app', 'commonutils', 'ngProgress', 'stateNavDirective', 'productService', 'paymentService', 'angularUI', 'ngAnimate', 'angularBootstrapSwitch', 'jquery', 'bootstrap-iconpicker'], function(app) {
  app.register.controller('CommerceEditCtrl', ['$scope', '$q', 'ngProgress', '$stateParams', 'ProductService', 'PaymentService', function($scope, $q, ngProgress, $stateParams, ProductService, PaymentService) {
    ngProgress.start();
    //back button click function
    $scope.$back = function() {
      window.history.back();
    };
    ngProgress.complete();

    $scope.productId = $stateParams.id;

    $scope.plans = [];

    $scope.planEdit = false;

    $scope.newSubscription = {planId: $$.u.idutils.generateUniqueAlphaNumericShort()};

    ProductService.getProduct($scope.productId, function(product) {
      $scope.product = product;
      var promises = [];

      $('#convert').iconpicker('setIcon', $scope.product.icon);

      if ('stripePlans' in $scope.product.product_attributes) {
        $scope.product.product_attributes.stripePlans.forEach(function(value, index) {
          promises.push(PaymentService.getPlanPromise(value));
        });
        $q.all(promises)
          .then(function(data) {
            data.forEach(function(value, index) {
              $scope.plans.push(value.data);
            });
          })
          .catch(function(err) {
            console.error(err);
          });
      }
    });

    $('#convert').iconpicker({
      iconset: 'fontawesome',
      icon: 'fa-key',
      rows: 5,
      cols: 5,
      placement: 'right',
    });

    $('#convert-pref').iconpicker({
      iconset: 'fontawesome',
      icon: 'fa-key',
      rows: 5,
      cols: 5,
      placement: 'left',
    });

    $('#convert').on('change', function(e) {
      $scope.product.icon = e.icon;
    });

    $scope.addSubscriptionFn = function() {
      console.log('$scope.newSubscription >>> ', $scope.newSubscription);
      PaymentService.postCreatePlan($scope.newSubscription, function(subscription) {
        $scope.plans.push(subscription);
        if ('stripePlans' in $scope.product.product_attributes) {
          $scope.product.product_attributes.stripePlans.push(subscription.id);
        } else {
          $scope.product.product_attributes.stripePlans = [subscription.id];
        }
        $scope.saveProductFn();
        $scope.newSubscription = {planId: $$.u.idutils.generateUniqueAlphaNumericShort()};
      });
    };

    $scope.editSubscriptionFn = function (planId) {
      $scope.planDeleteFn(planId);
      $scope.addSubscriptionFn();
      $scope.editCancelFn();
    };

    $scope.saveProductFn = function() {
      console.log('$scope.product >>> ', $scope.product);
      ProductService.saveProduct($scope.product, function(product) {
        console.log('Save Product >>> ', product);
      });
    };

    $scope.planEditFn = function(planId) {
      $scope.planEdit = true;
      $scope.plans.forEach(function(value, index) {
        if (value.id == planId) {
          $scope.newSubscription = value;
          $scope.newSubscription.planId = value.id;
        }
      });
    };

    $scope.editCancelFn = function () {
      $scope.planEdit = false;
      $scope.newSubscription = {planId: $$.u.idutils.generateUniqueAlphaNumericShort()};
    };

    $scope.planDeleteFn = function(planId) {
      PaymentService.deletePlan(planId, function() {});
      $scope.plans.forEach(function(value, index) {
        if (value.id == planId) {
          $scope.plans.splice(index, 1);
        }
      });

      $scope.product.product_attributes.stripePlans.forEach(function(value, index) {
        if (value == planId) {
          $scope.product.product_attributes.stripePlans.splice(index, 1);
        }
      });

      $scope.saveProductFn();
    };
  }]);
});
