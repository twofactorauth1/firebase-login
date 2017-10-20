/*
 * Verifying Account According to Subdomain
 * */
/*global mainApp   */
/* eslint-disable no-console */

mainApp.service('activateAccountService', ['$http', function ($http) {
	'use strict';
	var baseUrl = '/api/1.0/';

    this.getOwnerUsername = function(fn) {
        var apiUrl = baseUrl + ['account', 'owner'].join('/');
        $http.get(apiUrl)
            .success(function (data) {
                fn(data);
            });
    };

    this.activateAccount = function(username, password, templateId, fn) {
        var apiUrl = baseUrl + ['account', 'activate'].join('/');
        var params = {
            username:username,
            password:password,
            templateId:templateId
        };
        $http.post(apiUrl, params)
            .success(function(data){
                fn(null, data);
            }).error(function(err){
                fn(err);}
        );
    };

    this.getAccountTemplates = function(fn) {
        var apiUrl = baseUrl + ['account', 'templates'].join('/');
        $http.get(apiUrl).success(function(data){fn(data);});
    };





}]);
