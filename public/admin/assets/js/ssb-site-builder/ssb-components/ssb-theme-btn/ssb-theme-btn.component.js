/*global app,  */
/*jslint unparam:true*/
/* eslint-disable no-console */
(function () {
	"use strict";

	app.directive('ssbThemeBtn', function () {
		return {
			// transclude: true,
			// require: '^ssbComponentLoader',
			restrict: 'C',
			controller: 'SiteBuilderThemeBtnController',
			controllerAs: 'vm',
			bindToController: true,
			scope: true,
			link: function (scope, element, attrs, ctrl) {
				ctrl.init(element);
			}
		};

	});

}());
