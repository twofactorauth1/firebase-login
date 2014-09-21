define(['app'], function (app) {
	app.register.service('WebsiteService', function ($http) {
		var baseUrl = '/api/1.0/';
		this.getWebsite = function (fn) {
			var apiUrl = baseUrl + ['cms/website/', $$.server.websiteId].join('/');
			console.log('Getting Website '+apiUrl);
			$http.get(apiUrl)
			.success(function (data, status, headers, config) {
				fn(data);
			});
		};

		this.getPage = function (fn) {
			var apiUrl = baseUrl + ['account', $$.server.userId].join('/');
			$http.get(apiUrl)
			.success(function (data, status, headers, config) {
				fn(data);
			});
		};
	});
});
