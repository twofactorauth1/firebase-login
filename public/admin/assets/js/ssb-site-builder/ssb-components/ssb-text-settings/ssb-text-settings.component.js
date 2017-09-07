/*global app*/
(function () {
	"use strict";
	app.directive('ssbTextSettings', function () {
		return {
			restrict: 'C',
			controller: 'SiteBuilderTextSettingsController',
			controllerAs: 'vm',
			bindToController: true,
			scope: true,
			link: function (scope, element, attrs, ctrl) {
				ctrl.init(element);
			}
		};

	});

}());
