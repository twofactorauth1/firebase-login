/*global mainApp */
/*jslint unparam:true*/
mainApp.filter('cleanType', function () {
	'use strict';
	return function (type) {
		return String(type).replace('-', ' ').replace(/\w\S*/g, function (txt) {
			return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		});
	};
});
