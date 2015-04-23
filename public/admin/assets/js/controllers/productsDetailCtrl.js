'use strict';
/**
 * controller for products
 */
(function(angular) {
    app.controller('ProductsDetailCtrl', ["$scope", "$modal", "$stateParams", "ProductService", "toaster", function($scope, $modal, $stateParams, ProductService, toaster) {

        /*
         * @getProduct
         * - get single product based on stateparams
         */

        ProductService.getProduct($stateParams.productId, function(product) {
            $scope.product = product;
            if (angular.isDefined($scope.product.icon) && !$scope.product.is_image)
                $('#convert').iconpicker('setIcon', $scope.product.icon);
        });

        /*
         * @insertMedia
         * - insert media function
         */

        $scope.insertMedia = function(asset) {
            $scope.product.icon = asset.url;
        };

        /*
         * @saveProductFn
         * - save product function
         */

        $scope.saveProductFn = function() {

            // var variants = [];
            // _.each($scope.product.variations, function(variant) {
            //     variants.push(variant);
            // });

            // $scope.product.variations = variants;

            console.log('$scope.product >>> ', $scope.product);
            // ProductService.saveProduct($scope.product, function(product) {
            //     $scope.originalProduct = angular.copy(product);
            //     console.log('Save Product >>> ', product);
            //     toaster.pop('success', 'Product Saved.');
            // });
        };

        /*
         * @convert:iconpicker
         * - icon picker for product image replacement
         */

        angular.element('#convert').iconpicker({
            iconset: 'fontawesome',
            icon: 'fa-credit-card',
            rows: 5,
            cols: 5,
            placement: 'right'
        });

        /*
         * @demo material
         * - demo material for the ui
         */

        $scope.availableColors = ['Red', 'Green', 'Blue', 'Yellow', 'Magenta', 'Maroon', 'Umbra', 'Turquoise'];

        $scope.multipleDemo = {};

        $scope.productAttributes = [
            {
                name: 'Color',
                attributes: ['red', 'green', 'blue']
            },
            {
                name: 'Size',
                attributes: ['small', 'medium', 'large']
            }
        ];

    }]);
})(angular);
