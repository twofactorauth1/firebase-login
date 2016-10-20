'use strict';
/*global app, moment, angular, window*/
/*jslint unparam:true*/
(function (angular) {
    app.controller('ProductsCtrl', ["$scope", "$modal", "$window", "AccountService", "ProductService", "$filter", "productConstant", "ipCookie", "$location", function ($scope, $modal, $window, AccountService, ProductService, $filter, ProductConstant, ipCookie, $location) {
        $scope.tableView = 'list';
        $scope.itemPerPage = 100;
        $scope.showPages = 15;
        $scope.newProduct = {
            status: 'inactive',
            allowAddOns: true
        };
        $scope.sortFields = {'modified.date': -1};

        console.log('ProductConstant.product_types.dp ', ProductConstant.product_types.dp);
        $scope.productTypeOptions = ProductConstant.product_types.dp;

        $scope.checkPaymentAccountExistsFn = function (cb) {
            AccountService.getUpdatedAccount(function (account) {
                var stripe = _.find(account.credentials, function (cred) {
                    return cred.type === 'stripe';
                });
                $scope.stripeAccountExist = stripe;
                var paypal = account.commerceSettings.paypal;

                if (cb && (stripe || paypal)) {
                    cb(true);
                } else {
                    cb(false);
                }
            });
        };

        $scope.checkPaymentAccountExistsFn(function (value) {
            if (value) {
                ProductService.getProductsWithSort($scope.sortFields, function (products) {
                    $scope.products = products;
                    $scope.showProducts = true;
                    $scope.noPaymentAccount = false;
                });
            } else {
                $scope.noPaymentAccount = true;
            }
        });

        $scope.openProductModal = function (size) {
            $scope.modalInstance = $modal.open({
                templateUrl: 'new-product-modal',
                size: size,
                keyboard: false,
                backdrop: 'static',
                scope: $scope
            });
        };

        $scope.openImportModal = function (size) {
            $scope.modalInstance = $modal.open({
                templateUrl: 'import-product-modal',
                size: size,
                keyboard: false,
                backdrop: 'static',
                scope: $scope
            });
        };

        $scope.cancel = function () {
            $scope.modalInstance.close();
        };

        $scope.addProduct = function () {
            $scope.saveLoading = true;
            ProductService.postProduct($scope.newProduct, function (product) {
                $scope.displayedProducts.unshift(product);
                $scope.products.unshift(product);
                $scope.modalInstance.close();
                $scope.newProduct = {};
                $scope.minRequirements = true;
                $scope.saveLoading = false;
            });
        };

        $scope.viewSingleProduct = function (product) {
            $location.path('/commerce/products/' + product._id);
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

        $scope.productImageTypes = [
            {
                label: "Image",
                data: "true"
            },
            {
                label: "No Image",
                data: "false"
            }
        ];

        ProductService.productStatusTypes(function (types) {
            $scope.productStatusTypes = types;
        });
        /*
         * @triggerInput
         * - trigger the hidden input to trick smart table into activating filter
         */

        $scope.triggerInput = function (element, custom) {
            angular.element(element).trigger('input');
        };

        $scope.resizeGrid = function (filtered) {
            $timeout(function () {
                if (!$scope.inserted) {
                    $scope.inserted = true;
                    if ($("tr.product-item").length) {
                        $scope.maxProductHeight = Math.max.apply(null, $("tr.product-item").map(function () {
                            return $(this).height();
                        }).get());
                        $scope.maxProductHeight = $scope.maxProductHeight + 3;
                    }
                }
                $("tr.product-item").css("min-height", $scope.maxProductHeight);
            }, 500)
        }

        $scope.inserted = false;
        $scope.$watch('tableView', function (newValue, oldValue) {
            if (newValue == "grid") {
                $scope.resizeGrid();
            }
        });

        $scope.$watch('displayedProducts', function (newValue, oldValue) {
            if (newValue && $scope.tableView === 'grid') {
                $scope.resizeGrid();
            }
        });

        /*
         * @socailRedirect
         * redirect users to social network and setting up a temporary cookie
         */

        $scope.currentHost = $window.location.host;
        $scope.redirectUrl = '/admin/commerce/products';

        $scope.socailRedirect = function (socialAccount) {
            var account_cookie = ipCookie("socialAccount");
            //Set the amount of time a socialAccount should last.
            var expireTime = new Date();
            expireTime.setMinutes(expireTime.getMinutes() + 10);
            if (account_cookie === undefined) {
                var cookieValue = {
                    "socialAccount": socialAccount,
                    "redirectTo": '/commerce/products'
                };
                ipCookie("socialAccount", cookieValue, {
                    expires: expireTime,
                    path: "/"
                });
            } else {
                //If it does exist, delete it and set a new one with new expiration time
                ipCookie.remove("socialAccount", {
                    path: "/"
                });
                var cookieValue = {
                    "socialAccount": socialAccount,
                    "redirectTo": '/commerce/products'
                };
                ipCookie("socialAccount", cookieValue, {
                    expires: expireTime,
                    path: "/"
                });
            }
            var _redirectUrl = '/redirect/?next=' + $scope.currentHost + '/' + socialAccount.toLowerCase() + '/connect/';
            if (socialAccount === 'Paypal') {
                //$state.go('app.support.helptopics');
                //return;
                _redirectUrl = '/admin/#/support/help-topics?title=adding-paypal-as-an-payment-option'
            }

            $window.location = _redirectUrl;
        };

        $scope.sortFn = function (field) {
            if ($scope.sortFields[field]) {
                if ($scope.sortFields[field] == 1) {
                    $scope.sortFields[field] = -1;
                } else {
                    $scope.sortFields[field] = 1;
                }
            } else {
                $scope.sortFields = {};
                $scope.sortFields[field] = 1;
            }
            ProductService.getProductsWithSort($scope.sortFields, function (products) {
                $scope.products = products;
            });
        };
    }]);
}(angular));
