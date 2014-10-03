define(['app'], function (app) {
	app.register.service('UserService', function ($http) {
		var baseUrl = '/api/1.0/';
		this.getUser = function (fn) {
			var apiUrl = baseUrl + ['user', $$.server.userId].join('/');
			$http.get(apiUrl)
			.success(function (data, status, headers, config) {
				fn(data);
			});
		};

		this.putUser = function (user, fn) {
			var apiUrl = baseUrl + ['user', $$.server.userId].join('/');
			$http.put(apiUrl, user)
			.success(function (data, status, headers, config) {
				fn(data);
			});
		};

		this.getAccount = function (fn) {
			var apiUrl = baseUrl + ['account', $$.server.userId].join('/');
			$http.get(apiUrl)
			.success(function (data, status, headers, config) {
				fn(data);
			});
		};

		this.putAccount = function (user, fn) {
			var apiUrl = baseUrl + ['account', $$.server.userId].join('/');
			$http.put(apiUrl, user)
			.success(function (data, status, headers, config) {
				fn(data);
			});
		};
		
		this.postAccountBilling = function (stripeCustomerId, cardToken, fn) {
			var apiUrl = baseUrl + ['account', 'billing'].join('/');
			$http.post(apiUrl, {stripeCustomerId: stripeCustomerId, cardToken: cardToken})
			.success(function (data, status, headers, config) {
				fn(data);
			});
		};
		
		this.getAccountBilling = function (fn) {
			var apiUrl = baseUrl + ['account', 'billing'].join('/');
			$http.get(apiUrl)
			.success(function (data, status, headers, config) {
				fn(data);
			});
		};
	});
});
