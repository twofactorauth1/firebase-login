define(['app', 'stripe', 'toasterService'], function(app) {
    app.register.service('PaymentService', ['$http', 'ToasterService','ENV',
        function($http, ToasterService, ENV) {
            var baseUrl = '/api/1.0/';
            Stripe.setPublishableKey(ENV.stripeKey);

            this.getStripeCardToken = function(cardInput, fn) {
                Stripe.card.createToken(cardInput, function(status, response) {
                    if (status !== 200) {
                        ToasterService.show('error', response.error.message);
                    } else {
                        ToasterService.show('success', 'Card added successfully.');
                    }
                    fn(response.id);
                });
            };

            this.postStripeCustomer = function(cardToken, fn) {
                var apiUrl = baseUrl + ['integrations', 'payments', 'customers'].join('/');
                $http.post(apiUrl, {
                        cardToken: cardToken
                    })
                    .success(function(data, status, headers, config) {
                        fn(data);
                    });
            };

            this.getCustomers = function(fn) {
                var apiUrl = baseUrl + ['integrations', 'payments', 'customers'].join('/');
                $http.get(apiUrl)
                    .success(function(data, status, headers, config) {
                        fn(data);
                    });
            };

            this.putCustomerCard = function(stripeId, cardToken, fn) {
                console.log('putCustomerCard');
                console.log('stripeId ', stripeId);
                console.log('cardToken ', cardToken);
                var apiUrl = baseUrl + ['integrations', 'payments', 'customers', stripeId, 'cards', cardToken].join('/');
                $http.put(apiUrl)
                    .success(function(data, status, headers, config) {
                        ToasterService.show('success', 'Card saved.');
                        fn(data);
                    });
            };

            this.deleteCustomerCard = function(stripeId, cardId, showToast, fn) {
                console.log('deleteCustomerCard');
                var showToast = showToast || false;
                var apiUrl = baseUrl + ['integrations', 'payments', 'customers', stripeId, 'cards', cardId].join('/');
                $http.delete(apiUrl)
                    .success(function(data, status, headers, config) {
                        if (showToast) {
                            ToasterService.show('success', 'Card deleted.');
                        }
                        fn(data);
                    });
            };

            this.getCustomerCards = function(stripeId, successFn, errorFn) {
                console.log('getCustomerCards');
                console.log('stripeId ', stripeId);
                console.log('successFn ', successFn);
                console.log('errorFn ', errorFn);
                var apiUrl = baseUrl + ['integrations', 'payments', 'customers', stripeId, 'cards'].join('/');
                $http.get(apiUrl)
                    .success(function(data, status, headers, config) {
                        successFn(data);
                    })
                    .error(function(data, status, headers, config) {
                        errorFn(data);
                    });
            };

            this.getStripeCustomer = function(fn) {
                console.log('get stripe customer');
                var apiUrl = baseUrl + ['integrations', 'payments', 'customers'].join('/');
                $http.get(apiUrl)
                    .success(function(data, status, headers, config) {
                        fn(data);
                    });
            };

            this.getUpcomingInvoice = function(stripeId, fn) {
                var apiUrl = baseUrl + ['integrations', 'payments', 'upcomingInvoice'].join('/');
                $http.get(apiUrl)
                    .success(function(data, status, headers, config) {
                        fn(data);
                    });
            };

            this.getUpcomingInvoiceForCustomer = function(stripeId, fn) {
                var apiUrl = baseUrl + ['integrations', 'payments', 'customers', stripeId, 'upcomingInvoice'].join('/');
                $http.get(apiUrl)
                    .success(function(data, status, headers, config) {
                        fn(data);
                    });
            };


            this.getAllInvoices = function(fn) {
                var apiUrl = baseUrl + ['integrations', 'payments', 'invoices'].join('/');
                $http.get(apiUrl)
                    .success(function(data, status, headers, config) {
                        fn(data);
                    });
            };

            this.getInvoicesForAccount = function(fn) {
                var apiUrl = baseUrl + ['integrations', 'payments', 'account', 'invoices'].join('/');
                $http.get(apiUrl)
                    .success(function(data, status, headers, config) {
                        fn(data);
                    });
            }

            this.postCreatePlan = function(newProduct, fn, showToast) {
                var showToast = showToast || false;
                var apiUrl = baseUrl + ['integrations', 'payments', 'plans'].join('/');
                $http.post(apiUrl, newProduct)
                    .success(function(data, status, headers, config) {
                        if (showToast) {
                            ToasterService.show('success', 'Plan product created.');
                        }
                        fn(data);
                    });
            };

            this.getListPlans = function(fn) {
                var apiUrl = baseUrl + ['integrations', 'payments', 'plans'].join('/');
                $http.get(apiUrl)
                    .success(function(data, status, headers, config) {
                        fn(data);
                    });
            };

            this.getPlanPromise = function(planId) {
                var apiUrl = baseUrl + ['integrations', 'payments', 'plans', planId].join('/');
                return $http.get(apiUrl);
            };

            this.getIndigenousPlanPromise = function(planId) {
                var apiUrl = baseUrl + ['integrations', 'payments', 'indigenous', 'plans', planId].join('/');
                return $http.get(apiUrl);
            };

            this.getPlan = function(planId, fn) {
                var apiUrl = baseUrl + ['integrations', 'payments', 'plans', planId].join('/');
                $http.get(apiUrl)
                    .success(function(data, status, headers, config) {
                        fn(data);
                    });
            };

            this.postUpdatePlan = function(planId, plan, fn) {
                var apiUrl = baseUrl + ['integrations', 'payments', 'plans', planId].join('/');
                $http.post(apiUrl, plan)
                    .success(function(data, status, headers, config) {
                        ToasterService.show('success', 'Plan updated.');
                        fn(data);
                    });
            };

            this.deletePlan = function(planId, fn, showToast) {
                var showToast = showToast || false;
                var apiUrl = baseUrl + ['integrations', 'payments', 'plans', planId].join('/');
                $http.delete(apiUrl)
                    .success(function(data, status, headers, config) {
                        if (showToast) {
                            ToasterService.show('warning', 'Plan deleted.');
                        }
                        fn(data);
                    });
            };

            this.getListStripeSubscriptions = function(stripeId, fn) {
                var apiUrl = baseUrl + ['integrations', 'payments', 'customers', stripeId, 'subscriptions'].join('/');
                $http.get(apiUrl)
                    .success(function(data, status, headers, config) {
                        fn(data);
                    });
            };

            this.postCreateStripeSubscription = function(stripeId, planId, fn) {
                var apiUrl = baseUrl + ['integrations', 'payments', 'customers', stripeId, 'subscriptions'].join('/');
                $http.post(apiUrl, {
                        plan: planId
                    })
                    .success(function(data, status, headers, config) {
                        ToasterService.show('success', 'Subscribed to plan.');
                        fn(data);
                    });
            };

            this.postSubscribeToIndigenous = function(stripeCustomerId, planId, accountId, fn) {
                console.log('postSubscribeToIndigenous');
                console.log('stripeCustomerId ', stripeCustomerId);
                console.log('planId ', planId);
                console.log('accountId ', accountId);
                var apiUrl = baseUrl + ['integrations', 'payments', 'indigenous', 'plans', planId, 'subscribe'].join('/');
                var params = {
                    customerId: stripeCustomerId
                };
                if (accountId) {
                    params.accountId = accountId;
                }
                $http.post(apiUrl, params)
                    .success(function(data, status, headers, config) {
                        fn(data);
                    });
            };

            this.deleteStripeSubscription = function(stripeId, subId, fn) {
                var apiUrl = baseUrl + ['integrations', 'payments', 'customers', stripeId, 'subscriptions', subId].join('/');
                $http.delete(apiUrl)
                    .success(function(data, status, headers, config) {
                        ToasterService.show('warning', 'Unsubscribed from old plan.');
                        fn(data);
                    });
            };

        }
    ]);
});
