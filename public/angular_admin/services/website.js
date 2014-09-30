define(['app'], function (app) {
	app.register.service('WebsiteService', function ($http) {
		var baseUrl = '/api/1.0/';

		this.getWebsite = function (websiteID, fn) {
			var apiUrl = baseUrl + ['cms', 'website', websiteID || $$.server.websiteId].join('/');
			console.log('Getting Website '+apiUrl);
			$http.get(apiUrl)
			.success(function (data, status, headers, config) {
				fn(data);
			});
		};

		//website
		this.updateWebsite = function(data, fn) {
			var apiUrl = baseUrl + ['cms', 'website'].join('/');
			$http.get({
			    url: apiUrl,
			    method: "POST",
			    data: angular.toJson(data)
			})
			.success(function (data, status, headers, config) {
				fn(data);
			})
			.error(function (err) {
                console.log('END:Website Service with ERROR');
                fn(err, null);
            });
		};

		this.getPages = function (accountId, fn) {
			var apiUrl = baseUrl + ['cms', 'website', accountId, 'pages'].join('/');
			$http.get(apiUrl)
			.success(function (data, status, headers, config) {
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
		this.updateAllComponents = function(pageId, componentJSON, fn) {
			var apiUrl = baseUrl + ['cms', 'page', pageId, 'components', 'all'].join('/');
			$http({
			    url: apiUrl,
			    method: "POST",
			    //angular.toJson() used instead of JSON.stringify to remove $$hashkey value
			    data: angular.toJson(componentJSON)
			})
			.success(function (data, status, headers, config) {
				fn(data);
			})
			.error(function (err) {
                console.log('END:updateAllComponents with ERROR', err);
                fn(err);
            });
		};

		//page/:id/components/:componentId
		this.updateComponent = function(pageId, componentId, componentJSON, fn) {
			var apiUrl = baseUrl + ['cms', 'page', pageId, 'components', componentId].join('/');
			$http({
			    url: apiUrl,
			    method: "POST",
			    //angular.toJson() used instead of JSON.stringify to remove $$hashkey value
			    data: angular.toJson(componentJSON)
			})
			.success(function (data, status, headers, config) {
				fn(data);
			})
			.error(function (err) {
                console.log('END:Website Service with ERROR');
                fn(err);
            });
		};

		//page/:id/components
		this.addNewComponent = function(pageId, title, type, fn) {
			var apiUrl = baseUrl + ['cms', 'page', pageId, 'components'].join('/');
			var data = {
				title : title,
				type : type
			};
			$http({
			    url: apiUrl,
			    method: "POST",
			    data: angular.toJson(data)
			})
			.success(function (data, status, headers, config) {
				console.log('Added New Component: ', data);
				fn(data);
			})
			.error(function (err) {
                console.log('END:Website Service with ERROR');
            });
		};

		//page/:id/components/:componentId
		this.deleteComponent = function(pageId, componentId, fn) {
			console.log('PageID: '+pageId+' ComponentID: '+componentId);
			var apiUrl = baseUrl + ['cms', 'page', pageId, 'components', componentId].join('/');
			$http({
			    url: apiUrl,
			    method: "DELETE"
			})
			.success(function (data, status, headers, config) {
				console.log('Component Successfully Deleted from the DB.');
				fn(data);
			})
			.error(function (err) {
                console.log('END:Website Service with ERROR');
            });
		};

		//website/:websiteId/page
		this.createPage = function(websiteId, data, fn) {
			var apiUrl = baseUrl + ['cms', 'website', websiteId, 'page'].join('/');
			$http({
			    url: apiUrl,
			    method: "POST",
			    data: angular.toJson(data)
			})
			.success(function (data, status, headers, config) {
				fn(data);
			})
			.error(function (err) {
                console.log('END:Create Page with ERROR');
            });
		};

		//website/:websiteId/page/:id/:label
		this.deletePage = function(pageId, websiteId, label, fn) {
			var apiUrl = baseUrl + ['cms', 'website', websiteId, 'page', pageId, label].join('/');
			$http.delete(apiUrl)
			.success(function (data, status, headers, config) {

				console.log('page deleted');
				fn(data);
			})
			.error(function (err) {
                console.log('END:Delete Page with ERROR', err);
            });
		};


	});
});