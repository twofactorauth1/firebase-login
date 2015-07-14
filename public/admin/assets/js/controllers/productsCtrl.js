'use strict';
/*global app, moment, angular, window*/
/*jslint unparam:true*/
(function (angular) {
  app.controller('ProductsCtrl', ["$scope", "$modal", "AccountService", "ProductService", "$filter", "productConstant", "ipCookie", function ($scope, $modal, AccountService, ProductService, $filter, ProductConstant, ipCookie) {
    $scope.tableView = 'list';
    $scope.itemPerPage = 100;
    $scope.showPages = 15;
    $scope.newProduct = {
      status: 'auto_inactive'
    };

    console.log('ProductConstant.product_types.dp ', ProductConstant.product_types.dp);
    $scope.productTypeOptions = ProductConstant.product_types.dp;

    $scope.checkStripeExists = function (fn) {
      AccountService.getAccount(function(account) {
        var stripe = _.find(account.credentials, function (cred) {
          return cred.type === 'stripe';
        });
        if (fn && stripe) {
          fn(true);
        } else {
          fn(false);
        }
      });
    };

    $scope.checkStripeExists(function (value) {
      if (value) {
        ProductService.getProducts(function (products) {
          $scope.products = products;
          $scope.showProducts = true;
          $scope.noStripe = false;
        });
      } else {
        $scope.noStripe = true;
      }
    });

    $scope.openProductModal = function (size) {
      $scope.modalInstance = $modal.open({
        templateUrl: 'new-product-modal',
        size: size,
        scope: $scope
      });
    };

    $scope.openImportModal = function (size) {
      $scope.modalInstance = $modal.open({
        templateUrl: 'import-product-modal',
        size: size,
        scope: $scope
      });
    };

    $scope.cancel = function () {
      $scope.modalInstance.close();
    };

    $scope.addProduct = function () {
      ProductService.postProduct($scope.newProduct, function (product) {
        $scope.displayedProducts.unshift(product);
        $scope.modalInstance.close();
        $scope.newProduct = {};
        $scope.minRequirements = true;
      });
    };

    $scope.viewSingleProduct = function (product) {
      window.location = '/admin/#/commerce/products/' + product._id;
    };

    $scope.formatStatus = function (status) {
      var formattedStatus = ' -- ';
      if (status) {
        var matchingStatus = _.findWhere($scope.productStatusTypes, {
          data: status
        });
        if (matchingStatus) {
          formattedStatus = matchingStatus.label;
        }
      }

      return formattedStatus;
    };

    /*
     * @clearFilter
     * - clear the filter for the status when the red X is clicked
     */

    $scope.filterProduct = {};

    $scope.clearFilter = function (event, input, filter) {
      $scope.filterProduct[filter] = {};
      $scope.triggerInput(input, false);
    };

    $scope.productImageTypes = [{
      label: "Image",
      data: "true"
    }, {
      label: "No Image",
      data: "false"
    }];

    $scope.productTypes = [{
      label: "Digital",
      data: "digital"
    }, {
      label: "Subscription",
      data: "Subscription"
    }, {
      label: "Physical",
      data: "Physical"
    }, {
      label: "External Link",
      data: "external_link"
    }];

    $scope.productStatusTypes = [{
      label: "Backorder",
      data: "backorder"
    }, {
      label: "Inactive",
      data: "inactive"
    }, {
      label: "Active",
      data: "active"
    }, {
      label: "Auto Inactive",
      data: "auto_inactive"
    }];

    /*
     * @triggerInput
     * - trigger the hidden input to trick smart table into activating filter
     */

    $scope.triggerInput = function (element, custom) {
      angular.element(element).trigger('input');
      if (element === '#searchStatus' && custom) {
        setTimeout(function () {
          $scope.$apply(function () {
            $scope.displayedProducts = _.where($scope.displayedProducts, {
              status: angular.element(element).val()
            });
          })
        }, 500)

      }
    };
    $scope.inserted = false;
    $scope.$watch('tableView', function (newValue, oldValue) {
      if (newValue == "grid") {
        setTimeout(function () {
          if (!$scope.inserted) {
            $scope.inserted = true;
            if ($("tr.product-item").length) {
              var maxProductHeight = Math.max.apply(null, $("tr.product-item").map(function () {
                return $(this).height();
              }).get());
              $("tr.product-item").css("min-height", maxProductHeight + 30);

            }
          }
        }, 500)
      }
    });

    /*
     * @socailRedirect
     * redirect users to social network and setting up a temporary cookie
     */

    $scope.currentHost = window.location.host;
    $scope.redirectUrl = '/admin/commerce/products';

    $scope.socailRedirect = function (socialAccount) {
      var account_cookie = ipCookie("socialAccount");
      //Set the amount of time a socialAccount should last.
      var expireTime = new Date();
      expireTime.setMinutes(expireTime.getMinutes() + 10);
      if (account_cookie === undefined) {
        ipCookie("socialAccount", socialAccount, {
          expires: expireTime,
          path: "/"
        });
      } else {
        //If it does exist, delete it and set a new one with new expiration time
        ipCookie.remove("socialAccount", {
          path: "/"
        });
        ipCookie("socialAccount", socialAccount, {
          expires: expireTime,
          path: "/"
        });
      }

      var _redirectUrl = '/redirect/?next=' + $scope.currentHost + '/'+socialAccount.toLowerCase()+'/connect/callback&redirectTo=' + $scope.redirectUrl + '&socialNetwork=' + socialAccount.toLowerCase();
      console.log('redirectUrl ', _redirectUrl);
      window.location = _redirectUrl;
    };

  }]);
}(angular));
