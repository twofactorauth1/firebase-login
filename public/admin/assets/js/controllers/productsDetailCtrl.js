'use strict';
/*global app, moment, angular, window*/
/*jslint unparam:true*/
(function (angular) {
  app.controller('ProductsDetailCtrl', ["$scope", "$modal", "$timeout", "$stateParams", "ProductService", "toaster", function ($scope, $modal, $timeout, $stateParams, ProductService, toaster) {

    /*
     * @openModal
     * -
     */

    $scope.openModal = function (modal) {
      $scope.modalInstance = $modal.open({
        templateUrl: modal,
        scope: $scope
      });
    };

    /*
     * @closeModal
     * -
     */

    $scope.closeModal = function () {
      $scope.modalInstance.close();
    };

    /*
     * @getProduct
     * - get single product based on stateparams
     */

    ProductService.getProduct($stateParams.productId, function (product) {
      $scope.product = product;
      if (angular.isDefined($scope.product.icon) && !$scope.product.is_image) {
        angular.element(' #convert ').iconpicker('setIcon', $scope.product.icon);
      }

      if (!$scope.product.attributes) {
        $scope.product.attributes = [{
          'name': '',
          'values': []
        }];
      }

      if ($scope.product.downloads.length <= 0) {
        $scope.product.downloads = [{
          'id': Math.uuid(8),
          'name': '',
          'file': ''
        }];
      }

      console.log('$scope.product.variations.length ', $scope.product.variations.length);
      // if ($scope.product.variations.length <= 0) {
      //     $scope.showVariations = false;
      //     $scope.product.variations = [{
      //         "id": $scope.product._id + '-1',
      //         "type": $scope.product.type,
      //         "permalink": "https://example/product/ship-your-idea-10/?attribute_pa_color=black",
      //         "sku": "",
      //         "price": "19.99",
      //         "regular_price": "19.99",
      //         "sale_price": null,
      //         "taxable": true,
      //         "tax_status": "taxable",
      //         "tax_class": "",
      //         "managing_stock": false,
      //         "stock_quantity": 0,
      //         "in_stock": true,
      //         "backordered": false,
      //         "purchaseable": true,
      //         "visible": true,
      //         "on_sale": false,
      //         "weight": null,
      //         "dimensions": {
      //             "length": "",
      //             "width": "",
      //             "height": "",
      //             "unit": "cm"
      //         },
      //         "shipping_class": "",
      //         "shipping_class_id": null,
      //         "image": [{
      //             "id": 610,
      //             "created_at": "2015-01-22T20:37:18Z",
      //             "updated_at": "2015-01-22T20:37:18Z",
      //             "src": "http://example/wp-content/uploads/2015/01/ship-your-idea-black-front.jpg",
      //             "title": "",
      //             "alt": "",
      //             "position": 0
      //         }],
      //         "attributes": [{
      //             "name": "Color",
      //             "slug": "color",
      //             "option": "black"
      //         }],
      //         "downloads": [],
      //         "download_limit": 0,
      //         "download_expiry": 0
      //     }];
      // } else {
      //     $scope.showVariations = true;
      // }

    });

    /*
     * @insertMedia
     * - insert media function
     */

    $scope.insertMedia = function (asset) {
      $scope.product.icon = asset.url;
    };

    /*
     * @addAttribute
     * - add an attribute
     */

    $scope.addAttribute = function () {
      console.log('addAttribute');
      var tempAttribute = {
        "name": "",
        "values": []
      };
      $scope.product.attributes.push(tempAttribute);
      toaster.pop('success', 'New attribute has been added.');
    };

    /*
     * @addDownload
     * - add a download
     */

    $scope.addDownload = function () {
      console.log('addDownload');
      var tempDownload = {
        'id': Math.uuid(8),
        'name': '',
        'file': ''
      };

      $scope.product.downloads.push(tempDownload);
      toaster.pop('success', 'New download has been added.');
    };

    /*
     * @removeAttribute
     * - remove an attribute
     */

    $scope.removeAttribute = function (index) {
      var formattedAttributes = [];
      var attributeRemoved = [];
      _.each($scope.product.attributes, function (attribute, i) {
        if (i !== index) {
          formattedAttributes.push(attribute);
        } else {
          attributeRemoved.push(attribute);
        }
      });
      $scope.product.attributes = formattedAttributes;
      var name;
      if (attributeRemoved[0].name.length > 0) {
        name = attributeRemoved[0].name;
      } else {
        name = 'Empty Attribute';

      }
      toaster.pop('error', name + ' attribute has been removed.');
    };

    $scope.ldloading = {};
    $scope.clickBtn = function (style) {
      $scope.ldloading[style.replace('-', '_')] = true;
      $timeout(function () {
        $scope.ldloading[style.replace('-', '_')] = false;
      }, 2000);
    };

    /*
     * @saveProductFn
     * - save product function
     */

    $scope.saveProductFn = function () {
      ProductService.saveProduct($scope.product, function (product) {
        //format variation attributes
        $scope.originalProduct = angular.copy(product);
        toaster.pop('success', 'Product Saved.');
      });
    };

    $scope.removeVariation = function () {
      console.log('removeVariation');
    };

    $scope.productStatusOptions = [{
      name: 'Active',
      value: 'active'
    }, {
      name: 'Backorder',
      value: 'backorder'
    }, {
      name: 'Inactive',
      value: 'inactive'
    }];

    $scope.productTypeOptions = [
      // {
      //     name: 'Physical',
      //     value: 'physical'
      // },
      {
        name: 'Digital',
        value: 'digital'
      }, {
        name: 'Subscription',
        value: 'subscription'
      }, {
        name: 'External',
        value: 'external'
      }, {
        name: 'Virtual',
        value: 'virtual'
      }
    ];

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
}(angular));
