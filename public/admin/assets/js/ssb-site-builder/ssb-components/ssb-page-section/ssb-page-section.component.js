/*global app*/
/*jslint unparam:true*/
(function () {
	'use strict';

	function ssbPageSection() {
		return {
			// transclude: true,
			restrict: 'E',
			controller: 'SiteBuilderPageSectionController',
			controllerAs: 'vm',
			bindToController: true,
			scope: {
				section: '=',
				index: '=',
				state: '=',
				uiState: '=',
				sectionLayoutName: '=?',
				sectionLayoutIndex: '=?'
			},
			templateUrl: function (element, attrs) {
				var url = '/admin/assets/js/ssb-site-builder/ssb-components/ssb-page-section/ssb-page-section.component.html';
				if (attrs.uiState) {
					url = '/admin/assets/js/ssb-site-builder/ssb-components/ssb-page-section/ssb-page-section.edit.html';
				}
				return url;
			},
			replace: true,
			link: function (scope, element, attrs, ctrl) {
				ctrl.init(element);
			}
		};
	}
	app.directive('ssbPageSection', ssbPageSection);

}());
