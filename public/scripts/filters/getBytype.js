/*global mainApp */
mainApp.filter('getByType', function () {
	'use strict';
	return function (input, type) {
		var i,
			len = input.length,
			arr = [];
		for (i = 0; i < len; i = i + 1) {
			if (input[i].type === type) {
				arr.push(input[i]);
			}
		}
		return arr;
	};
});
