define(['app', 'userService', 'paymentService', 'skeuocardDirective', 'ngProgress', 'mediaDirective', 'stateNavDirective', 'toasterService', 'accountService', 'navigationService', 'ngOnboarding', 'constants', 'confirmClick2', 'productService'], function(app) {
    app.register.controller('AccountCtrl', ['$scope', '$q', '$location', 'UserService', 'PaymentService', 'ngProgress', 'ToasterService', 'AccountService', 'NavigationService', 'ProductService',
        function($scope, $q, $location, UserService, PaymentService, ngProgress, ToasterService, AccountService, NavigationService, ProductService) {
            ngProgress.start();
            NavigationService.updateNavigation();
            $scope.showToaster = false;

            $scope.invoicePageLimit = 5;

            $scope.selectPlanView = 'card';

            $scope.credentialTypes = $$.constants.user.credential_types;

            $scope.userSocial = {};

            for (var key in $scope.credentialTypes) {
                $scope.userSocial[$scope.credentialTypes[key]] = {status: false, image: null, username: null};
            }

            $scope.beginOnboarding = function(type) {
                if (type == 'connect-social') {
                    $scope.stepIndex = 0;
                    $scope.showOnboarding = true;
                    $scope.activeTab = 'integrations';
                    $scope.onboardingSteps = [{
                        overlay: true,
                        title: 'Task: Connect Social Accounts',
                        description: "Connect your social media accounts to start marketing campaigns and track your customers.",
                        position: 'centered',
                        width: 400
                    }, {
                        overlay: true,
                        title: 'Click Connect Button',
                        position: 'centered',
                        width: 400,
                        description: "Click the connect button on Facebook, Twitter, or Google Plus. You will be redirected to the login screen where you will approve Indigenous for access."
                    }];
                }
            };

            $scope.finishOnboarding = function() {
                console.log('were finished');
            };

            if ($location.$$search.onboarding) {
                $scope.beginOnboarding($location.$$search.onboarding);
            }

            $scope.tabList = [{
                v: 'last_tab_visited',
                n: 'Last Tab Visited'
            }, {
                v: 'website',
                n: 'Website'
            }, {
                v: 'customer',
                n: 'Customer'
            }, {
                v: 'marketing',
                n: 'Marketing'
            }, {
                v: 'commerce',
                n: 'Commerce'
            }, {
                v: 'dashboard',
                n: 'Dashboard'
            }, {
                v: 'account',
                n: 'Account'
            }];

            $scope.$watch('activeTab', function(newValue, oldValue) {
                console.log('watch activeTab >> ', newValue);
                if ($scope.userPreferences) {
                    if (!$location.$$search.onboarding) {
                        $scope.userPreferences.account_default_tab = newValue;
                    }
                    $scope.savePreferencesFn();
                }
            });

            $scope.updateStripeIdFn = function(billing) {
                $scope.user.stripeId = billing.billing.stripeCustomerId;
                $scope.selectPlanView = 'plan';
            };

            $scope.invoicePageChangeFn = function(invoiceCurrentPage, invoiceTotalPages) {
                var begin = ((invoiceCurrentPage - 1) * $scope.invoicePageLimit);
                var end = begin + $scope.invoicePageLimit;
                $scope.pagedInvoices = $scope.invoices.data.slice(begin, end);
            };

            $scope.currentAccount = {};

            //get plans
            var productId = "3d6df0de-02b8-4156-b5ca-f242ab18a3a7";
            ProductService.getProduct(productId, function(product) {
                console.log('product ', product);
                $scope.paymentFormProduct = product;
                var promises = [];
                $scope.subscriptionPlans = [];
                if ('stripePlans' in $scope.paymentFormProduct.product_attributes) {
                    $scope.paymentFormProduct.product_attributes.stripePlans.forEach(function(value, index) {
                        if (value.active)
                            promises.push(PaymentService.getPlanPromise(value.id));
                    });
                    $q.all(promises)
                        .then(function(data) {
                            data.forEach(function(value, index) {
                                $scope.subscriptionPlans.push(value.data);
                            });
                        })
                        .catch(function(err) {
                            console.error(err);
                        });
                }
            });

            $scope.switchSubscriptionPlanFn = function(planId) {
                $scope.account.membership = planId;
            };

            $scope.savePlanFn = function(planId) {
                console.log('planId ', planId);
                console.log('$scope.user.stripeId ', $scope.user.stripeId);
                if ($scope.user.stripeId) {
                    PaymentService.postSubscribeToIndigenous($scope.user.stripeId, planId, null, function(subscription) {
                        console.log('subscription ', subscription);
                        $scope.cancelOldSubscriptionsFn();
                        $scope.subscription = subscription;
                        PaymentService.getUpcomingInvoice($scope.user.stripeId, function(upcomingInvoice) {
                            $scope.upcomingInvoice = upcomingInvoice;
                        });
                        PaymentService.getInvoicesForAccount(function(invoices) {
                            $scope.invoices = invoices;
                            $scope.pagedInvoices = $scope.invoices.data.slice(0, $scope.invoicePageLimit);
                        });
                        ToasterService.setPending('success', 'Subscribed to new plan.');

                    });
                } else {
                    ToasterService.setPending('error', 'No Stripe customer ID.');
                }
                /*
      PaymentService.postCreateStripeSubscription($scope.user.stripeId, planId, function(subscription) {
        $scope.cancelOldSubscriptionsFn();
        $scope.subscription = subscription;
        PaymentService.getUpcomingInvoice($scope.user.stripeId, function(upcomingInvoice) {
          $scope.upcomingInvoice = upcomingInvoice;
        });
        PaymentService.getAllInvoices(function(invoices) {
          $scope.invoices = invoices;
          $scope.pagedInvoices = $scope.invoices.data.slice(0, $scope.invoicePageLimit);
        });
        ToasterService.setPending('success', 'Subscribed to new plan.');
      });
      */
                $scope.selectPlanView = 'card';
            };

            $scope.cancelOldSubscriptionsFn = function() {
                $scope.subscriptions.data.forEach(function(value, index) {
                    PaymentService.deleteStripeSubscription(value.customer, value.id, function(subscription) {});
                });
            };

            $scope.deleteSocialFn = function(type) {
                UserService.deleteUserSocial(type, function() {
                    $scope.userSocial[type].status = false;
                    ToasterService.show('warning', 'Social connection deleted.');
                });
            };

            $scope.$watch('user.stripeId', function(newValue, oldValue) {
                if (newValue) {
                    PaymentService.getListStripeSubscriptions(newValue, function(subscriptions) {
                        $scope.subscriptions = subscriptions;
                        $scope.subscription = subscriptions.data[0];
                    });

                    PaymentService.getUpcomingInvoice(newValue, function(upcomingInvoice) {
                        $scope.upcomingInvoice = upcomingInvoice;
                    });
                }
            });

            UserService.getAccount(function(account) {
                $scope.account = account;
                $scope.currentAccount = account;
            });

            /*
            PaymentService.getAllInvoices(function(invoices) {
              $scope.invoices = invoices;
              $scope.pagedInvoices = $scope.invoices.data.slice(0, $scope.invoicePageLimit);
              ngProgress.complete();
              $scope.showToaster = true;
              ToasterService.processPending();
            });
            */

            PaymentService.getInvoicesForAccount(function(invoices) {
                $scope.invoices = invoices;
                $scope.pagedInvoices = $scope.invoices.data.slice(0, $scope.invoicePageLimit);
                ngProgress.complete();
                $scope.showToaster = true;
                ToasterService.processPending();
            });

            $scope.setActiveTab = function(tab) {
                $scope.showToaster = true;
                $scope.activeTab = tab;
            };
            UserService.getUserPreferences(function(preferences) {
                $scope.userPreferences = preferences;
                if (!$location.$$search.onboarding) {
                    var activeTab = $scope.userPreferences.account_default_tab;
                    if (activeTab)
                        $scope.activeTab = activeTab;
                    else
                        $scope.activeTab = AccountService.getActiveTab();
                }
            });

            $scope.savePreferencesFn = function() {
                UserService.updateUserPreferences($scope.userPreferences, $scope.showToaster, function() {});
            };

            $scope.updateDefaultTab = function(user) {
                NavigationService.updateNavigation2(user);
            };

            UserService.getUser(function(user) {
                $scope.user = user;
                angular.forEach($scope.user.profilePhotos, function(value, index) {
                    $scope.userSocial[value.type].image = value.url;
                });
            });

            UserService.getUserSocial(function(social) {
                social.forEach(function(value, index) {
                    $scope.userSocial[value.type].username = value.username;
                    $scope.userSocial[value.type].status = true;
                });
            });
        }
    ]);
});
