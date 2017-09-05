/*
 * Getting Pages Data From Database
 *
 * */
/*global mainApp  ,console*/
/* eslint-disable no-console */
mainApp.service('campaignService', function ($http) {
	'use strict';
	var baseUrl = '/api/1.0/';

	//campaign/:id/contact/:contactid
	this.addContactToCampaign = function (campaignId, contactId, fn) {
		//TODO this is frontend code that WILL fail.
		var apiUrl = baseUrl + ['campaigns', campaignId, 'contact', contactId].join('/');
		$http({
			url: apiUrl,
			method: "POST"
		}).success(function (data) {
			fn(data);
		}).error(function (err) {
			console.log('END:addContactToCampaign with ERROR ', err);
		});
	};

	this.getCampaign = function (campaignId, fn) {
		//TODO this is frontend code that WILL fail.
		var apiUrl = baseUrl + ['campaigns', campaignId].join('/');
		$http({
			url: apiUrl,
			method: "GET"
		}).success(function (data) {
			fn(data);
		}).error(function (err) {
			console.log('END:getCampaign with ERROR ', err);
		});
	};
});
