'use strict';
/**
 * controller for products
 */
(function(angular) {
    app.controller('ProductsCtrl', ["$scope", "$modal", "ProductService", function($scope, $modal, ProductService) {
        $scope.newProduct = {status: 'Auto Inactive'};
        ProductService.getProducts(function(products) {
            $scope.products = products;
        });

        $scope.openProductModal = function(size) {
            $scope.modalInstance = $modal.open({
                templateUrl: 'new-product-modal',
                size: size,
                scope: $scope
            });
        };

        $scope.openImportModal = function(size) {
            $scope.modalInstance = $modal.open({
                templateUrl: 'import-product-modal',
                size: size,
                scope: $scope
            });
        };

        $scope.cancel = function () {
            $scope.modalInstance.close();
        };

        $scope.addProduct = function() {
            ProductService.postProduct($scope.newProduct, function(product) {
                $scope.displayedProducts.unshift(product);
                $scope.modalInstance.close();
                $scope.newProduct = {};
            });
        };

        $scope.viewSingleProduct = function(product) {
            window.location = '/admin/#/commerce/products/'+product._id;
        };

    }]);
})(angular);
