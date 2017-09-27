/*global app*/
(function () {
	"use strict";
	app.directive('ssbNavigationComponentLoader', function () {
		return {
			restrict: 'E',
			scope: {
				link: "=",
				isSubLink: '=',
				currentpagehandle: '='
			},
			templateUrl: '/admin/assets/js/ssb-site-builder/ssb-components/shared/link_2.html',
			replace: true,
			controller: ['$scope', function ($scope) {
				$scope.toggleNavClass = function (ele) {
					var li = $(ele.target).parents("li");
					if (li) {
						if (!li.hasClass("nav-active")) {
							li.parents("section").addClass("overflow_visible");
							li.siblings().removeClass("nav-active");
							li.addClass("nav-active");
						} else {
							li.removeClass("nav-active");
							li.parents("section").remove("overflow_visible");
						}
					}
				};
			}]
		};
	});
}());
