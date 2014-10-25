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

});