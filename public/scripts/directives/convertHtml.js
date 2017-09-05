/*global angular  */

angular.module('mainApp').directive('convertHtml', function ($sce) {

	'use strict';
	return {
		restrict: 'E',
		replace: true,
		template: "<div data-ng-bind-html='obj'> </div>",
		link: function (scope, element, attr) {
			scope.obj = $sce.trustAsHtml(attr.contents);
		}
	};
});
