'use strict';
/**
 * service for user
 */
(function(angular) {
  app.service('UserService', function($http) {
    var account, that = this;
    var baseUrl = '/api/1.0/';
    var baseVendorAPIUrlv2 = '/api/1.0/integrations/zi/vendors';
    this.getUser = function(fn) {
      var apiUrl = baseUrl + ['user'].join('/');
      $http.get(apiUrl)
      .success(function(data, status, headers, config) {
        fn(data);
      });
    };

    this.getUsers = function(fn) {
      var apiUrl = baseUrl + ['user', 'members'].join('/');
      $http.get(apiUrl)
      .success(function(data, status, headers, config) {
        fn(data);
      });
    };


    this.putUser = function(user, fn) {
      var apiUrl = baseUrl + ['user', $$.server.userId].join('/');
      $http.put(apiUrl, user)
      .success(function(data, status, headers, config) {
        // ToasterService.show('success', 'User update.');
        fn(data);
      });
    };


    this.editUser = function(user, id, fn) {
      var apiUrl = baseUrl + ['user', id].join('/');
      $http.put(apiUrl, user)
      .success(function(data, status, headers, config) {
        // ToasterService.show('success', 'User update.');
        fn(data);
      });
    };

    this.setPassword = function(password, fn) {
      var apiUrl = baseUrl + ['user', 'password'].join('/');
      console.log('---- UserService.setPassword.api = ', apiUrl);

      var payload = {
        'password': password,
      };

      console.log('---- UserService.setPassword.payload = ', payload);

      $http.post(apiUrl, payload)
          .then(function(response){
            fn(response.data);
          },
          function(error){
            console.error('An error occurred in UserService.setPassword.', error);
          });
    };

    this.getSingleAccount = function(accountId, fn) {
      var apiUrl = baseUrl + ['account', accountId].join('/');
      $http.get(apiUrl)
      .success(function(data, status, headers, config) {
        fn(data);
      });
    };

    this.getAccount = function(fn) {
      var apiUrl = baseUrl + ['account', $$.server.accountId].join('/');
      $http.get(apiUrl)
      .success(function(data, status, headers, config) {
        that.account = data;
        fn(data);
      });
    };

    this.getAccounts = function(fn) {
      var apiUrl = baseUrl + ['user', 'accounts'].join('/');
      $http.get(apiUrl)
      .success(function(data, status, headers, config) {
        fn(data);
      });
    };

    this.putAccount = function(user, fn) {
      var apiUrl = baseUrl + ['account', $$.server.userId].join('/');
      $http.put(apiUrl, user)
      .success(function(data, status, headers, config) {
        fn(data);
      });
    };

    this.postAccountBilling = function(stripeCustomerId, cardToken, fn, errFn) {
      var apiUrl = baseUrl + ['account', 'billing'].join('/');
      $http.post(apiUrl, {
        stripeCustomerId: stripeCustomerId,
        cardToken: cardToken
      })
      .success(function(data, status, headers, config) {
        fn(data);
      })
      .error(function(err){
        if (errFn) {errFn(err);}
      });
    };

    this.getAccountBilling = function(fn) {
      var apiUrl = baseUrl + ['account', 'billing'].join('/');
      $http.get(apiUrl)
      .success(function(data, status, headers, config) {
        fn(data);
      });
    };

    this.postUserSubscribe = function(fn) {
      var apiUrl = baseUrl + ['account', 'billing'].join('/');
      $http.get(apiUrl)
      .success(function(data, status, headers, config) {
        fn(data);
      });
    };

    this.getUserSubscriptions = function(stripeCustomerId, fn) {
      var apiUrl = baseUrl + ['customers', stripeCustomerId, 'subscriptions'].join('/');
      $http.get(apiUrl)
      .success(function(data, status, headers, config) {
        fn(data);
      });
    };

    this.postSubscribeToIndigenous = function(stripeCustomerId, planId, accountId, fn) {
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

    this.postUserSubscriptions = function(stripeCustomerId, planId, fn) {
      var apiUrl = baseUrl + ['integrations', 'payments', 'customers', stripeCustomerId, 'subscriptions'].join('/');
      $http.post(apiUrl, {
        plan: planId
      })
      .success(function(data, status, headers, config) {
        fn(data);
      });
    };

    this.postUserDashboard = function(dashboard, fn) {
      var apiUrl = baseUrl + ['dashboard'].join('/');
      $http.post(apiUrl, {
        config: dashboard
      })
      .success(function(data, status, headers, config) {
        fn(data);
      });
    };

    this.getUserDashboard = function(fn) {
      var apiUrl = baseUrl + ['dashboard'].join('/');
      $http.get(apiUrl)
      .success(function(data, status, headers, config) {
        fn(data);
      });
    };

    this.postUserDashboardUpdate = function(id, dashboard, fn) {
      var apiUrl = baseUrl + ['dashboard', id].join('/');
      $http.post(apiUrl, {
        config: dashboard
      })
      .success(function(data, status, headers, config) {
        fn(data);
      });
    };

    this.checkDuplicateSubdomain = function(subDomain, accountId, fn) {
      var apiUrl = baseUrl + ['account', subDomain, 'duplicate'].join('/');
      $http.get(apiUrl)
      .success(function(data, status, headers, config) {
        fn(data);
      });
    };

    this.getUserPreferences = function(fn) {
      var apiUrl = baseUrl + ['user', 'preferences'].join('/');
      $http.get(apiUrl)
      .success(function(data, status, headers, config) {
        fn(data);
      });
    };

    this.updateUserPreferences = function(preferences, showToaster, fn) {
      var apiUrl = baseUrl + ['user', 'preferences'].join('/');
      $http.post(apiUrl, preferences)
      .success(function(data, status, headers, config) {
        if (showToaster) {
          //ToasterService.show('success', 'Preferences Updated.');
        }
        fn(data);
      });
    };

    this.getUserSocial = function(fn) {
      var apiUrl = baseUrl + ['user', 'social'].join('/');
      $http.get(apiUrl)
      .success(function(data, status, headers, config) {
        fn(data);
      });
    };

    this.deleteUserSocial = function(type, fn) {
      var apiUrl = baseUrl + ['user', 'social', type].join('/');
      $http.delete(apiUrl)
      .success(function(data, status, headers, config) {
        fn(data);
      });
    };

    this.getUserActivity = function(fn) {
      var apiUrl = baseUrl + ['useractivity'].join('/');
      $http.get(apiUrl)
      .success(function(data, status, headers, config) {
        fn(data);
      });
    };

    this.getLoggedInUserActivity = function(fn) {
      var apiUrl = baseUrl + ['useractivity', 'user'].join('/');
      $http.get(apiUrl)
      .success(function(data, status, headers, config) {
        fn(data);
      });
    };
    
    this.findUserByUsername=function(username,fn){
        var findUserUrl=baseUrl+['user','email',username].join('/');
        $http.get(findUserUrl).success(function(data){
            fn(null,data);
        }).error(function(err){
            fn(err);
        });
    };

    this.checkUserByUsername=function(username,fn){
        var findUserUrl=baseUrl+['user','exists',username].join('/');
        $http.get(findUserUrl).success(function(data){
            fn(data);
        }).error(function(err){
            fn(err);
        });
    };

    this.getUserOrganizationConfig = function(fn){
        var apiUrl = baseUrl + ['user','orgConfig'].join('/');
        $http.get(apiUrl).success(function(data){
            fn(null,data);
        }).error(function(err){
            fn(err);
        });
    }

    this.getAccountUsers = function(fn){
        var apiUrl = baseUrl + ['user','members'].join('/');
        $http.get(apiUrl).success(function(data){
            fn(data);
        }).error(function(err){
            fn(err);
        });
    }

    this.updateUserPermisions = function(_id, permissions, fn){
      var apiUrl = baseUrl + ['user', _id, 'permissions'].join('/');
      $http.post(apiUrl, {
        roleAry: permissions
      }).success(function(data, status, headers, config) {
          fn(data);
      });
    }

    this.updateUserProfileImage = function(attachment, _id, fn){
        var _formData = new FormData();
        _formData.append('file', attachment);
        var apiUrl = baseUrl + ['user', 'profile', _id].join('/');
        $http.post(apiUrl, _formData, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        }).success(function(data, status, headers, config) {
            fn(data);
        });
    }

    this.getVendors = function(fn){
      $http.get(baseVendorAPIUrlv2).success(function(data){
            fn(data);
        }).error(function(err){
            fn(err);
        });
    }

  });
})(angular);
