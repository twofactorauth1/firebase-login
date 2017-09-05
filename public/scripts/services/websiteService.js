/*
 * Getting Website Data According to Website ID
 *
 * */

/*global mainApp ,console  */
/*jslint unparam:true*/
/* eslint-disable no-console */
mainApp.factory('websiteService', ['accountService', '$http', function (accountService, $http) {

	'use strict';
	var website = {};

	return function (callback) {
		if (Object.getOwnPropertyNames(website).length !== 0) {
			//console.log('Historical');
			callback(null, website);
		} else {
			accountService(function (err, data) {
				if (err || !data) {
					console.log('Method:accountService Error: ' + err);
					callback(err, null);
				} else if (!data) {
					callback("data is null", null);
				} else {
					//console.log('Not Historical ', data);
					// API URL: http://yoursubdomain.indigenous.local/api/1.0/cms/website/yourid
					$http.get('/api/1.0/cms/website/' + data.website.websiteId, {
						cache: true
					}).success(function (data) {
						if (data) {
							website = data;
						}
						callback(null, data);
					}).error(function (err) {
						console.log('END:Website Service with ERROR');
						callback(err, null);
					});
				}

			});
		}
	};
}]);
