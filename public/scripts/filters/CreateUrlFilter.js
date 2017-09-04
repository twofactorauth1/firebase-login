/*global mainApp */
/*jslint unparam:true*/
mainApp.filter('createUrlFilter', [function () {
	'use strict';
	return function (obj) {
		if (obj) {
			obj.forEach(function (cp) {
				cp.url = '/components/' + cp.type + '_v' + cp.version + '.html';
			});
		}
		return obj;
	};
}]);
