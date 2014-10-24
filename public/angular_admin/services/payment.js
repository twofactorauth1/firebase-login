define(['app', 'stripe'], function(app) {
  app.register.service('PaymentService', function($http) {
    var baseUrl = '/api/1.0/';
    Stripe.setPublishableKey('pk_test_EuZhZHVourE3RaRxELJaYEya');

    this.getStripeCardToken = function(cardInput, fn) {
      Stripe.card.createToken(cardInput, function(status, response) {
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
          fn(data);
        });
    };

    this.deleteStripeSubscription = function(stripeId, subId, fn) {
      var apiUrl = baseUrl + ['integrations', 'payments', 'customers', stripeId, 'subscriptions', subId].join('/');
      $http.delete(apiUrl)
        .success(function(data, status, headers, config) {
          fn(data);
        });
    };

  });
});
