/*global app*/
/*jslint unparam:true*/
/* eslint-disable no-console */
(function () {
	"use strict";
	app.directive('ssbRecentTagComponent', function () {

		return {
			restrict: 'A',
			controller: 'SiteBuilderBolgRecentTagComponentController',
			controllerAs: 'vm',
			bindToController: true,
			scope: {
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
