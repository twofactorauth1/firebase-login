/*global app  */
app.directive('stopEvent', function () {
	'use strict';
	return {
		restrict: 'A',
		link: function (scope, element, attr) {
			element.on(attr.stopEvent, function (e) {
				e.stopPropagation();
			});
		}
	};
});
