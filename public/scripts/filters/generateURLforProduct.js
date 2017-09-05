/*global angular */
var mainApp = angular.module("mainApp");

mainApp.filter('generateURLforProducts', function () {
	'use strict';
	return function (product, location) {
		var purl = "";
		if (product) {
			purl = location.search('productId', product._id).$$absUrl;
		}
		return purl;
	};
});
