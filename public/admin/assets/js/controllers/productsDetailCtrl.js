'use strict';
/*global app, moment, angular, window*/
/*jslint unparam:true*/
(function (angular) {
  app.controller('ProductsDetailCtrl', ["$scope", "$modal", "$timeout", "$state", "$stateParams", "$q", "CommonService", "ProductService", "PaymentService", "UserService", "toaster", "SweetAlert", "productConstant", function ($scope, $modal, $timeout, $state, $stateParams, $q, CommonService, ProductService, PaymentService, UserService, toaster, SweetAlert, ProductConstant) {

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
     * @openMediaModal
     * -
     */

    $scope.openMediaModal = function () {
      $scope.showInsert = true;
      $scope.modalInstance = $modal.open({
        templateUrl: 'media-modal',
        controller: 'MediaModalCtrl',
        size: 'lg',
        resolve: {
          showInsert: function () {
            return $scope.showInsert;
          },
          insertMedia: function () {
            return $scope.insertMedia;
          }
        }
      });
    };

    /*
     * @closeModal
     * -
     */

    $scope.closeModal = function (cancel) {
      if (cancel === true) {
        $scope.editCancelFn();
      } else {
        $scope.modalInstance.close();
      }
    };

    UserService.getUser(function (user) {
      $scope.user = user;
    });

    $scope.pickerOptions = {
      startDate: moment().subtract(29, 'days').toDate(),
      endDate: new Date(),
      format: 'YYYY-MM-DD',
      opens: 'left',
      ranges: {
        'Today': [moment(), moment()],
        'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
        'Last 7 Days': [moment().subtract(6, 'days'), moment()],
        'Last 30 Days': [moment().subtract(29, 'days'), moment()],
        'This Month': [moment().startOf('month'), moment().endOf('month')],
        'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
      }
    };

    /*
     * @getProduct
     * - get single product based on stateparams
     */
    $scope.product_tags = [];
    var productPlanStatus = {};
    var productPlanSignupFee = {};
    $scope.selectedDate = {};

    ProductService.getProduct($stateParams.productId, function (product) {
      console.log(product);
      var startDate = product.sale_date_from;
      var endDate = product.sale_date_to;
      if (!startDate && !endDate) {
        startDate = moment();
        endDate = moment().add(6, 'days');
      }
      $scope.selectedDate.range = {
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      };
      product.regular_price = parseFloat(product.regular_price);
      $scope.product = product;
      console.log('product ', product);
      var p_icon = $scope.product.icon;

      angular.element('#convert').iconpicker({
        iconset: 'fontawesome',
        icon: p_icon,
        rows: 5,
        cols: 5,
        placement: 'right'
      });

      $scope.getProductTags();

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

      var promises = [];
      if ($scope.product.product_attributes.stripePlans) {
        $scope.product.product_attributes.stripePlans.forEach(function (value, index) {
          promises.push(PaymentService.getPlanPromise(value.id));
          productPlanStatus[value.id] = value.active;
          productPlanSignupFee[value.id] = value.signup_fee;
        });
        $q.all(promises)
          .then(function (data) {
            data.forEach(function (value, index) {
              value.data.active = productPlanStatus[value.data.id];
              value.data.signup_fee = productPlanSignupFee[value.data.id];
              $scope.plans.push(value.data);
            });
          })
          .catch(function (err) {
            console.error(err);
          });
      }

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

      if ($scope.currentDownload) {
        console.log('download');
        $scope.currentDownload.file = asset.url;
      } else {
        console.log('product image');
        $scope.product.icon = asset.url;
      }
      $scope.setDownloadId();
    };

    $scope.setDownloadId = function (download) {
      $scope.currentDownload = download;
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
     * @removeDownload
     * - remove a download
     */

    $scope.removeDownload = function (downloadId) {
      console.log('removeDownload');
      var _downloads = _.filter($scope.product.downloads, function (download) {
        return download.id !== downloadId;
      });

      $scope.product.downloads = _downloads;
      toaster.pop('warning', 'Download has been removed.');
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
     * @validateProduct
     * - validate the product before saved
     */

    $scope.validateProduct = function () {
      var _isValid = true;
      if (!$scope.product.name) {
        _isValid = false;        
        $scope.productNameError = true;
      }
      if (!$scope.product.type) {
        _isValid = false;
        $scope.productTypeError = true;
      }
      return _isValid;
    };

    $scope.$watch('product.name', function (newValue) {
      if (newValue && newValue.length > 0) {
        $scope.productNameError = false;
      }
    });

    $scope.$watch('product.type', function (newValue) {
      if (newValue && newValue.length > 0) {
        $scope.productTypeError = false;
      }
    });

    /*
     * @saveProductFn
     * - save product function
     */

    $scope.saveLoading = false;

    $scope.saveProductFn = function () {
      console.log('$scope.selectedDate ', $scope.selectedDate);
      if ($scope.selectedDate.range) {
        $scope.product.sale_date_from = new Date($scope.selectedDate.range.startDate).toISOString();
        $scope.product.sale_date_to = new Date($scope.selectedDate.range.endDate).toISOString();
      }    
      $scope.setProductTags();
      if ($scope.validateProduct()) {
        $scope.saveLoading = true;
        ProductService.saveProduct($scope.product, function (product) {
          //format variation attributes
          $scope.saveLoading = false;
          $scope.originalProduct = angular.copy(product);
          toaster.pop('success', 'Product Saved.');
        });
      }
    };

    $scope.removeVariation = function () {
      console.log('removeVariation');
    };

   
    ProductService.productStatusTypes(function(types) {
        $scope.productStatusOptions = types;
    });

    $scope.productTypes = ProductConstant.product_types;

    /*
     * @convert:iconpicker
     * - icon picker for product image replacement
     */


    $('#convert').on('change', function (e) {
      if ($scope.product && !$scope.product.is_image) {
        $scope.product.icon = e.icon;
      }
    });

    $scope.newSubscription = {
      planId: CommonService.generateUniqueAlphaNumericShort()
    };

    $scope.plans = [];

    $scope.addSubscriptionFn = function (newSubscription, showToaster) {
      console.log('newSubscription ', newSubscription);
      if ($scope.user.stripeId === undefined || $scope.user.stripeId === null || $scope.user.stripeId === '') {
        toaster.pop('error', 'Need to add a stripe account first.');
        $state.go('account');
      }
      $scope.newSubscription = newSubscription;
      var subscription_fee = $scope.signup_fee;
      $scope.newSubscription.amount = $scope.newSubscription.amount * 100;
      PaymentService.postCreatePlan($scope.newSubscription, function (subscription) {
        $scope.signup_fee = subscription_fee;
        subscription.signup_fee = subscription_fee;
        $scope.plans.push(subscription);
        var price = parseInt(subscription.amount, 10);
        if ($scope.product.product_attributes.stripePlans) {
          $scope.product.product_attributes.stripePlans.push({
            id: subscription.id,
            active: true,
            signup_fee: subscription_fee,
            price: price,
          });
        } else {
          $scope.product.product_attributes.stripePlans = [{
            id: subscription.id,
            active: true,
            signup_fee: subscription_fee,
            price: price,
          }];
        }


        productPlanStatus[subscription.id] = true;
        productPlanSignupFee[subscription.id] = $scope.signup_fee;
        $scope.saveProductFn();

        $scope.newSubscription = {
          planId: CommonService.generateUniqueAlphaNumericShort()
        };
        $scope.signup_fee = null;
        $scope.closeModal('add-subscription-modal');
      }, showToaster);
    };

    $scope.planEditFn = function (planId) {
      console.log('planEditFn');
      $scope.editingPlan = true;
      $scope.openModal('add-subscription-modal');
      $scope.plans.forEach(function (value, index) {
        if (value.id === planId) {
          $scope.newSubscription = angular.copy(value);
          $scope.newSubscription.amount = $scope.newSubscription.amount / 100;
          $scope.newSubscription.planId = value.id;
          $scope.signup_fee = productPlanSignupFee[value.id];
        }
      });
    };

    $scope.editCancelFn = function () {
      $scope.editingPlan = false;
      $scope.saveLoadingPlan = false;
      $scope.signup_fee = null;
      $scope.newSubscription = {
        planId: CommonService.generateUniqueAlphaNumericShort()
      };
      $scope.closeModal('add-subscription-modal');
    };

    $scope.planDeleteFn = function (planId, showToast, saveProduct, func) {
      var fn = func || false;
      PaymentService.deletePlan(planId, showToast, function () {
        $scope.plans.forEach(function (value, index) {
          if (value.id === planId) {
            $scope.plans.splice(index, 1);
          }
        });

        $scope.product.product_attributes.stripePlans.forEach(function (value, index) {
          if (value.id === planId) {
            $scope.product.product_attributes.stripePlans.splice(index, 1);
          }
        });

        if (fn) {
          fn();
        }

        if (saveProduct) {
          $scope.saveProductFn();
        }

      }, true);
    };

    $scope.editSubscriptionFn = function (newSubscription) {
      $scope.saveLoadingPlan = true;
      $scope.planDeleteFn(newSubscription.planId, false, false, function () {
        $scope.addSubscriptionFn(newSubscription, false);
        $scope.editCancelFn();
        toaster.pop('success', 'Plan updated.');
      });
    };

    $scope.getProductTags = function () {
      if ($scope.product.tags) {
        $scope.product.tags.forEach(function (v, i) {
          $scope.product_tags.push({
            text: v
          });
        });
      }
    };

    $scope.setProductTags = function () {
      $scope.product.tags = [];
      $scope.product_tags.forEach(function (v, i) {
        if (v.text) {
          $scope.product.tags.push(v.text);
        }
      });
    };

    /*
     * @checkSalePrice
     * - check the sale to price to ensure its not more than the price
     */

    $scope.checkSalePrice = function () {
      console.log('sales_price ', $scope.product.sales_price);
    };

    /*
     * @deleteCustomerFn
     * -
     */

    $scope.deleteProductFn = function (product) {
      SweetAlert.swal({
        title: "Are you sure?",
        text: "Do you want to delete this product?",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, do not delete it!",
        closeOnConfirm: true,
        closeOnCancel: true
      }, function (isConfirm) {
        if (isConfirm) {
          ProductService.deleteProduct(product._id, function () {
            toaster.pop('warning', 'Customer Deleted.');
            $state.go('app.commerce.products');
          });
        }
      });
    };


  }]);
}(angular));
