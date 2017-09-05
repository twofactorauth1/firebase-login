/*global  angular,$ ,Skeuocard  */
angular.module('mainApp.directives', [])
	.directive('indigewebSkeuocard', function () {
		'use strict';
		return {
			require: [],
			restrict: 'C',
			transclude: false,
			templateUrl: '../../views/partials/_skeuocard.html',
			link: function (scope) {
				scope.card = new Skeuocard($("#skeuocard"));
			}
		};
	});
