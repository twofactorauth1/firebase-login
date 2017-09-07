/*global app */
/*jslint unparam:true*/
/* eslint-disable no-console */
(function () {
	"use strict";
	app.directive('ssbImageGalleryComponent', function () {
		return {
			// transclude: true,
			restrict: 'A',
			controller: 'SiteBuilderImageGalleryComponentController',
			controllerAs: 'vm',
			bindToController: true,
			scope: {
				ssbEditor: '=',
				componentClass: '&',
				component: '='
			},
			templateUrl: '/admin/assets/js/ssb-site-builder/ssb-components/ssb-image-gallery/ssb-image-gallery.component.html',
			replace: true,
			link: function (scope, element, attrs, ctrl) {
				ctrl.init(element);
			}
		};

	});

}());
