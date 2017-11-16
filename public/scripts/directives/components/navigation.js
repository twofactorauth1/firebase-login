/*global app, angular, window, $ */
/*jslint unparam:true*/
app.directive('navigationComponent', ['websiteService', 'accountService', '$timeout', function (websiteService, accountService, $timeout) {
	'use strict';
	return {
		scope: {
			component: '='
		},
		templateUrl: '/components/component-wrap.html',
		controller: function ($scope, websiteService, accountService) {
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
			var args = {};
			$scope.$emit('getCurrentPage', args);
			$scope.currentpage = args.currentpage;
			// Special case for blogs
			if ($scope.currentpage && ($scope.currentpage.handle === 'blog-list' || $scope.currentpage.handle === 'blog-post')) {
				$scope.currentpage.handle = 'blog';
			}		
			
			$scope.checkIfReloadPage = function (link) {
				if (link && link.data) {
					if (link.data === 'blog') {
						return true;
					}
				}
				return false;
			};

		}
	};
}]);
