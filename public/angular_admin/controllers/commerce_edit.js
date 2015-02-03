define(['app', 'commonutils', 'ngProgress', 'mediaDirective', 'stateNavDirective', 'productService', 'paymentService', 'angularUI', 'ngAnimate', 'angularBootstrapSwitch', 'jquery', 'bootstrap-iconpicker-font-awesome', 'bootstrap-iconpicker', 'userService', 'toasterService', 'datepicker', 'angularMoney', 'combinatorics', 'intervalCountValidationDirective'], function(app) {
    app.register.controller('CommerceEditCtrl', ['$scope', '$q', 'ngProgress', '$stateParams', 'ProductService', 'PaymentService', 'UserService', 'ToasterService', '$state',
        function($scope, $q, ngProgress, $stateParams, ProductService, PaymentService, UserService, ToasterService, $state) {
            ngProgress.start();

            var productPlanStatus = {};
            var productPlanSignupFee = {};

            $scope.showToaster = false;
            //back button click function
            $scope.$back = function() {
                window.history.back();
            };
            ngProgress.complete();

            $scope.productId = $stateParams.id;

            $scope.plans = [];

            $scope.planEdit = false;
            $scope.saveLoading = false;
            $scope.newSubscription = {
                planId: $$.u.idutils.generateUniqueAlphaNumericShort()
            };

            $scope.signup_fee = null;

            ProductService.getProduct($scope.productId, function(product) {
                $scope.product = product;
                var promises = [];
                if (angular.isDefined($scope.product.icon) && !$scope.product.is_image)
                    $('#convert').iconpicker('setIcon', $scope.product.icon);

                if ($scope.product.variantSettings === undefined)
                    $scope.product.variantSettings = {
                        options: [{
                            type: null,
                            values: []
                        }],
                        variants: [{}]
                    };

                if ('stripePlans' in $scope.product.product_attributes) {
                    $scope.product.product_attributes.stripePlans.forEach(function(value, index) {
                        promises.push(PaymentService.getPlanPromise(value.id));
                        productPlanStatus[value.id] = value.active;
                        productPlanSignupFee[value.id] = value.signup_fee;
                    });
                    $q.all(promises)
                        .then(function(data) {
                            data.forEach(function(value, index) {
                                value.data.active = productPlanStatus[value.data.id];
                                value.data.signup_fee = productPlanSignupFee[value.data.id];
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

            $scope.addSubscriptionFn = function(showToast) {

                if ($scope.user.stripeId === undefined || $scope.user.stripeId === null || $scope.user.stripeId == '') {
                    ToasterService.setPending('error', 'Need to add a stripe account first.');
                    $scope.userPreferences.account_default_tab = 'integrations';
                    $scope.savePreferencesFn();
                    $state.go('account');
                }
                console.log('$scope.newSubscription >>> ', $scope.newSubscription);
                $scope.newSubscription.amount = $scope.newSubscription.amount * 100;
                PaymentService.postCreatePlan($scope.newSubscription, function(subscription) {
                	subscription.signup_fee = $scope.signup_fee;
                    $scope.plans.push(subscription);
                    var price =  parseInt(subscription.amount);
                    if ('stripePlans' in $scope.product.product_attributes) {
                        $scope.product.product_attributes.stripePlans.push({
                            id: subscription.id,
                            active: true,
                            signup_fee: $scope.signup_fee,
                            price: price,
                        });
                    } else {
                        $scope.product.product_attributes.stripePlans = [{
                            id: subscription.id,
                            active: true,
                            signup_fee: $scope.signup_fee,
                            price: price,
                        }];
                    }
                    

                    productPlanStatus[subscription.id] = true;
                    $scope.saveProductFn();
                    $scope.newSubscription = {
                        planId: $$.u.idutils.generateUniqueAlphaNumericShort()
                    };
                    $scope.signup_fee = null;
                }, showToast);
            };

            $scope.editSubscriptionFn = function(planId) {
                $scope.planDeleteFn(planId, false, function() {
                    $scope.addSubscriptionFn(false);
                    $scope.editCancelFn();
                    ToasterService.show('success', 'Plan updated.');
                });
            };

            $scope.saveProductFn = function() {
                $scope.saveLoading = true;
                var variants = [];
                $scope.product.variantSettings.variants.forEach(function(value, index) {
                    if (value.create == true) {
                        variants.push(value);
                    }
                });
                $scope.product.variantSettings.variants = variants;

                console.log('$scope.product >>> ', $scope.product);
                ProductService.saveProduct($scope.product, function(product) {
                    console.log('Save Product >>> ', product);
                    $scope.saveLoading = false;
                });
            };

            $scope.planEditFn = function(planId) {
                $scope.planEdit = true;
                $scope.plans.forEach(function(value, index) {
                    if (value.id == planId) {
                        $scope.newSubscription = angular.copy(value);
                        $scope.newSubscription.amount = $scope.newSubscription.amount / 100;
                        $scope.newSubscription.planId = value.id;
                        $scope.signup_fee = productPlanSignupFee[value.id];
                    }
                });
            };

            $scope.editCancelFn = function() {
                $scope.planEdit = false;
                $scope.newSubscription = {
                    planId: $$.u.idutils.generateUniqueAlphaNumericShort()
                };
            };

            $scope.planDeleteFn = function(planId, showToast, fn) {
                var fn = fn || false;
                PaymentService.deletePlan(planId, function() {
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
                    
                    if (fn) {
                        fn();
                    }

                    $scope.saveProductFn();

                }, showToast);
            };

            $scope.max_value = function(hash) {
                if(hash) {
                    var price = {};
                if (hash[0] && hash[0].price) {
                    price = _.max(hash, function(p){ return p.price; });
                    return _.filter([(price.price/100).toFixed(2), '(', price.signup_fee, ')'], function(str) {
                                        return (str !== "");
                                    }).join(" ");
                }
              }
            }

        $scope.min_value = function(hash) {
          if(hash) {
                var price = {};
                if (hash[0] && hash[0].price) {
                    price = _.min(hash, function(p){ return p.price; });
                    
                    return _.filter([(price.price/100).toFixed(2), '(', price.signup_fee, ')'], function(str) {
                                    return (str !== "");
                                }).join(" ");
                }
          }
        }

            $scope.planToggleActiveFn = function(planId, active) {
                $scope.product.product_attributes.stripePlans.forEach(function(value, index) {
                    if (value.id == planId) {
                        $scope.product.product_attributes.stripePlans[index].active = active;
                    }
                });
                $scope.saveProductFn();
            };

            $scope.addOptionFn = function() {
                $scope.product.variantSettings.options.push({
                    type: null,
                    values: []
                });
            };

            $scope.addVariantFn = function() {
                $scope.product.variantSettings.variants.push({});
            };

            $scope.insertMedia = function(asset) {
                $scope.product.icon = asset.url;
            };

            UserService.getUser(function(user) {
                $scope.user = user;
            });

            $scope.$watch('product.variantSettings.options', function(newValue, oldValue) {
                if (newValue) {
                    $scope.autoGenerateVariantCount = 0;
                    newValue.forEach(function(value, index) {
                        if ($scope.autoGenerateVariantCount) {
                            if (value.values.length) {
                                $scope.autoGenerateVariantCount *= value.values.length;
                            }
                        } else {
                            $scope.autoGenerateVariantCount = value.values.length;
                        }
                    });
                } else {
                    $scope.autoGenerateVariantCount = 0;
                }
            }, true);

            $scope.$watch('autoGenerateVariant', function(newValue, oldValue) {
                if (newValue) {
                    var args = [];
                    $scope.product.variantSettings.options.forEach(function(value, index) {
                        if (value.values.length) {
                            var tmpList = [];
                            value.values.forEach(function(tag, index) {
                                tmpList.push(tag.text);
                            });
                            args.push(tmpList);
                        }
                    });

                    Combinatorics.cartesianProduct.apply(this, args).toArray().forEach(function(value, index) {
                        $scope.product.variantSettings.variants.push({
                            name: value.join(' / ')
                        });
                    });
                } else {
                    if ($scope.product !== undefined && $scope.product.variantSettings !== undefined) {
                        var variants = [];
                        $scope.product.variantSettings.variants.forEach(function(value, index) {
                            if (value.create == true) {
                                variants.push(value);
                            }
                        });
                        $scope.product.variantSettings.variants = variants;
                    }
                }
            });
        }
    ]);
});
