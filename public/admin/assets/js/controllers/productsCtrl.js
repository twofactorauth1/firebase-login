'use strict';
/*global app, moment, angular, window*/
/*jslint unparam:true*/
(function (angular) {
  app.controller('ProductsCtrl', ["$scope", "$modal", "ProductService", function ($scope, $modal, ProductService) {
    $scope.newProduct = {
      status: 'Auto Inactive'
    };
    ProductService.getProducts(function (products) {
      $scope.products = products;
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
      $scope.triggerInput(input);
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

    $scope.triggerInput = function (element) {
      angular.element(element).trigger('input');
    };

  }]);
}(angular));
