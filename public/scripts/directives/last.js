/*global angular, $  */
angular.module('mainApp')
	.directive('lastItem', function ($timeout) {
		'use strict';
		return {
			restrict: 'A',
			link: function (scope, element) {
				scope.parent = $(element[0].parentElement || element[0].parentNode);
				scope.parent.css('visibility', 'hidden');
				if (scope.$last) {
					$timeout(function () {
						scope.parent.css('visibility', 'visible');
					}, 350);
				}
			}
		};
	});
