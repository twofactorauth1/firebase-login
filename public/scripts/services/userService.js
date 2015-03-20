/*
 * Verifying Account According to Subdomain
 * */


'use strict';
mainApp.service('userService', ['$http', 'ipCookie', function ($http, ipCookie) {
    var baseUrl = '/api/1.0/';
    this.addContact = function (user, fn) {
        console.log('user ', JSON.stringify(user));
        var apiUrl = baseUrl + ['contact', 'signupnews'].join('/');
        $http({
            url: apiUrl,
            method: "POST",
            data: angular.toJson(user)
        })
        .success(function (data, status, headers, config) {
            console.log('success created ', data);
            fn(data, null);
        })
        .error(function (err) {
            console.log('END:userService with ERROR');
            fn(null, err)
        });
    };

    this.postContact = function (user, fn) {
      console.log('user ', JSON.stringify(user));
      var apiUrl = baseUrl + ['contact'].join('/');
      $http({
        url: apiUrl,
        method: "POST",
        data: angular.toJson(user)
      })
      .success(function (data, status, headers, config) {
        console.log('success created ', data);
        fn(data, null);
      })
      .error(function (err) {
        console.log('END:userService with ERROR');
        fn(null, err)
      });
    };

    this.createUser = function (user, fn) {
        var apiUrl = baseUrl + ['user'].join('/');
        $http({
            url: apiUrl,
            method: "POST",
            data: angular.toJson(user)
        })
        .success(function (data, status, headers, config) {
            fn(data);
        })
        .error(function (err) {
            console.log('END:userService with ERROR', err);
        });
    };

    this.createCustomerUser = function (user, fn) {
        var apiUrl = baseUrl + ['user', 'member' ].join('/');
        $http({
            url: apiUrl,
            method: "POST",
            data: angular.toJson(user)
        })
        .success(function (data, status, headers, config) {
            fn(data);
        })
        .error(function (err) {
            console.log('END:userService with ERROR', err);
        });
    };

    var maxAttempts = 1;
    var attemptNumber = 0;

    this.initializeUser = function(user, fn) {
        var self = this;
        user.session_permanent = ipCookie("permanent_cookie");
        user.fingerprint = new Fingerprint().get();
        var apiUrl = baseUrl + ['user', 'initialize'].join('/');
        $http({
            url: apiUrl,
            method: "POST",
            data: angular.toJson(user)
        })
        .success(function (data, status, headers, config) {
            fn(data);
        })
        .error(function (err) {
            console.log('Attempt #'+attemptNumber+' END:userService with ERROR', err);
            if (attemptNumber < maxAttempts) {
                setTimeout(function(){
                    self.initializeUser(user, fn);
                    attemptNumber+=1;
                },3000);
            } else {
                fn(null);
            }
        });
    };

    this.checkDomainExists = function(businessName, fn) {
        var apiUrl = baseUrl + ['account', businessName, 'available'].join('/');
        $http({
            url: apiUrl,
            method: "GET"
        })
        .success(function (data, status, headers, config) {
            console.log('success created ', data);
            fn(data);
        })
        .error(function (err) {
            console.log('END:userService with ERROR');
        });
    };

    this.checkEmailExists = function(email, fn) {
        var apiUrl = baseUrl + ['user', 'exists', email].join('/');
        console.log('api url >>> ', apiUrl);
        $http({
            url: apiUrl,
            method: "GET"
        })
        .success(function (data, status, headers, config) {
            console.log('checkEmailExisits ', data);
            fn(data);
        })
        .error(function (err) {
            console.log('END:checkEmailExisits with ERROR');
        });
    };

    this.getTmpAccount = function(fn) {
        var apiUrl = baseUrl + ['account', 'tmp'].join('/');
        $http({
            url: apiUrl,
            method: "GET"
        })
        .success(function (data, status, headers, config) {
            console.log('getTmpAccount success  ', data);
            fn(data);
        })
        .error(function (err) {
            console.log('END:getTmpAccount with ERROR');
        });
    };

    this.saveOrUpdateTmpAccount = function(data, fn) {
        var apiUrl = baseUrl + ['account', 'tmp'].join('/');
        $http({
            url: apiUrl,
            method: "POST",
            data: angular.toJson(data)
        })
        .success(function (data, status, headers, config) {
            console.log('saveOrUpdateTmpAccount success  ', data);
            fn(data);
        })
        .error(function (err) {
            console.log('END:saveOrUpdateTmpAccount with ERROR');
        });
    };

    this.postAccountBilling = function (stripeCustomerId, cardToken, fn) {
            var apiUrl = baseUrl + ['account', 'billing'].join('/');
            $http.post(apiUrl, {stripeCustomerId: stripeCustomerId, cardToken: cardToken})
            .success(function (data, status, headers, config) {
                fn(data);
            });
    };

    this.addContactActivity = function (activity, fn) {
        var apiUrl = baseUrl + ['contact', 'activity'].join('/');
        $http({
            url: apiUrl,
            method: "POST",
            data: angular.toJson(activity)
        })
        .success(function (data, status, headers, config) {
            console.log('success created ', data);
            fn(data);
        })
        .error(function (err) {
            console.log('END:userService with ERROR');
            fn(err);
        });
    };

}]);
