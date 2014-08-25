define(['app'], function (app) {
	app.service('ApiService', function ($http) {
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
	});
});