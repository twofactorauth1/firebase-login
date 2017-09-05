/*global app, angular, window */
/*jslint unparam:true*/
app.directive('singlePostComponent', ['$window', '$location', 'accountService', 'postService', 'ENV', function ($window, $location, AccountService, PostService, ENV) {
	'use strict';
	return {
		scope: {
			component: '='
		},
		templateUrl: '/components/component-wrap.html',
		link: function (scope) {
			scope.component.spacing = scope.$parent.defaultSpacings;
			scope.facebookClientID = ENV.facebookClientID;
			scope.blogPageUrl = $location.$$absUrl;
			var _handle = $location.$$path.replace('/page', '').replace('/blog/', '');
			scope.blog = {};
			// If single-post page
			if (scope.$parent.blog_post && $location.$$path.indexOf("/blog/") === -1) {
				scope.blog.post = scope.$parent.blog_post;
			} else {
				AccountService(function (err, data) {
					if (err) {
						console.log('Controller:MainCtrl -> Method:accountService Error: ' + err);
					}
					PostService.getSinglePost(_handle, data.website.websiteId, function (post) {
						console.log('post data ', post);
						scope.blog.post = post;
						$window.document.title = post.post_title.replace(/<\/?[^>]+(>|$)/g, "");
					});
				});
			}
			scope.$back = function () {
				window.history.back();
			};
			scope.getEncodedUrl = function (url) {
				return encodeURI(url);
			};

			scope.getImageUrl = function (src) {
				if (src && !/http[s]?/.test(src)) {
					src = 'http:' + src;
				}
				if (angular.isDefined(src) && PostService.isValidImage(src)) {
					return encodeURI(src);
				} else {
					return "";
				}
			};


			scope.getPlainTitle = function (title) {
				var returnValue = title,
					element;
				if (title) {
					element = angular.element(".plain-post-title");
					if (element && element.length) {
						returnValue = element.text().trim();
					}
				}
				return returnValue;
			};
		}
	};
}]);
