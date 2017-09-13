/*global mainApp, angular, console*/
/*jslint unparam:true*/
/* eslint-disable no-console */
mainApp.service('orderService', function ($http) {

	'use strict';
	var baseUrl = '/api/1.0/';
	this.createOrder = function (order, fn) {
		var apiUrl = baseUrl + ['orders'].join('/');
		$http({
			url: apiUrl,
			method: "POST",
			data: angular.toJson(order)
		}).success(function (data) {
			fn(data);
		}).error(function (err) {
			console.log('END:Create Order with ERROR');
			fn(err);
		});
	};

	this.createPaypalOrder = function (order, fn) {
		var apiUrl = baseUrl + ['orders', 'payment', 'paypal'].join('/');
		$http({
			url: apiUrl,
			method: "POST",
			data: angular.toJson(order)
		}).success(function (data) {
			fn(data);
		}).error(function (err) {
			console.log('END:Create Paypal Order with ERROR');
			fn(err);
		});
	};

	this.getOrder = function (orderId, fn) {
		var apiUrl = baseUrl + ['orders', orderId].join('/');
		$http({
			url: apiUrl,
			method: "GET"
		}).success(function (data) {
			fn(data);
		}).error(function (err) {
			console.log('END:Got Order with ERROR');
			fn(err);
		});
	};

	this.setOrderPaid = function (order, fn) {
		var apiUrl = baseUrl + ['orders', order._id, 'paid'].join('/');
		$http({
			url: apiUrl,
			method: "POST",
			data: angular.toJson(order)
		}).success(function (data) {
			fn(data);
		}).error(function (err) {
			console.log('END:Create Paypal Order with ERROR');
			fn(err);
		});
	};

	this.deletePaypalOrder = function (order, fn) {
		var apiUrl = baseUrl + ['orders', order._id, 'paypal'].join('/');
		apiUrl = apiUrl + '?payKey=' + order.payment_details.payKey;
		$http({
			url: apiUrl,
			method: "DELETE"
		}).success(function (data) {
			fn(data);
		}).error(function (err) {
			console.log('END:Got Order with ERROR');
			fn(err);
		});
	};

	this.getEstimatedTax = function (order, fn) {
		var apiUrl = baseUrl + ['orders', 'estimatedTax'].join('/');
		$http({
			url: apiUrl,
			method: "POST",
			data: angular.toJson(order)
		}).success(function (data) {
			fn(data);
		}).error(function (err) {
			console.log('END:get estimated tax with ERROR');
			fn(err);
		});
	};

	this.checkForInactiveProducts = function (order, fn) {
		var apiUrl = baseUrl + ['orders', 'inactiveProducts'].join('/');
		$http({
			url: apiUrl,
			method: "POST",
			data: angular.toJson(order)
		}).success(function (data) {
			fn(data, null);
		}).error(function (err) {
			fn(null, err);
		});
	};

});
