/*global app*/
(function () {
	"use strict";
	app.directive('ssbImgSettings', function () {
		return {
			restrict: 'C',
			controller: 'SiteBuilderImageSettingsController',
			controllerAs: 'vm',
			bindToController: true,
			scope: true,
			link: function (scope, element, attrs, ctrl) {  
				ctrl.init(element,attrs.index,attrs.id);
			}
		};

	});

}());
