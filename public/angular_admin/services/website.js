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

		this.getPages = function (accountId, fn) {
			var apiUrl = baseUrl + ['cms', 'website', accountId, 'pages'].join('/');
			$http.get(apiUrl)
			.success(function (data, status, headers, config) {
				console.log('Pages: ', data);
				fn(data);
			})
			.error(function (err) {
                console.log('END:Website Service with ERROR');
                fn(err, null);
            });
		};

		//page/:id/components/all
		this.updateComponentOrder = function(pageId, componentId, newOrder, fn) {
			var apiUrl = baseUrl + ['cms', 'page', pageId, 'components', componentId, 'order', newOrder].join('/');
			$http({
			    url: apiUrl,
			    method: "POST"
			})
			.success(function (data, status, headers, config) {
				console.log('Component Order: ', data);
				fn(data);
			})
			.error(function (err) {
                console.log('END:Website Service with ERROR');
                fn(err, null);
            });
		};

		//page/:id/components/all
		this.updateAllComponents = function(pageId, componentId, componentJSON, fn) {
			var apiUrl = baseUrl + ['cms', 'page', pageId, 'components', 'all'].join('/');
			$http({
			    url: apiUrl,
			    method: "POST",
			    data: JSON.stringify(componentJSON)
			})
			.success(function (data, status, headers, config) {
				fn(data);
			})
			.error(function (err) {
                console.log('END:Website Service with ERROR');
                fn(err);
            });
		};

	});
});