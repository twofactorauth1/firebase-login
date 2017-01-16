'use strict';
/*global app, moment, angular*/
/*jslint unparam:true*/
(function (angular) {
    app.controller('BillingCtrl', ["$scope", "$rootScope", "toaster", "$modal", "$location", "$window", "ProductService", "PaymentService", "UserService", "$q", "ToasterService", "ipCookie", function ($scope, $rootScope, toaster, $modal, $location, $window, ProductService, PaymentService, UserService, $q, ToasterService, ipCookie) {

        $scope.number = 1;

        $scope.plus = function () {
            $scope.number++;
        };

        /*
         * @closeModal
         * close the modal instance
         */

        $scope.closeModal = function () {
            $scope.modalInstance.close();
        };

        /*
         * @openModal
         * open any modal by passing modal id
         */

        $scope.openModal = function (modal) {
            $scope.modalInstance = $modal.open({
                templateUrl: modal,
                keyboard: false,
                backdrop: 'static',
                scope: $scope
            });
        };

        $scope._moment = function (_date, options) {
            if (_date.toString().length === 10) {
                _date = _date * 1000;
            }
            var formattedDate = moment(_date);

            if (options) {
                if (options.subtractNum && options.subtractType) {
                    formattedDate = formattedDate.subtract(options.subtractNum, options.subtractType);
                }
                if (options.addNum && options.addType) {
                    if ($scope.planInterval == 'week') {
                        formattedDate = formattedDate.add(7, options.addType);
                    }
                    else if ($scope.planInterval == 'month') {
                        formattedDate = formattedDate.add(1, 'months');
                    }
                    else if ($scope.planInterval == 'year') {
                        formattedDate = formattedDate.add(1, 'years');
                    }
                    else {
                        formattedDate = formattedDate.add(options.addNum, options.addType);
                    }
                    console.log("Formatted date: ")
                    console.log(formattedDate);
                }
            }
            return formattedDate.format("MMMM Do, YYYY");
        };

        $scope.changeInvoice = function (invoice, index) {
            if (invoice) {
                $scope.selectedInvoice = invoice;
                if (invoice.lines.data.length) {
                    $scope.planInterval = _.last(invoice.lines.data).plan.interval;
                }
            }
            $scope.selectedItemIndex = index;
            if(invoice && invoice.discount && invoice.discount.coupon){
                if(invoice.discount.coupon.amount_off)
                    $scope.selectedInvoiceDiscount = (invoice.discount.coupon.amount_off / 100).toFixed( 2 );
                else if(invoice.discount.coupon.percent_off && invoice.subtotal){
                    var coupon_discount = invoice.subtotal * invoice.discount.coupon.percent_off / 100;
                    $scope.selectedInvoiceDiscount = (coupon_discount / 100).toFixed( 2 );
                }
            }
            else{
                $scope.selectedInvoiceDiscount = null;
            }
        };


        /*
         * @updateStripeIdFn
         * -
         */

        $scope.updateStripeIdFn = function (billing) {
            console.log('updateStripeIdFn >>>');
            $scope.currentUser.stripeId = billing.billing.stripeCustomerId;
            $scope.selectPlanView = 'plan';
        };

        /*
         * @invoicePageChangeFn
         * -
         */

        $scope.invoicePageChangeFn = function (invoiceCurrentPage) {
            var begin = ((invoiceCurrentPage - 1) * $scope.invoicePageLimit);
            var end = begin + $scope.invoicePageLimit;
            $scope.pagedInvoices = $scope.invoices.data.slice(begin, end);

        };

        /*
         * @getIndigenousProducts
         * -
         */

        $scope.currentAccount = {};
        $scope.planStatus = {};
        $scope.planlist = {
            list: []
        };
        $scope.addOns = {
            list: []
        };
        $scope.selectedPlan = {};
        $scope.planInterval = "";
        $scope.selectedAddOns = [];

        $scope.customer_id = 0;
        $scope.paymentId = 0;

        //get plans
        ProductService.getIndigenousProducts(function (products) {
            products.forEach(function (product) {
                var productAttrs = product.product_attributes;
                var hasStripePlans = productAttrs.hasOwnProperty('stripePlans') && productAttrs.stripePlans.length;
                // var promises = [];

                var activeStripePlan = _.findWhere(productAttrs.stripePlans, {active: true});

                if (product.name.contains('Managed Services')) {
                    product.managedServices = true;
                } else {
                    product.managedServices = false;
                }

                if (hasStripePlans && activeStripePlan) {
                    PaymentService.getIndigenousStripePlan(activeStripePlan.id, function (plan) {
                        console.log(plan);
                        productAttrs.stripePlans[0] = plan; //populate full plan data
                        $scope.planlist.list.push(product);
                    });
                } else {
                    $scope.addOns.list.push(product);
                }

            });

            $scope.getAccountData();

        });


        $scope.subscriptionSelected = false;

        /*
         * @switchSubscriptionPlanFn
         * -
         */

        $scope.switchSubscriptionPlanFn = function (planId) {
            $scope.selectedPlan = $scope.planlist.list.filter(function (plan) {
                return plan.product_attributes.stripePlans[0].id === planId;
            })[0];
            $scope.subscriptionSelected = planId !== null ? true : false;
            $scope.selectedAddOns = [];
            // $scope.selectedPlan.plan.id = planId;
            // $scope.savePlanFn($scope.subscription.plan.id);
        };

        $scope.$watch('selectedPlan', function () {
            console.warn('$scope.selectedPlan changed: ');
            console.warn($scope.selectedPlan);
        });

        $scope.addInvoiceItem = function (productId) {
            console.log('added: ' + productId);
            $scope.selectedAddOns.push(productId);
        };

        $scope.removeInvoiceItem = function (productId) {
            console.log('removed: ' + productId);
            $scope.selectedAddOns = _.without($scope.selectedAddOns, productId);
        };

        $scope.isSelectedAddon = function (productId) {
            return _.contains($scope.selectedAddOns, productId);
            //return false;
        };
        /*
         * @chooseFirstTime
         * -
         */

        // $scope.chooseFirstTime = function () {
        //   $('#changeCardModal').modal('show');
        //   $scope.firstTime = true;
        //   //set trigger on success of add card service
        // };

        /*
         * @savePlanFn
         * - set new active plan for user
         * - TODO: setup fee, coupon
         */

        $scope.savePlanFn = function (planId, coupon) {
            console.log('savePlanFn >>');

            if ($scope.account.billing.stripeCustomerId) {
                PaymentService.postSubscribeToIndigenous($scope.account.billing.stripeCustomerId, planId, null, $scope.planStatus[planId], $scope.selectedAddOns, coupon, function (subscription) {
                    $scope.cancelOldSubscriptionsFn();
                    $scope.selectedPlan = subscription;
                    console.log('$scope.selectedPlan:');
                    console.log($scope.selectedPlan);
                    PaymentService.getUpcomingInvoice($scope.account.billing.stripeCustomerId, function (upcomingInvoice) {
                        $scope.upcomingInvoice = upcomingInvoice;
                    });
                    PaymentService.getInvoicesForAccount(function (invoices) {
                        $scope.invoices = invoices;
                        $scope.pagedInvoices = $scope.invoices.data.slice(0, $scope.invoicePageLimit);
                    });
                    ToasterService.setPending('success', 'Subscribed to new plan.');
                    $scope.getAccountData();
                    $window.location.reload(true);
                }, function (err) {
                    ToasterService.clearAll();
                    ToasterService.show('error', err.status);
                    $scope.selectedPlan.paymentProcessing = false;
                });
            } else {
                ToasterService.setPending('error', 'No Stripe customer ID.');
            }

            $scope.selectPlanView = 'card';
        };

        /*
         * @cancelOldSubscriptionsFn
         * - cancel all other subscriptions for this user
         */

        $scope.cancelOldSubscriptionsFn = function () {
            $scope.subscriptionsCompleteList.data.forEach(function (value) {
                PaymentService.deleteStripeSubscription(value.customer, value.id, function (subscription) {
                    console.log('subscription ', subscription);
                });
            });
        };

        $scope.hasCard = false;

        /*
         * @watch:currentUser.stripeId
         * -
         */

        $scope.$watch('currentUser.stripeId', function (newValue) {
            console.log('currentUser.stripeId >>> ', newValue);
            if (newValue) {

            }
        });


        //set the onboarding min requirements to true because there are none
        $scope.minRequirements = true;

        /*
         * @getAccount
         * -
         */

        $scope.getAccountData = function () {
            UserService.getAccount(function (account) {
                if (account.locked_sub === undefined || account.locked_sub === true) {
                    ToasterService.show('warning', "No Subscription");
                }
                ToasterService.processPending();
                ToasterService.processHtmlPending();
                $scope.account = account;
                $scope.selectedPlan.paymentProcessing = false;

                console.warn('BillingCtrl, received account:\n', account);

                if (account.billing.subscriptionId) {
                    PaymentService.getStripeSubscription(
                        account.billing.stripeCustomerId,
                        account.billing.subscriptionId,
                        function (subscription) {
                            // $scope.subscription = subscription;
                            $scope.selectedPlan = $scope.planlist.list.filter(function (plan) {
                                return plan.product_attributes.stripePlans[0].id === subscription.plan.id;
                            })[0];
                            console.warn('BillingCtrl, received subscription:\n', subscription);
                        });
                }

                if (account.billing.stripeCustomerId) {
                    PaymentService.getUpcomingInvoice(account.billing.stripeCustomerId, function (upcomingInvoice) {
                        $scope.upcomingInvoice = upcomingInvoice;
                        $scope.planInterval = upcomingInvoice.lines.data[0].plan.interval;
                        console.log("upcoming invoice");
                        console.log(upcomingInvoice);
                    });
                    /*
                     * This should not be part of a watch... we should just DO it
                     */
                    PaymentService.getListStripeSubscriptions(account.billing.stripeCustomerId, function (subscriptions) {
                        $scope.subscriptionsCompleteList = subscriptions;
                        // $scope.selectedPlan = subscriptions.data[0];
                    });


                    PaymentService.getInvoicesForAccount(function (invoices) {
                        $scope.invoices = invoices;
                        $scope.pagedInvoices = $scope.invoices.data.slice(0, $scope.invoicePageLimit);
                        $scope.showToaster = true;
                        ToasterService.processPending();
                        ToasterService.processHtmlPending();
                    });

                    PaymentService.getTransactionsForAccount(function (invoices) {
                        $scope.transactions = invoices;
                        $scope.pagedTransactions = $scope.transactions.data.slice(0, $scope.invoicePageLimit);
                        $scope.showToaster = true;
                        ToasterService.processPending();
                        ToasterService.processHtmlPending();
                    });
                    //console.log('before call to cards:', $scope.account);
                    PaymentService.getCustomerCards($scope.account.billing.stripeCustomerId, function (cards) {
                        if (cards.data.length) {
                            $scope.hasCard = true;
                        }
                    }, function () {
                    });
                }

                // $scope.currentAccount.membership = account.billing.subscriptionId;
                /*
                 * If the account is locked, do not allow state changes away from account.
                 * Commenting this out until we know for sure that we should allow logins from locked accounts.
                 */
                if (account.locked_sub === true) {
                    ToasterService.show('error', 'No Indigenous Subscription found.  Please update your billing information.');
                    $rootScope.$on('$stateChangeStart',
                        function (event) {
                            event.preventDefault();
                            ToasterService.show('error', 'No Indigenous Subscription found.  Please update your billing information.');
                            // transitionTo() promise will be rejected with
                            // a 'transition prevented' error
                        });
                }
            });
        };

    }]);
}(angular));
