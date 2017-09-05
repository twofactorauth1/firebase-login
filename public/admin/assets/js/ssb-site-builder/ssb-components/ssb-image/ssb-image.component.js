/*global app */
/*jslint unparam:true*/
(function () {
	'use strict';

	function ssbImageComponent() {
		return {
			// transclude: true,
			restrict: 'A',
			controller: 'SiteBuilderImageComponentController',
			controllerAs: 'vm',
			bindToController: true,
			scope: {
				ssbEditor: '=',
				componentClass: '&',
				component: '='
			},
			templateUrl: '/admin/assets/js/ssb-site-builder/ssb-components/ssb-image/ssb-image.component.html',
			replace: true,
			link: function (scope, element, attrs, ctrl) {
				ctrl.init(element);
			}
		};
	}
	app.directive('ssbImageComponent', ssbImageComponent);

}());
