define(['app', 'ngProgress', 'stateNavDirective', 'productService', 'paymentService', 'angularUI', 'ngAnimate', 'angularBootstrapSwitch', 'jquery', 'bootstrap-iconpicker'], function(app) {
  app.register.controller('CommerceEditCtrl', ['$scope', '$q', 'ngProgress', '$stateParams', 'ProductService', 'PaymentService', function($scope, $q, ngProgress, $stateParams, ProductService, PaymentService) {
    ngProgress.start();
    //back button click function
    $scope.$back = function() {
      window.history.back();
    };
    ngProgress.complete();

    $scope.productId = $stateParams.id;

    $scope.plans = [];

    ProductService.getProduct($scope.productId, function(product) {
      $scope.product = product;
      var promises = [];

      if ('stripePlans' in $scope.product.product_attributes) {
        $scope.product.product_attributes.stripePlans.forEach(function(value, index) {
          promises.push(PaymentService.getPlanPromise(value));
        });
        $q.all(promises)
          .then(function(data) {
            console.log(data);
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

    $('#convert').on('change', function(e) {
      $scope.product.icon = 'fa ' + e.icon;
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
        $scope.newSubscription = {};
      });
    };

    $scope.saveProductFn = function() {
      console.log('$scope.product >>> ', $scope.product);
      ProductService.saveProduct($scope.product, function(product) {
        console.log('Save Product >>> ', product);
      });
    };


  }]);
});
