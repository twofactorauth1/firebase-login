/*
 * Verifying Account According to Subdomain
 * */

/*global mainApp ,window ,console */
/* eslint-disable no-console */
mainApp.factory('accountService', ['$location', '$http', function ($location, $http) {
	'use strict';
	var account = {};

	return function (callback) {

		if (Object.getOwnPropertyNames(account).length !== 0) {
			callback(null, account);
		} else {
			//take advantage of precache
			if (window.indigenous.precache && window.indigenous.precache.account) {
				account = window.indigenous.precache.account;
				delete window.indigenous.precache.account;
				callback(null, account);
			} else {
				// API URL: http://yoursubdomain.indigenous.local/api/1.0/account
				$http.get('/api/1.0/account', {
					cache: true
				}).success(function (data) {
					account = data;
					callback(null, data);
				}).error(function (err) {
					console.log('END:Account Service with ERROR ', err);
					callback(err, null);
				});
			}

		}
	};
}]);
