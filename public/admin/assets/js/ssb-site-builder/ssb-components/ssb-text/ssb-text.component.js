/*global app   */
/*jslint unparam:true*/
/* eslint-disable no-console */
(function () {
	"use strict";
	app.directive('ssbTextComponent', function () {
		return {
			// transclude: true,
			restrict: 'A',
			controller: 'SiteBuilderTextComponentController',
			controllerAs: 'vm',
			bindToController: true,
			scope: {
				ssbEditor: '=',
				componentClass: '&',
				component: '='
			},
			templateUrl: '/admin/assets/js/ssb-site-builder/ssb-components/ssb-text/ssb-text.component.html',
			replace: true,
			link: function (scope, element, attrs, ctrl) {
				ctrl.init(element);
			}
		};

	});

}());
