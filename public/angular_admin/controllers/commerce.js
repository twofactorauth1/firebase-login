define(['app', 'productService', 'paymentService', 'headroom', 'ngHeadroom', 'ngProgress', 'navigationService'], function(app) {
  app.register.controller('CommerceCtrl', ['$scope', 'ProductService', 'PaymentService', 'ngProgress', 'NavigationService', function($scope, ProductService, PaymentService, ngProgress, NavigationService) {
    ngProgress.start();
    NavigationService.updateNavigation();
    $scope.addProductFn = function() {
      ProductService.postProduct($scope.newProduct, function(product) {
        $scope.products.push(product);
        $('#commerce-add-product').modal('hide');
      });
    };

    $scope.productOrder = 'name';
    $scope.productSortReverse = false;

    $scope.$watch('sortOrder', function(newValue, oldValue) {
      newValue = parseInt(newValue);
      if (newValue === 0) {
        $scope.productOrder = 'name';
        $scope.productSortReverse = false;
      } else if (newValue == 1) {
        $scope.productOrder = 'name';
        $scope.productSortReverse = false;
      } else if (newValue == 2) {
        $scope.productOrder = 'name';
        $scope.productSortReverse = true;
      } else if (newValue == 3) {
        $scope.productOrder = 'created.date';
        $scope.productSortReverse = false;
      } else if (newValue == 4) {
        $scope.productOrder = 'last';
        $scope.productSortReverse = false;
      } else if (newValue == 5) {
        $scope.productOrder = 'lastActivity';
        $scope.productSortReverse = true;
      }
    });

    ProductService.getProducts(function(products) {
      $scope.products = products;
      ngProgress.complete();
    });
  }]);
});
