
/*global app, angular, window, $ */
/*jslint unparam:true*/
app.directive('navigationComponent', ['websiteService', 'accountService', '$timeout', function (websiteService, accountService, $timeout) {
	'use strict';
	return {
		scope: {
			component: '='
		},
		templateUrl: '/components/component-wrap.html',
		controller: function ($scope, websiteService, accountService, SsbPageSectionService) {
			$scope.navbarId = _.random(0, 1000);
			$scope.website = {};
			if (window.indigenous && window.indigenous.precache && window.indigenous.precache.siteData && window.indigenous.precache.siteData.linkList) {
				$scope.website.linkLists = window.indigenous.precache.siteData.linkList;
				$timeout(function () {
					$(window).trigger('resize');
				}, 0);
			}

			if (!angular.isDefined($scope.component.shownavbox)) {
				$scope.component.shownavbox = true;
			}
			if (!$scope.website.linkLists) {
				websiteService(function (err, website) {
					$scope.website = website;
					$timeout(function () {
						$(window).trigger('resize');
					}, 0);
				});
			}

			accountService(function (err, account) {
				$scope.account = account;
			});
			var args = {}, pageList = {};
			$scope.$emit('getCurrentPage', args);
			$scope.currentpage = args.currentpage;
			// Special case for blogs
			if ($scope.currentpage && ($scope.currentpage.handle === 'blog-list' || $scope.currentpage.handle === 'blog-post')) {
				$scope.currentpage.handle = 'blog';
			}
			$scope.toggleNavClass = function (ele) {
				var li = $(ele.target).parents("li");
				if (li) {
					if (!li.hasClass("nav-active")) {
						li.parents("section").addClass("overflow_visible");
						li.siblings().removeClass("nav-active");
						li.addClass("nav-active");
					} else {
						li.removeClass("nav-active");
						li.parents("section").removeClass("overflow_visible");
					}
				}
			};
			$scope.$watch(function () {
				return SsbPageSectionService.offset;
			}, function (offset) {
				$scope.scrollOffsetTop = offset;
			}, true);


			if (window.indigenous && window.indigenous.precache && window.indigenous.precache.siteData && window.indigenous.precache.siteData.pages) {
				pageList = window.indigenous.precache.siteData.pages;
			}

			$scope.checkIfReloadPage = function (link) {
				if (link && link.data) {
					if (link.data === 'blog') {
						return true;
					} else {
						if (pageList && pageList[link.data]) {
							if (pageList[link.data].isBlogCopy) {
								return true;
							}
						}
					}
				}
				return false;
			};

		}
	};
}]);
