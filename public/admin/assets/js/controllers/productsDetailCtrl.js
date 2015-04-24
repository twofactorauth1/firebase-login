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

            if (!$scope.product.attributes) {
                $scope.product.attributes = [{
                    'name': '',
                    'values': []
                }];
            }
            console.log('$scope.product.variations.length ', $scope.product.variations.length);
            if ($scope.product.variations.length <= 0) {
                $scope.showVariations = false;
                $scope.product.variations = [{
                    "id": $scope.product._id+'-1',
                    "type": $scope.product.type,
                    "permalink": "https://example/product/ship-your-idea-10/?attribute_pa_color=black",
                    "sku": "",
                    "price": "19.99",
                    "regular_price": "19.99",
                    "sale_price": null,
                    "taxable": true,
                    "tax_status": "taxable",
                    "tax_class": "",
                    "managing_stock": false,
                    "stock_quantity": 0,
                    "in_stock": true,
                    "backordered": false,
                    "purchaseable": true,
                    "visible": true,
                    "on_sale": false,
                    "weight": null,
                    "dimensions": {
                        "length": "",
                        "width": "",
                        "height": "",
                        "unit": "cm"
                    },
                    "shipping_class": "",
                    "shipping_class_id": null,
                    "image": [{
                        "id": 610,
                        "created_at": "2015-01-22T20:37:18Z",
                        "updated_at": "2015-01-22T20:37:18Z",
                        "src": "http://example/wp-content/uploads/2015/01/ship-your-idea-black-front.jpg",
                        "title": "",
                        "alt": "",
                        "position": 0
                    }],
                    "attributes": [{
                        "name": "Color",
                        "slug": "color",
                        "option": "black"
                    }],
                    "downloads": [],
                    "download_limit": 0,
                    "download_expiry": 0
                }];
            } else {
                $scope.showVariations = true;
            }

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
            ProductService.saveProduct($scope.product, function(product) {
                $scope.originalProduct = angular.copy(product);
                console.log('Save Product >>> ', product);
                toaster.pop('success', 'Product Saved.');
            });
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

    }]);
})(angular);
