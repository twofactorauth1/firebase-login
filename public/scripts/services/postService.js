/*
 * Getting Pages Data From Database
 *
 * */
'use strict';
mainApp.service('postService', function ($http) {
    var baseUrl = '/api/1.0/';
    this.getAllPosts = function (fn) {
        var apiUrl = baseUrl + ['cms', 'blog'].join('/');
        $http.get(apiUrl)
            .success(function (data, status, headers, config) {
                fn(data);
            });
    };
    this.getAllPostsByPageId = function (pageId, fn) {
        //  page/:id/blog
        var apiUrl = baseUrl + ['cms', 'page', pageId, 'blog'].join('/');
        $http.get(apiUrl)
            .success(function (data, status, headers, config) {
                fn(data);
            });
    };
    this.createPost = function (pageId, postdata, fn) {
        var apiUrl = baseUrl + ['cms', 'page', pageId, 'blog'].join('/');
        $http({
            url: apiUrl,
            method: "POST",
            data: angular.toJson(postdata)
        })
            .success(function (data, status, headers, config) {
                fn(data);
            })
            .error(function (err) {
                console.log('END:Create Page with ERROR');
            });
    };
    this.deletePost = function (pageId, postId, fn) {
        var apiUrl = baseUrl + ['cms', 'page', pageId, 'blog', postId].join('/');
        $http({
            url: apiUrl,
            method: "DELETE"
        }).finally(function(resp){
                // when delete is successful api returns status code 1
                if ( resp.status === 1 )
                fn();
            });
    };


    //page/:pageId/blog/:postId'
    this.updatePost = function(pageId, postId, postdata, fn) {
        var apiUrl = baseUrl + ['cms', 'page', pageId, 'blog', postId].join('/');
        $http({
            url: apiUrl,
            method: "POST",
            data: angular.toJson(postdata)
        })
            .success(function (data, status, headers, config) {
                fn(data);
            })
            .error(function (err) {
                console.log('END:Website Service updatePage with ERROR');
                fn(err, null);
            });
    };
    //page/:pageId/blog/:postId'
    this.sharePostOnFacebook = function(postdata, fn) {         
        var apiUrl = baseUrl + ['social', 'facebook', 'share', 'link' ].join('/');
        $http({
            url: apiUrl,
            method: "POST",
            data: angular.toJson(postdata)
        })
        .success(function (data, status, headers, config) {
            fn(data);
        })
        .error(function (err) {
            console.log('END:Facebook social Service ERROR');
            fn(err, null);
        });
    };
    this.sharePostOnLinkedIn = function(postdata, fn) {
        var apiUrl = baseUrl + ['social', 'linkedin', 'share', 'link' ].join('/');
        $http({
            url: apiUrl,
            method: "POST",
            data: angular.toJson(postdata)
        })
        .success(function (data, status, headers, config) {
            fn(data);
        })
        .error(function (err) {
            console.log('END:LinkedIn social Service ERROR');
            fn(err, null);
        });
    };
    this.sharePostOnTwitter = function(postdata, fn) {
        var apiUrl = baseUrl + ['social', 'twitter', 'status' ].join('/');
        $http({
            url: apiUrl,
            method: "POST",
            data: angular.toJson(postdata)
        })
            .success(function (data, status, headers, config) {
                fn(data);
            })
            .error(function (err) {
                console.log('END:Twitter social ERROR');
                fn(err, null);
            });
    };

});