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

            $scope.firstTime = false;

            $scope.plusOneMonth = function(date) {
                var date = moment(date);
                return date.add(1, 'months').format('MMMM D, YYYY');
            };

            for (var key in $scope.credentialTypes) {
                $scope.userSocial[$scope.credentialTypes[key]] = {status: false, image: null, username: null};
            }
            $scope.onboardingSteps = [];
            $scope.showOnboarding = false;
            $scope.stepIndex = 0;
            $scope.beginOnboarding = function(type) {
                if (type == 'connect-social') {
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
                if ($scope.userPreferences) {
                    if (!$location.$$search.onboarding) {
                        $scope.userPreferences.account_default_tab = newValue;
                    }
                    $scope.savePreferencesFn();
                }
            });

            // $scope.updateStripeIdFn = function() {
            //     if ($scope.validateCard()) {
            //         console.log('validated and updating');
            //         // $scope.user.stripeId = billing.billing.stripeCustomerId;
            //         // $scope.selectPlanView = 'plan';
            //          //credit card

            //           var card = {
            //             number: $('#number').val(),
            //             cvc: $('#cvc').val(),
            //             exp_month: parseInt($('#expiry').val().split('/')[0]),
            //             exp_year: parseInt($('#expiry').val().split('/')[1])
            //           };

            //           var cc_name = $('#name').val();

            //           console.info(card.number);
            //           console.info(card.cvc);
            //           console.info(card.exp_month);
            //           console.info(card.exp_year);
            //           console.info(cc_name);
            //     }
            // };

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
            $scope.planStatus = {};

            //get plans
            var productId = "3d6df0de-02b8-4156-b5ca-f242ab18a3a7";
            ProductService.getIndigenousProducts(function(products) {
                var product = _.findWhere(products, {
                    _id: productId
                });

                $scope.paymentFormProduct = product;
                var promises = [];
                $scope.subscriptionPlans = [];
                if ('stripePlans' in $scope.paymentFormProduct.product_attributes) {
                    $scope.paymentFormProduct.product_attributes.stripePlans.forEach(function(value, index) {
                        if (value.active)
                            $scope.planStatus[value.id] = value;
                            promises.push(PaymentService.getIndigenousPlanPromise(value.id));
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

            $scope.subscriptionSelected = false;

            $scope.switchSubscriptionPlanFn = function(planId) {
                $scope.subscription = {
                    plan : {
                        id: null
                    }
                };
                $scope.subscriptionSelected = true;
                $scope.subscription.plan.id = planId;
            };

            $scope.chooseFirstTime = function(planId) {
                $('#changeCardModal').modal('show');
                $scope.firstTime = true;
                //set trigger on success of add card service
            };

            $scope.savePlanFn = function(planId) {
                if ($scope.user.stripeId) {
                    PaymentService.postSubscribeToIndigenous($scope.user.stripeId, planId, null, $scope.planStatus[planId], function(subscription) {
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

            $scope.hasCard = false;

            $scope.$watch('user.stripeId', function(newValue, oldValue) {
                if (newValue) {
                    PaymentService.getListStripeSubscriptions(newValue, function(subscriptions) {
                        $scope.subscriptions = subscriptions;
                        $scope.subscription = subscriptions.data[0];
                    });

                    PaymentService.getUpcomingInvoice(newValue, function(upcomingInvoice) {
                        $scope.upcomingInvoice = upcomingInvoice;
                    });

                    ngProgress.complete();

                    if ($scope.user.stripeId) {
                        PaymentService.getInvoicesForAccount(function(invoices) {
                            $scope.invoices = invoices;
                            $scope.pagedInvoices = $scope.invoices.data.slice(0, $scope.invoicePageLimit);
                            $scope.showToaster = true;
                            ToasterService.processPending();
                        });
                        PaymentService.getCustomerCards($scope.user.stripeId, function(cards) {
                            if (cards.data.length) {
                                $scope.hasCard = true;
                            }
                        });

                        if ($scope.firstTime) {
                            $scope.savePlanFn($scope.subscription.plan.id);
                            $scope.firstTime = false;
                        }
                    }
                }
            });

            UserService.getAccount(function(account) {
                $scope.account = account;
                $scope.currentAccount.membership = account.billing.subscriptionId;
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

            // $scope.validateCard = function() {
            //     $scope.checkCardNumber();
            //     $scope.checkCardExpiry();
            //     $scope.checkCardCvv();
            //     $scope.checkCardName();
            //     if ($scope.cardValidated && $scope.expirationValidated && $scope.cvvValidated && $scope.cardNameValidated) {
            //         return true;
            //     }
            // };

            // $scope.checkCardNumber = function() {
            //   var card_number = $('#number').val();
            //   console.log('checking to see if the card numer exists ', card_number);
            //   if (!card_number) {
            //     $("#card_number .error").html("Card Number Required");
            //     $("#card_number").addClass('has-error');
            //   } else if (card_number.length > 16){
            //     $("#card_number .error").html("");
            //     $("#card_number").removeClass('has-error').addClass('has-success');
            //   }
            //   $scope.cardValidated = true;
            // };

            // $scope.checkCardName = function(name) {
            //   var name = $('#card_name #name').val();
            //   console.log('name ', name);
            //   if (!name) {
            //     $("#card_name .error").html("Card Name Required");
            //     $("#card_name").addClass('has-error');
            //   } else {
            //     $("#card_name .error").html("");
            //     $("#card_name").removeClass('has-error').addClass('has-success');
            //   }
            //   $scope.cardNameValidated = true;
            // };

            // $scope.checkCardExpiry = function() {
            //   var expiry = $('#expiry').val();
            //   var card_expiry = expiry.split("/")
            //   var exp_month = card_expiry[0].trim();
            //   var exp_year;
            //   if (card_expiry.length > 1)
            //     exp_year = card_expiry[1].trim();



            //   console.log('checking to see if the card expiry details exists ', card_expiry);

            //   if (!expiry || !exp_month || !exp_year) {
            //     if (!expiry)
            //       $("#card_expiry .error").html("Expiry Required");
            //     else if (!exp_month)
            //       $("#card_expiry .error").html("Expiry Month Required");
            //     else if (!exp_year)
            //       $("#card_expiry .error").html("Expiry Year Required");
            //     $("#card_expiry").addClass('has-error');
            //   } else {
            //     $scope.expirationValidated = true;
            //     $("#card_expiry .error").html("");
            //     $("#card_expiry").removeClass('has-error').addClass('has-success');
            //   }
            // };

            // $scope.checkCardCvv = function() {

            //   var card_cvc = $('#cvc').val();
            //   console.log('checking to see if the card cvc exists ', card_cvc);

            //   if (!card_cvc) {
            //     $("#card_cvc .error").html("CVC Required");
            //     $("#card_cvc").addClass('has-error');
            //   } else {
            //     $scope.cvvValidated = true;
            //     $("#card_cvc .error").html("");
            //     $("#card_cvc").removeClass('has-error').addClass('has-success');
            //   }
            // };

            $scope.savePreferencesFn = function() {
                UserService.updateUserPreferences($scope.userPreferences, $scope.showToaster, function() {});
            };

            $scope.updateDefaultTab = function(user) {
                NavigationService.updateNavigation2(user);
            };

            UserService.getUser(function(user) {
                $scope.user = user;
                angular.forEach($scope.user.profilePhotos, function(value, index) {
                    if (value.type && $scope.userSocial) {
                        $scope.userSocial[value.type].image = value.url;
                    }
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
