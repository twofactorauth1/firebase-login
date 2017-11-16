/*
 * Get site data from <script> and return to angular app
 *
 * Data format:
 *
 * {
 *      ...
 *      pages: {
 *          'page-handle' : {}
 *          ...
 *      }
 *      ...
 * }
 *
 */

/*global mainApp, window*/
mainApp.factory('embeddedSiteDataService', ['$http', '$location', '$cacheFactory', function ($http, $location) {
	'use strict';
	var service = {};

	service.urlPathFallbacks = urlPathFallbacks;
	service.getSiteData = getSiteData;
	service.getPageData = getPageData;
	service.getPostData = getPostData;


	/*
	 * Set equivalent paths and fallbacks
	 *
	 */
	function urlPathFallbacks() {
		var path = $location.$$path.toLowerCase().replace('/page/', '');

		if (path === "/" || path === "") {
			path = "index";
		}

		if (path === "/signup") {
			path = "signup";
		}

		if (path === '/trial') {
			path = "trial";
		}

		if (path.indexOf("blog/") > -1) {
			if (window.indigenous.ssbBlog === true) {
				path = 'blog-post';
			} else {
				path = 'single-post';
			}

		}

		if (path.indexOf("post/") > -1) {
			path = 'single-post';
		}

		if (path === 'blog' || path === '/blog' || path === 'blog-list' || path === '/blog-list' || path.indexOf("tag/") > -1 || path.indexOf("category/") > -1 || path.indexOf("author/") > -1) {
			if (window.indigenous.ssbBlog === true) {
				path = 'blog-list';
			} else {
				path = 'blog';
			}

		}

		if (path.indexOf('/') === 0) {
			path = path.replace('/', '');
		}

		return path.trim();
	}


	/*
	 * Get data set from server on global window object
	 *
	 */
	function getSiteData() {

		if (window.indigenous && window.indigenous.precache && window.indigenous.precache.siteData) {

			service.siteData = window.indigenous.precache.siteData;

		}
	}


	/*
	 * Get page data from siteData
	 * - Keeps legacy interface from cacheCtrl usage
	 *
	 */
	function getPageData(websiteId, callback) {
		service.path = urlPathFallbacks();
		if(service.siteData.page && service.siteData.page.handle === service.path){
			callback(null, service.siteData.page);
		}
		else{
			$http.get('/'+service.path+'?requestpage=true&cachebuster'+new Date().getTime())
			.then(function(res){
			    if(service.siteData.page && service.siteData.page.handle === service.path){
					callback(null, service.siteData.page);
				}
				else{
					callback("page not found", null);
				}
			})
		}
	}

	function getPostData(callback) {
		if (typeof service.siteData.posts !== 'undefined') {
			callback(null, service.siteData.posts);
		} else {
			callback('posts not found');
		}
	}


	(function init() {
		service.getSiteData();
	}());

	return service;

}]);
