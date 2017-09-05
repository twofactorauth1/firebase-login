/*global app,angular  */
(function () {
	'use strict';
	/* @ngInject */
	function ssbCheckFixed($timeout) {
		return {
			restrict: 'C',
			link: function (scope, elem) {

				$timeout(function () {
					scope.$watch(
						function () {
							return elem.height();
						},
						function (newValue, oldValue) {
							if (newValue !== oldValue) {
								if (elem.hasClass("ssb-fixed")) {
									var elemId = elem.attr("id").replace("section_", ""),
										clonedElem = angular.element("#clone_of_" + elemId);
									if (clonedElem.length && clonedElem.hasClass("ssb-fixed-clone-element")) {
										clonedElem.height(newValue);
									}
								}
							}
						}
					);
				}, 200);

			}
		};

	}
	app.directive('ssbCheckFixed', ssbCheckFixed);

	ssbCheckFixed.$inject = ['$timeout'];

}());
