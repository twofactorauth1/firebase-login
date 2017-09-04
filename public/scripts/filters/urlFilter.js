/*global mainApp */
mainApp.filter('urlFilter', function () {
	'use strict';
	return function (url) {
		if (url) {
			return url.replace(/ /g, '').replace(/\./g, '_').replace(/@/g, '').replace(/_/g, ' ').replace(/\W+/g, '').toLowerCase();
		}
	};
});
