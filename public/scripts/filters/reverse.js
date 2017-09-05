/*global mainApp */
mainApp.filter('reverse', function () {
	'use strict';
	return function (items) {
		return Array.prototype.slice.call(items).reverse();
	};
});
