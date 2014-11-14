define(['app', 'toasterService'], function (app) {
	app.register.service('UserService', ['$http', 'ToasterService', function ($http, ToasterService) {
		var account, that = this;
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
			if (that.account) {
				console.log('cached account');
	            fn(that.account);
	        } else {
				var apiUrl = baseUrl + ['account', $$.server.accountId].join('/');
				$http.get(apiUrl)
				.success(function (data, status, headers, config) {
					that.account = data;
					fn(data);
				});
			}
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

		this.postUserSubscribe = function (fn) {
			var apiUrl = baseUrl + ['account', 'billing'].join('/');
			$http.get(apiUrl)
			.success(function (data, status, headers, config) {
				fn(data);
			});
		};

		this.getUserSubscriptions = function (stripeCustomerId, fn) {
			var apiUrl = baseUrl + ['customers', stripeCustomerId, 'subscriptions'].join('/');
			$http.get(apiUrl)
			.success(function (data, status, headers, config) {
				fn(data);
			});
		};

		this.postUserSubscriptions = function (stripeCustomerId, planId, fn) {
			var apiUrl = baseUrl + ['integrations', 'payments', 'customers', stripeCustomerId, 'subscriptions'].join('/');
			$http.post(apiUrl, {plan: planId})
			.success(function (data, status, headers, config) {
				fn(data);
			});
		};

		this.postUserDashboard = function (dashboard, fn) {
			var apiUrl = baseUrl + ['dashboard'].join('/');
			$http.post(apiUrl, {config: dashboard})
			.success(function (data, status, headers, config) {
				fn(data);
			});
		};

		this.getUserDashboard = function (fn) {
			var apiUrl = baseUrl + ['dashboard'].join('/');
			$http.get(apiUrl)
			.success(function (data, status, headers, config) {
				fn(data);
			});
		};

		this.postUserDashboardUpdate = function (id, dashboard, fn) {
			var apiUrl = baseUrl + ['dashboard', id].join('/');
			$http.post(apiUrl, {config: dashboard})
			.success(function (data, status, headers, config) {
				fn(data);
			});
		};

		this.checkDuplicateSubdomain = function (subDomain, accountId , fn) {
			var apiUrl = baseUrl + ['account',  subDomain, accountId, 'duplicate'].join('/');
			$http.get(apiUrl)
			.success(function (data, status, headers, config) {
				fn(data);
			});
		};

		this.getUserPreferences = function (fn) {
			var apiUrl = baseUrl + ['user', 'preferences'].join('/');
			$http.get(apiUrl)
			.success(function (data, status, headers, config) {
				fn(data);
			});
		};

		this.updateUserPreferences = function (preferences, showToaster, fn) {
			var apiUrl = baseUrl + ['user', 'preferences'].join('/');
			$http.post(apiUrl, preferences)
			.success(function (data, status, headers, config) {
				if (showToaster) {
					ToasterService.show('success', 'Preferences Updated.');
				}
				fn(data);
			});
		};

	}]);
});
