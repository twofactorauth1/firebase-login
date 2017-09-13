/*
 * Getting Pages Data From Database
 *
 * */
/*global mainApp ,console  */
/*jslint unparam:true*/
/* eslint-disable no-console */
mainApp.service('productService', function ($http) {

	'use strict';
	var baseUrl = '/api/1.0/products';

	this.getProduct = function (productId, fn) {
		var apiUrl = [baseUrl, productId].join('/');
		$http.get(apiUrl)
			.success(function (data) {
				fn(data);
			});
	};

	this.getAllProducts = function (fn) {
		var apiUrl = baseUrl;
		$http.get(apiUrl, {
			cache: true
		}).success(function (data) {
			fn(data);
		});
	};

	this.getActiveProducts = function (relaod, fn) {
		var apiUrl = [baseUrl, 'active'].join('/');
		var cache = relaod ? false : true;
		console.log(apiUrl);
		$http.get(apiUrl, {
			cache: cache
		}).success(function (data) {
			fn(data);
		});
	};

	this.getTax = function (postcode, fn) {
		var apiUrl = [baseUrl, 'tax', postcode].join('/');
		$http.get(apiUrl)
			.success(function (data) {
				fn(data);
			});
	};

	this.getAllOrdersForProduct = function (id, fn) {
		var apiUrl = [baseUrl, id, 'orders'].join('/');
		$http.get(apiUrl)
			.success(function (data) {
				fn(data);
			});
	};

	this.getDonationOrdersForProduct = function (id, fn) {
		var apiUrl = [baseUrl, id, 'donation/orders'].join('/');
		$http.get(apiUrl)
			.success(function (data) {
				fn(data);
			});
	};

});
