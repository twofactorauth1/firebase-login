/*global angular */
/*jslint unparam:true*/
var mainApp = angular.module("mainApp");

mainApp.filter('generateURLforLinks', function () {
	'use strict';
	return function (linkToObject) {
		if (linkToObject) {
			switch (linkToObject.type) {
				case "page":
					return '/' + linkToObject.data;
				case "home":
					return "/";
				case "url":
					return linkToObject.data;
				case "section":
					if (linkToObject.page && linkToObject.page !== "index") {
						return '/' + linkToObject.page + '#' + linkToObject.data;
					}
					return '/#' + linkToObject.data;

				case "product":
					return ""; //Not yet implemented
				case "collection":
					return ""; //Not yet implemented
				case "external":
					var value = linkToObject.data;
					if (value && !/http[s]?/.test(value) && !/tel/.test(value)) {
						value = 'http://' + value;
					}
					return value;
				default:
					return "#";
			}
		}
	};

});
