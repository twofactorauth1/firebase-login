/*global mainApp */
mainApp.filter('getByProperty', function () {
	'use strict';
	return function (propertyName, propertyValue, collection) {
		var i,
			len = collection.length;
		for (i = 0; i < len; i++) {
			if (collection[i][propertyName] === propertyValue) {
				return collection[i];
			}
		}
		return null;
	};
});
