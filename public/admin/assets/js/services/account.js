/*global app*/
/*jslint unparam: true*/
'use strict';
(function (angular) {
  app.service('AccountService', ['$http', '$q', function ($http, $q) {
    var baseUrl = '/api/1.0/account/';

    this.mainAccount = null;
    this.getMainAccount = function () {
      return this.mainAccount;
    };

    this.setMainAccount = function (account) {
      this.mainAccount = account;
    };

    this.getAccount = function (fn) {
      var apiUrl = baseUrl;
      var deferred = $q.defer();
      $http.get(apiUrl)
        .success(function (data) {
          if (fn) {
            console.log('resolve >>> ');
            deferred.resolve(fn(data));
          }
          // fn(data);
        })
        .error(function (err) {
          console.warn('END:Account Service with ERROR');
          fn(err, null);
        });

      return deferred.promise;
    };

    //:id/setting
    this.updateAccount = function (account, fn) {
      var apiUrl = baseUrl + [account._id].join('/');
      $http.put(apiUrl, account)
        .success(function (data) {
          fn(data);
        })
        .error(function (error) {
          fn(null, error);
        });
    };

  }]);
}(angular));
