/*global mainApp ,console, angular ,Fingerprint */
/*jslint unparam:true*/
/* eslint-disable no-console */
mainApp.service('userService', ['$http', 'ipCookie', function ($http, ipCookie) {
	'use strict';
	var baseUrl = '/api/1.0/';
	this.addContact = function (user, fn) {
		console.log('user >>> ', user);
		var apiUrl = baseUrl + ['contact', 'signupnews'].join('/');
		$http({
			url: apiUrl,
			method: "POST",
			data: angular.toJson(user)
		}).success(function (data) {
			fn(data, null);
		}).error(function (err) {
			console.log('END:userService with ERROR');
			fn(null, err);
		});
	};

	this.postContact = function (user, fn) {
		var apiUrl = baseUrl + ['contact'].join('/');
		$http({
			url: apiUrl,
			method: "POST",
			data: angular.toJson(user)
		}).success(function (data) {
			fn(data, null);
		}).error(function (err) {
			console.log('END:userService with ERROR');
			fn(null, err);
		});
	};

	this.createUser = function (user, fn) {
		var apiUrl = baseUrl + ['user'].join('/');
		$http({
			url: apiUrl,
			method: "POST",
			data: angular.toJson(user)
		}).success(function (data) {
			fn(data);
		}).error(function (err) {
			console.log('END:userService with ERROR', err);
		});
	};

	this.createCustomerUser = function (user, fn) {
		var apiUrl = baseUrl + ['user', 'member'].join('/');
		$http({
			url: apiUrl,
			method: "POST",
			data: angular.toJson(user)
		}).success(function (data) {
			fn(data);
		}).error(function (err) {
			console.log('END:userService with ERROR', err);
		});
	};

	this.initializeUser = function (user, fn) {
		user.session_permanent = ipCookie("permanent_cookie");
        new Fingerprint2().get(function(fingerprint, components){
            user.fingerprint = fingerprint;
            var apiUrl = baseUrl + ['user', 'initialize'].join('/');
            $http({
                url: apiUrl,
                method: "POST",
                data: angular.toJson(user)
            }).success(function (data) {
                fn(null, data);
            }).error(function (err) {
                fn(err, null);
            });
        });

	};

	// TODO: this is poorly named, should be checkDomainAvailable. -jkg
	this.checkDomainExists = function (businessName, fn) {
		var apiUrl = baseUrl + ['account', businessName, 'available'].join('/');
		$http({
			url: apiUrl,
			method: "GET"
		}).success(function (data) {
			fn(null, data);
		}).error(function (err) {
			console.log('END:userService with ERROR', err);
			fn(err, null);
		});
	};


	this.checkEmailExists = function (email, fn) {
		var apiUrl = baseUrl + ['user', 'exists', email].join('/');
		console.log('api url >>> ', apiUrl);
		$http({
			url: apiUrl,
			method: "GET"
		}).success(function (data) {
			fn(data);
		}).error(function (err) {
			console.log('END:checkEmailExisits with ERROR', err);
		});
	};

	this.checkDuplicateEmail = function (email) {
		var apiUrl = baseUrl + ['user', 'exists', email].join('/');
		return $http.get(apiUrl);
	};

	this.getTmpAccount = function (fn) {
		var apiUrl = baseUrl + ['account', 'tmp'].join('/');
		$http({
			url: apiUrl,
			method: "GET"
		}).success(function (data) {
			fn(data);
		}).error(function (err) {
			console.log('END:getTmpAccount with ERROR', err);
		});
	};

	this.getLoggedInUser = function (fn) {
		var apiUrl = baseUrl + ['user'].join('/');
		$http({
			url: apiUrl,
			method: "GET"
		}).success(function (data) {
			fn(data);
		}).error(function (err) {
			console.log('END:getLoggedInUser with ERROR', err);
		});
	};

	this.isAuthenticatedSession = function (fn) {
		var apiUrl = baseUrl + ['user', 'authenticated'].join('/');
		$http({
			url: apiUrl,
			method: "GET"
		}).success(function (data) {
			fn(data.currentSession);
		}).error(function (err) {
			console.log('END:isAuthenticatedSession with ERROR', err);
			fn(false);
		});
	};

	this.saveOrUpdateTmpAccount = function (data, fn) {
		var apiUrl = baseUrl + ['account', 'tmp'].join('/');
		$http({
			url: apiUrl,
			method: "POST",
			data: angular.toJson(data)
		}).success(function (data) {
			fn(data);
		}).error(function (err) {
			console.log('END:saveOrUpdateTmpAccount with ERROR', err);
		});
	};

	this.postAccountBilling = function (stripeCustomerId, cardToken, fn) {
		var apiUrl = baseUrl + ['account', 'billing'].join('/');
		$http.post(apiUrl, {
			stripeCustomerId: stripeCustomerId,
			cardToken: cardToken
		}).success(function (data) {
			fn(data);
		});
	};

	this.addContactActivity = function (activity, fn) {
		var apiUrl = baseUrl + ['contact', 'activity'].join('/');
		$http({
			url: apiUrl,
			method: "POST",
			data: angular.toJson(activity)
		}).success(function (data) {
			fn(data);
		}).error(function (err) {
			console.log('END:userService with ERROR');
			fn(err);
		});
	};

}]);
