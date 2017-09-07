/*global app*/
/*jslint unparam:true*/
/* eslint-disable no-console */
(function () {
	"use strict";
	app.directive('ssbRssFeedComponent', function () {
		return {
			// transclude: true,
			restrict: 'A',
			controller: 'SiteBuilderRssFeedComponentController',
			controllerAs: 'vm',
			bindToController: true,
			scope: {
				ssbEditor: '=',
				componentClass: '&',
				component: '='
			},
			templateUrl: '/admin/assets/js/ssb-site-builder/ssb-components/shared/ssb-component-wrap.html',
			replace: true,
			link: function (scope, element, attrs, ctrl) {
				ctrl.init(element);
			}
		};

	});

}());
