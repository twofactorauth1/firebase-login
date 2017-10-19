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



}]);
