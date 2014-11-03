/*
 * Getting Pages Data From Database
 *
 * */
'use strict';
mainApp.service('paymentService', ['$http', function ($http) {
    var baseUrl = '/api/1.0/';
      Stripe.setPublishableKey('pk_test_EuZhZHVourE3RaRxELJaYEya');

    this.getStripeCardToken = function(cardInput, fn) {
      Stripe.card.createToken(cardInput, function(status, response) {
        if (status !== 200) {
          console.log('card added successfully', response.error.message);
        } else {
            console.log('card added successfully');
        }
        fn(response.id);
      });
    };

    this.postStripeCustomer = function(cardToken, user, accountId, fn) {
      var apiUrl = baseUrl + ['integrations', 'payments', 'customers'].join('/');
      $http.post(apiUrl, {
          cardToken: cardToken,
          user: user,
          accountId: accountId
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

    this.getStripeCustomer = function(fn) {
      var apiUrl = baseUrl + ['integrations', 'payments', 'customers'].join('/');
      $http.get(apiUrl)
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

}]);