define(['app', 'stripe', 'toasterService'], function(app) {
  app.register.service('PaymentService', ['$http', 'ToasterService', function($http, ToasterService) {
    var baseUrl = '/api/1.0/';
    Stripe.setPublishableKey('pk_test_EuZhZHVourE3RaRxELJaYEya');

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

    this.putCustomerCard = function(stripeId, cardToken, fn) {
      var apiUrl = baseUrl + ['integrations', 'payments', 'customers', stripeId, 'cards', cardToken].join('/');
      $http.put(apiUrl)
        .success(function(data, status, headers, config) {
          ToasterService.show('success', 'Card saved.');
          fn(data);
        });
    };

    this.getCustomerCards = function(stripeId, fn) {
      var apiUrl = baseUrl + ['integrations', 'payments', 'customers', stripeId, 'cards'].join('/');
      $http.get(apiUrl)
        .success(function(data, status, headers, config) {
          fn(data);
        });
    };

    this.getStripeCustomer = function(fn) {
      var apiUrl = baseUrl + ['integrations', 'payments', 'customers'].join('/');
      $http.get(apiUrl)
        .success(function(data, status, headers, config) {
          fn(data);
        });
    };

    this.getUpcomingInvoice = function(stripeId, fn) {
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

    this.postCreatePlan = function(newProduct, fn) {
      var apiUrl = baseUrl + ['integrations', 'payments', 'plans'].join('/');
      $http.post(apiUrl, newProduct)
        .success(function(data, status, headers, config) {
          ToasterService.show('success', 'Plan product created.');
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

    this.deletePlan = function(planId, fn) {
      var apiUrl = baseUrl + ['integrations', 'payments', 'plans', planId].join('/');
      $http.delete(apiUrl)
        .success(function(data, status, headers, config) {
          fn(data);
        });
      ToasterService.show('warning', 'Plan deleted.');
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

    this.deleteStripeSubscription = function(stripeId, subId, fn) {
      var apiUrl = baseUrl + ['integrations', 'payments', 'customers', stripeId, 'subscriptions', subId].join('/');
      $http.delete(apiUrl)
        .success(function(data, status, headers, config) {
          ToasterService.show('warning', 'Unsubscribed from old plan.');
          fn(data);
        });
    };

  }]);
});
