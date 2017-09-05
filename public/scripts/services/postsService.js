/*
 * Getting Pages Data From Database
 *
 * */
/*global mainApp  */
/*jslint unparam:true*/
/* eslint-disable no-console */
mainApp.factory('postsService', ['accountService', '$http', function (accountService, $http) {

	'use strict';
	var that = this,
		//var accountObject = [],
		posts = {};
	//TODO Fetch Pages Data From DB
	return function (callback) {
		//todo get handle (page name)
		if (that.posts) {
			callback(null, that.posts);
		} else {
			accountService(function (err, data) {
				if (err) {
					callback(err, null);
				} else {
					//accountObject = data;
					//var handle = 'blog';
					//API is getting only one page but we need page arrays
					//var postsUrl = '/api/1.0/cms/blog';

					$http.get('/api/1.0/cms/blog', {
						cache: true
					}).success(function (post) {
						if (post !== null) {

							callback(null, post);
						} else {
							callback("post not found");
						}
					}).error(function (err) {
						callback(err);
					});

				}
			});
		}

	};
}]);
