/*global mainApp */
mainApp.filter('offset', function () {
	'use strict';
	return function (input, start) {
		start = parseInt(start, 10);
		if (input) {
			return input.slice(start);
		}
	};
});
