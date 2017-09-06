/*global app*/
/* eslint-disable no-console*/
(function () {
    "use strict";
	app.directive('ssbFormBuilderComponent', function () {
		return {
			// transclude: true,
			restrict: 'A',
			controller: 'SiteBuilderFormBuilderComponentController',
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
