/*global app*/
/*jslint unparam: true*/
'use strict';
(function (angular) {
  app.service('AccountService', ['$http', '$q', function ($http, $q) {
    var baseUrl = '/api/1.0/account/';
      /**
      * For search user by username/email
      */
    var baseSearchUrl = '/api/1.0/user/';
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


    this.getUpdatedAccount = function (fn) {
      var apiUrl = baseUrl;
      $http.get(apiUrl + '?hash_id=' + Math.random())
        .success(function (data) {
          if (fn) {
            console.log('resolve >>> ');
            fn(data);
          }
        })
        .error(function (err) {
          console.warn('END:Account Service with ERROR');
          fn(err, null);
        });
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


    this.getUsersByAccount = function(id, fn) {
      var apiUrl = baseUrl + ['users'].join('/');
      $http.get(apiUrl)
      .success(function(data, status, headers, config) {
        fn(data);
      });
    };
    this.findUserByUsername=function(id, username, password,fn){
        var findUserUrl=baseSearchUrl+['email',username].join('/');
        var that=this;
        $http.get(findUserUrl).success(function(data){
            if(data && false){// stoping user by hard code for as method is not complete
                that.copyExitingUser(data,fn);
            }else{
                that.createUser(id, username, password, fn);
            }
        }).error(function(err){
            fn(err);
        });
    }
    this.createUser=function(id, username, password, fn){
        var apiUrl = baseUrl + ['user'].join('/');
        var body = {
            username:username,
            password:password
        };
        $http.post(apiUrl, body).success(function(data){
            fn(null, data);
        }).error(function(err){
            fn(err);
        });
    }
    this.copyExitingUser=function(exitingUserData,fn){
        console.log("copy this user",exitingUserData)
    }
    this.addNewUser = function(id, username, password, fn) {
        this.findUserByUsername(id, username, password, fn);
        /*var userFound;

        var apiUrl = baseUrl + ['user'].join('/');
        var body = {
            username:username,
            password:password
        };
        $http.post(apiUrl, body).success(function(data){
            fn(null, data);
        }).error(function(err){
            fn(err);
        });*/
    };

    this.removeUserFromAccount = function(userId, fn) {
        var apiUrl = baseUrl + ['user', userId].join('/');
        $http.delete(apiUrl).success(function(data){
            fn(null, data);
        }).error(function(err){
            fn(err);
        });
    };

    this.setUserPassword = function(userId, password, fn) {
        var apiUrl =  baseUrl + ['user', userId, 'password'].join('/');
        var body = {password:password};
        $http.post(apiUrl, body).success(function(data){
            fn(null, data);
        }).error(function(err){
            fn(err);
        });
    };

  }]);
}(angular));
