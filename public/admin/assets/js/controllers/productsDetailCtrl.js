'use strict';
/**
 * controller for products
 */
(function(angular) {
    app.controller('ProductsDetailCtrl', ["$scope", "$modal", "$stateParams", "ProductService", "toaster", function($scope, $modal, $stateParams, ProductService, toaster) {

        ProductService.getProduct($stateParams.productId, function(product) {
            $scope.product = product;
            if (angular.isDefined($scope.product.icon) && !$scope.product.is_image)
                    $('#convert').iconpicker('setIcon', $scope.product.icon);
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
                $scope.products.unshift(product);
                $scope.modalInstance.close();
            });
        };

        $scope.viewSingleProduct = function(product) {
            window.location = '/admin/#/app/commerce/products/'+product._id;
        };

        $scope.insertMedia = function(asset) {
            $scope.product.icon = asset.url;
        };

        $scope.saveProductFn = function() {
            
            var variants = [];
            $scope.product.variantSettings.variants.forEach(function(value, index) {
                if (value.create == true) {
                    variants.push(value);
                }
            });
            $scope.product.variantSettings.variants = variants;

            console.log('$scope.product >>> ', $scope.product);
                ProductService.saveProduct($scope.product, function(product) {
                    $scope.originalProduct = angular.copy(product);
                    console.log('Save Product >>> ', product);
                    toaster.pop('success', 'Product Saved.');
                });
            };

        angular.element('#convert').iconpicker({
            iconset: 'fontawesome',
            icon: 'fa-credit-card',
            rows: 5,
            cols: 5,
            placement: 'right'
        });
        
    }]);
})(angular);
