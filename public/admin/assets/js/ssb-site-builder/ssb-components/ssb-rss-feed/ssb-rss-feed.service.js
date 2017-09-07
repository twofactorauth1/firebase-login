/*global app,  console */
/*jslint unparam:true*/
/* eslint-disable no-console */
(function () {
	"use strict";
	app.factory('RssFeedService', RssFeedService);
	RssFeedService.$inject = ['$http'];
	/* @ngInject */
	var baseCmsAPIUrlv2 = '/api/2.0/cms/feed/rss';
	function RssFeedService($http) {
		var SsbFeedService = {};
		SsbFeedService.parseFeed = parseFeed;
		function parseFeed(feedUrl) {
			var apiUrl = [baseCmsAPIUrlv2].join('/');
			return (ssbRequest($http({
				url: apiUrl,
				method: 'POST',
				data: {
					feedUrl: feedUrl
				}
			}).success(function () {

			}).error(function () {

			})));
			//return $http.jsonp('//ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=50&callback=JSON_CALLBACK&q=' + encodeURIComponent(url));
		}
		function ssbRequest(fn) {
			fn.finally(function () {
				console.log("function ");
			});
			return fn;
		}
		(function init() {

		}());
		return SsbFeedService;
	}
}());
