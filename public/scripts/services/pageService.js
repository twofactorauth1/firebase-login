/*
 * Verifying Account According to Subdomain
 * */

/*global mainApp, angular, console*/
/*jslint unparam:true*/
/* eslint-disable no-console */
mainApp.service('pageService', ['$http', function ($http) {
	'use strict';
	var baseUrl = '/api/1.0/';

	this.createPage = function (websiteId, pagedata, fn) {
		var apiUrl = baseUrl + ['cms', 'website', websiteId, 'page'].join('/');
		$http({
			url: apiUrl,
			method: "POST",
			data: angular.toJson(pagedata)
		}).success(function (data) {
			console.log('data >>> ', data);
			console.log('data >>> ', data);
			fn(data);
		}).error(function () {
			console.log('END:Create Page with ERROR');
		});
	};

	this.addNewComponent = function (pageId, title, type, cmpVersion, fn) {
		var apiUrl = baseUrl + ['cms', 'page', pageId, 'components'].join('/'),
			data = {
				title: title,
				type: type,
				cmpVersion: cmpVersion
			};
		$http({
			url: apiUrl,
			method: "POST",
			data: angular.toJson(data)
		}).success(function (data) {
			console.log('Added New Component: ', data);
			fn(data);
		}).error(function () {
			console.log('END:Page Service with ERROR');
		});
	};

}]);
