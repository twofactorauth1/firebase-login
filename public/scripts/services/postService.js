/*
 * Getting Pages Data From Database
 *
 * */
/*global mainApp, angular, console ,Image */
/*jslint unparam:true*/
/* eslint-disable no-console */
mainApp.service('postService', function ($http, $q) {

	'use strict';
	var baseUrl = '/api/1.0/';
	this.getAllPosts = function (fn) {
		var apiUrl = baseUrl + ['cms', 'blog'].join('/');
		$http.get(apiUrl)
			.success(function (data) {
				fn(data);
			});
	};
	this.getSinglePost = function (handle, websiteId, fn) {
		console.log('getSinglePost >>> ', handle, websiteId);
		var apiUrl = baseUrl + ['cms', 'website', websiteId, 'blog', handle].join('/');
		$http.get(apiUrl)
			.success(function (data) {
				fn(data);
			})
			.error(function (err) {
				console.log('END:getSinglePost with ERROR');
				fn(err, null);
			});
	};
	this.getAllPostsByPageId = function (pageId, fn) {
		//  page/:id/blog
		var apiUrl = baseUrl + ['cms', 'page', pageId, 'blog'].join('/');
		$http.get(apiUrl)
			.success(function (data) {
				fn(data);
			});
	};
	this.createPost = function (pageId, postdata, fn) {
		var apiUrl = baseUrl + ['cms', 'page', pageId, 'blog'].join('/');
		$http({
			url: apiUrl,
			method: "POST",
			data: angular.toJson(postdata)
		}).success(function (data) {
			fn(data);
		}).error(function () {
			console.log('END:Create Page with ERROR');
		});
	};
	this.deletePost = function (pageId, postId, fn) {
		var apiUrl = baseUrl + ['cms', 'page', pageId, 'blog', postId].join('/');
		$http({
			url: apiUrl,
			method: "DELETE"
		}).finally(function () {
			// when delete is successful api returns status code 1
			//if ( resp.status === 1 )
			fn();
		});
	};


	//page/:pageId/blog/:postId'
	this.updatePost = function (pageId, postId, postdata, fn) {
		var apiUrl = baseUrl + ['cms', 'page', pageId, 'blog', postId].join('/');
		$http({
			url: apiUrl,
			method: "POST",
			data: angular.toJson(postdata)
		}).success(function (data) {
			fn(data);
		}).error(function (err) {
			console.log('END:Website Service updatePage with ERROR');
			fn(err, null);
		});
	};
	//page/:pageId/blog/:postId'
	this.sharePostOnFacebook = function (postdata, fn) {
		var apiUrl = baseUrl + ['social', 'facebook', 'share', 'link'].join('/');
		$http({
			url: apiUrl,
			method: "POST",
			data: angular.toJson(postdata)
		}).success(function (data) {
			fn(data);
		}).error(function (err) {
			console.log('END:Facebook social Service ERROR');
			fn(err, null);
		});
	};
	this.sharePostOnLinkedIn = function (postdata, fn) {
		var apiUrl = baseUrl + ['social', 'linkedin', 'share', 'link'].join('/');
		$http({
			url: apiUrl,
			method: "POST",
			data: angular.toJson(postdata)
		}).success(function (data) {
			fn(data);
		}).error(function (err) {
			console.log('END:LinkedIn social Service ERROR');
			fn(err, null);
		});
	};
	this.sharePostOnTwitter = function (postdata, fn) {
		var apiUrl = baseUrl + ['social', 'twitter', 'status'].join('/');
		$http({
			url: apiUrl,
			method: "POST",
			data: angular.toJson(postdata)
		}).success(function (data) {
			fn(data);
		}).error(function (err) {
			console.log('END:Twitter social ERROR');
			fn(err, null);
		});
	};

	this.isValidImage = function (src) {
		var deferred = $q.defer(), image = new Image();
		image.onerror = function () {
			deferred.resolve(false);
		};
		image.onload = function () {
			deferred.resolve(true);
		};
		image.src = src;
		return deferred.promise;
	};

});
