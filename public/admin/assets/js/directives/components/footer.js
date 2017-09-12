/*global app*/
/*jslint unparam:true*/
app.directive('footerComponent', ['$window', 'WebsiteService', '$location', function ($window, WebsiteService, $location) {
	'use strict';
	return {
		scope: {
			component: '=',
			ssbEditor: '='
		},
		templateUrl: '/components/component-wrap.html',
		link: function (scope, element) {
			scope.orgId = $window.indigenous.orgId;
			scope.isEditing = true;
			var accountHost = $location.$$host,
				defaultAccountUrl = "//www.indigenous.io";
			if (scope.orgId == 1) {
				defaultAccountUrl = "//www.gorvlvr.com";
			} else if (scope.orgId == 4) {
				defaultAccountUrl = "//techevent.us";
			}
			scope.footerLinkUrl = defaultAccountUrl + "?utm_source=" + accountHost + "&utm_medium=footer_link";
			if (!scope.ssbEditor) {
				scope.component.spacing = scope.$parent.defaultSpacings;
			}
			scope.copyright = {
				year: new Date().getFullYear()
			};
			scope.copyrightYear = new Date().getFullYear();
			WebsiteService.getWebsite(function (website) {
				scope.website = website;
			});
			// Check for legacy pages
			if (!element.parents(".ssb-section-layout").length) {
				element.addClass("legacy-footer");
			}
		}
	};
}]);
