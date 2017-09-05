/*global mainApp ,console , window */
/*jslint unparam:true*/
/* eslint-disable no-console */
mainApp.factory('previewPagesService', ['$http', '$location', function ($http, $location) {
	'use strict';
	var apiURL = '/api/2.0/cms/';

	function setPostData(pageId, postId) {
		if (window.indigenous && window.indigenous.precache) {
			$http.get('/api/1.0/cms/page/' + pageId + '/blog/preview/' + postId, {
				cache: false
			}).success(function (post) {
				window.indigenous.precache.siteData.post = post;
			}).error(function (err) {
				console.error('previewPagesService setPostData error: ', JSON.stringify(err));
			});
		}
	}

	function setPostsData(page, cb) {
		if (window.indigenous && window.indigenous.precache) {
			$http.get('api/1.0/cms/blog', {
				cache: true
			}).success(function (posts) {
				window.indigenous.precache.siteData.posts = posts;
				cb(null, page);
			}).error(function (err) {
				console.error('previewPagesService setPostsData error: ', JSON.stringify(err));
				cb(err, page);
			});
		}
	}

	return function (websiteId, callback) {
		var path = $location.$$path.toLowerCase().replace('/preview/', ''),
			pageId = path,
			postId;

		if (path.indexOf('/') === 0) {
			pageId = path.replace('/', '');
		} else if (path.indexOf('/') !== -1) {
			pageId = path.split('/')[0];
			postId = path.split('/')[1];
			setPostData(pageId, postId);
		}

		// /api/2.0/cms/pages/4c4b8f81-0241-4312-a75d-b26bcf42194b
		return $http.get(apiURL + 'pages/' + pageId, {
			cache: true
		}).success(function (page) {
			var componentTypes = _.pluck(_.flatten(_.pluck(page.sections, "components")), "type"),
				_blogComponents = _.contains(componentTypes, "ssb-blog-post-list") || _.contains(componentTypes, "ssb-recent-post") ||
				_.contains(componentTypes, "ssb-recent-tag") || _.contains(componentTypes, "ssb-recent-category");


			if (page.handle === 'blog-list' || page.handle === 'blog-post' || _blogComponents) {
				setPostsData(page, function (err, page) {
					callback(err, page);
				});
			} else {
				callback(null, page);
			}
		}).error(function (err) {
			callback(err);
		});
	};
}]);
