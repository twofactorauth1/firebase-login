/*global app*/
(function () {
	"use strict";
	app.directive('ssbNavigationComponentCssLoader', function () {
		return {
			restrict: 'E',
			scope: {
				component: "="
			},
			templateUrl: '/admin/assets/js/ssb-site-builder/ssb-components/shared/navigation_style.html',
			replace: true,
			controller: ['$scope', function ($scope) {
				$scope.defalultHover="#939597";
			}] 
		};
	});
}());
