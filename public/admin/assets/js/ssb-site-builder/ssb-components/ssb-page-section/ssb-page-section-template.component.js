/*global app*/
/*jslint unparam:true*/
(function () {
	'use strict';

	function ssbPageSectionTemplate() {
		return {
			restrict: 'E',
			controller: 'SiteBuilderPageSectionTemplateController',
			controllerAs: 'vm',
			bindToController: true,
			scope: {
				section: '=',
				index: '=',
				preSectionClass: '=',
				preSectionStyle: '=',
				sectionBGClass: '=sectionBgClass',
				sectionBGStyle: '=sectionBgStyle',
				displaySection: '=showSection'
			},
			templateUrl: function (element, attrs) {
				return '/admin/assets/js/ssb-site-builder/ssb-components/ssb-page-section/ssb-page-section-template.component.html';				
			},
			replace: true,
			link: function (scope, element, attrs, ctrl) {
				ctrl.init(element);
			}
		};
	}
	app.directive('ssbPageSectionTemplate', ssbPageSectionTemplate);

}());
