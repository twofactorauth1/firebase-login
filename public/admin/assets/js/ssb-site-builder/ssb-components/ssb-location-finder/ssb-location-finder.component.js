/*global app*/
/*jslint unparam:true*/
/* eslint-disable no-console */
(function () {
	"use strict";

	app.directive('ssbLocationFinderComponent', function () {
		return {
			restrict: 'A',
			controller: 'SiteBuilderLocationFinderComponentController',
			controllerAs: 'vm',
			bindToController: true,
			scope: {
				ssbEditor: '=',
				componentClass: '&',
				component: '='
			},
			templateUrl: '/admin/assets/js/ssb-site-builder/ssb-components/ssb-location-finder/ssb-location-finder.component.html',
			replace: true,
			link: function (scope, element, attrs, ctrl) {
				ctrl.init(element);
			}
		};

	});

}());
