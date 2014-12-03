define(['app', 'commonutils', 'ngProgress', 'mediaDirective', 'stateNavDirective', 'productService', 'paymentService', 'angularUI', 'ngAnimate', 'angularBootstrapSwitch', 'jquery', 'bootstrap-iconpicker-font-awesome', 'bootstrap-iconpicker', 'userService', 'toasterService', 'datepicker', 'angularMoney'], function(app) {
    app.register.controller('CommerceEditCtrl', ['$scope', '$q', 'ngProgress', '$stateParams', 'ProductService', 'PaymentService', 'UserService', 'ToasterService', '$state',
        function($scope, $q, ngProgress, $stateParams, ProductService, PaymentService, UserService, ToasterService, $state) {
            ngProgress.start();

            var productPlanStatus = {};

            $scope.showToaster = false;
            //back button click function
            $scope.$back = function() {
                window.history.back();
            };
            ngProgress.complete();

            $scope.productId = $stateParams.id;

            $scope.plans = [];

            $scope.planEdit = false;

            $scope.newSubscription = {
                planId: $$.u.idutils.generateUniqueAlphaNumericShort()
            };

            ProductService.getProduct($scope.productId, function(product) {
                $scope.product = product;
                var promises = [];
                if (angular.isDefined($scope.product.icon) && !$scope.product.is_image)
                    $('#convert').iconpicker('setIcon', $scope.product.icon);

                if ('stripePlans' in $scope.product.product_attributes) {
                    $scope.product.product_attributes.stripePlans.forEach(function(value, index) {
                        promises.push(PaymentService.getPlanPromise(value.id));
                        productPlanStatus[value.id] = value.active;
                    });
                    $q.all(promises)
                        .then(function(data) {
                            data.forEach(function(value, index) {
                                value.data.active = productPlanStatus[value.data.id];
                                $scope.plans.push(value.data);
                            });
                        })
                        .catch(function(err) {
                            console.error(err);
                        });
                }

                UserService.getUserPreferences(function(preferences) {
                    $scope.userPreferences = preferences;
                    if ($scope.userPreferences.default_product_icon) {
                        $('#convert-pref').iconpicker('setIcon', $scope.userPreferences.default_product_icon);
                        if ($scope.product.icon === undefined && !$scope.product.is_image) {
                            $('#convert').iconpicker('setIcon', $scope.userPreferences.default_product_icon);
                        }
                    }
                    if ($scope.product.status === undefined) {
                        $scope.product.status = $scope.userPreferences.default_product_status;
                    }
                    $scope.showToaster = true;
                });
            });

            $('#convert').iconpicker({
                iconset: 'fontawesome',
                icon: 'fa-key',
                rows: 5,
                cols: 5,
                placement: 'right',
            });

            $('#convert-pref').iconpicker({
                iconset: 'fontawesome',
                icon: 'fa-key',
                rows: 5,
                cols: 5,
                placement: 'left',
            });

            $('#convert').on('change', function(e) {
                if ($scope.product) {
                    $scope.product.icon = e.icon;
                }
            });

            $('#convert-pref').on('change', function(e) {
                if (e.icon) {
                    $scope.userPreferences.default_product_icon = e.icon;
                } else {
                    $scope.userPreferences.default_product_icon = 'fa-key';
                }
                $scope.savePreferencesFn();
            });

            $scope.savePreferencesFn = function() {
                UserService.updateUserPreferences($scope.userPreferences, $scope.showToaster, function(preferences) {
                    $scope.userPreferences = preferences;
                    if ($scope.product.icon === undefined) {
                        $('#convert').iconpicker('setIcon', $scope.userPreferences.default_product_icon);
                    }

                    if ($scope.product.status === undefined) {
                        $scope.product.status = $scope.userPreferences.default_product_status;
                    }
                });
            };

            $scope.addSubscriptionFn = function() {
                if ($scope.user.stripeId === undefined || $scope.user.stripeId === null || $scope.user.stripeId == '') {
                    ToasterService.setPending('error', 'Need to add a stripe account first.');
                    $scope.userPreferences.account_default_tab = 'integrations';
                    $scope.savePreferencesFn();
                    $state.go('account');
                }
                console.log('$scope.newSubscription >>> ', $scope.newSubscription);
                PaymentService.postCreatePlan($scope.newSubscription, function(subscription) {
                    $scope.plans.push(subscription);
                    if ('stripePlans' in $scope.product.product_attributes) {
                        $scope.product.product_attributes.stripePlans.push({
                            id: subscription.id,
                            active: true
                        });
                    } else {
                        $scope.product.product_attributes.stripePlans = [{
                            id: subscription.id,
                            active: true
                        }];
                    }
                    productPlanStatus[subscription.id] = true;
                    $scope.saveProductFn();
                    $scope.newSubscription = {
                        planId: $$.u.idutils.generateUniqueAlphaNumericShort()
                    };
                });
            };

            $scope.editSubscriptionFn = function(planId) {
                $scope.planDeleteFn(planId);
                $scope.addSubscriptionFn();
                $scope.editCancelFn();
            };

            $scope.saveProductFn = function() {
                console.log('$scope.product >>> ', $scope.product);
                ProductService.saveProduct($scope.product, function(product) {
                    console.log('Save Product >>> ', product);
                });
            };

            $scope.planEditFn = function(planId) {
                $scope.planEdit = true;
                $scope.plans.forEach(function(value, index) {
                    if (value.id == planId) {
                        $scope.newSubscription = value;
                        $scope.newSubscription.planId = value.id;
                    }
                });
            };

            $scope.editCancelFn = function() {
                $scope.planEdit = false;
                $scope.newSubscription = {
                    planId: $$.u.idutils.generateUniqueAlphaNumericShort()
                };
            };

            $scope.planDeleteFn = function(planId) {
                PaymentService.deletePlan(planId, function() {});
                $scope.plans.forEach(function(value, index) {
                    if (value.id == planId) {
                        $scope.plans.splice(index, 1);
                    }
                });

                $scope.product.product_attributes.stripePlans.forEach(function(value, index) {
                    if (value.id == planId) {
                        $scope.product.product_attributes.stripePlans.splice(index, 1);
                    }
                });

                $scope.saveProductFn();
            };

            $scope.planToggleActiveFn = function(planId, active) {
                $scope.product.product_attributes.stripePlans.forEach(function(value, index) {
                    if (value.id == planId) {
                        $scope.product.product_attributes.stripePlans[index].active = active;
                    }
                });
                $scope.saveProductFn();
            };

            $scope.insertMedia = function(asset) {
                $scope.product.icon = asset.url;
            };

            UserService.getUser(function(user) {
                $scope.user = user;
            });
        }
    ]);
});
