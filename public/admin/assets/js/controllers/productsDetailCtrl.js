'use strict';
/**
 * controller for products
 */
(function(angular) {
    app.controller('ProductsDetailCtrl', ["$scope", "$modal", "$stateParams", "ProductService", function($scope, $modal, $stateParams, ProductService) {

        ProductService.getProduct($stateParams.productId, function(product) {
            $scope.product = product;
        });

        $scope.openProductModal = function(size) {
            $scope.modalInstance = $modal.open({
                templateUrl: 'new-product-modal',
                controller: 'ProductsCtrl',
                size: size,
                scope: $scope
            });
        };

        $scope.openImportModal = function(size) {
            $scope.modalInstance = $modal.open({
                templateUrl: 'import-product-modal',
                controller: 'ProductsCtrl',
                size: size,
                scope: $scope
            });
        };

        $scope.cancel = function () {
            $scope.modalInstance.close();
        };

        $scope.addProduct = function() {
            ProductService.postProduct($scope.newProduct, function(product) {
                $scope.products.unshift(product);
                $scope.modalInstance.close();
            });
        };

        $scope.viewSingleProduct = function(product) {
            window.location = '/admin/#/app/commerce/products/'+product._id;
        };

    }]);
})(angular);
