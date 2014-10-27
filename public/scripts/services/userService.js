/*
 * Verifying Account According to Subdomain
 * */


'use strict';
mainApp.service('userService', function ($http) {
    var baseUrl = '/api/1.0/';
    this.addContact = function (user, fn) {
        var apiUrl = baseUrl + ['contact', 'signupnews'].join('/');
        $http({
            url: apiUrl,
            method: "POST",
            data: angular.toJson(user)
        })
        .success(function (data, status, headers, config) {
            console.log('success created ', data);
            fn(data);
        })
        .error(function (err) {
            console.log('END:userService with ERROR');
        });
    };

    //createUserFromUsernamePassword: function(username, password, email, accountToken, fn) {

    this.createUser = function (user, fn) {
        var apiUrl = baseUrl + ['user'].join('/');
        $http({
            url: apiUrl,
            method: "POST",
            data: angular.toJson(user)
        })
        .success(function (data, status, headers, config) {
            console.log('success created ', data);
            fn(data);
        })
        .error(function (err) {
            console.log('END:userService with ERROR', err);
        });
    };

    //account/' + companyName +'/available
    this.checkDomainExisits = function(businessName, fn) {
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

});