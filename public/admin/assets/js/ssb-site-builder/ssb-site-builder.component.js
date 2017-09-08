/*global app  */
/*jslint unparam:true*/
/* eslint-disable no-console */
(function () {
	"use strict";
	app.directive('ssbSiteBuilder', function () {

		return {
			restrict: 'E',
			scope: {},
			templateUrl: 'assets/js/ssb-site-builder/ssb-site-builder.component.html',
			controller: 'SiteBuilderController',
			controllerAs: 'vm',
			bindToController: true,
			link: function (scope, element, attrs, ctrl) {
				ctrl.init(element);
			}
		};

	});

}());
