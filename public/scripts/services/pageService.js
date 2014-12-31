/*
 * Verifying Account According to Subdomain
 * */

'use strict';
mainApp.service('pageService', ['$http', function ($http) {
    var baseUrl = '/api/1.0/';

    this.createPage = function(websiteId, pagedata, fn) {
            var self = this;
            var apiUrl = baseUrl + ['cms', 'website', websiteId, 'page'].join('/');
            $http({
                url: apiUrl,
                method: "POST",
                data: angular.toJson(pagedata)
            })
            .success(function (data, status, headers, config) {
                console.log('data >>> ', data);
                console.log('data >>> ', data);
                fn(data);
            })
            .error(function (err) {
                console.log('END:Create Page with ERROR');
            });
        };

    this.addNewComponent = function(pageId, title, type,cmpVersion, fn) {
        var apiUrl = baseUrl + ['cms', 'page', pageId, 'components'].join('/');
        var data = {
            title : title,
            type : type,
            cmpVersion : cmpVersion
        };
        $http({
            url: apiUrl,
            method: "POST",
            data: angular.toJson(data)
        })
        .success(function (data, status, headers, config) {
            console.log('Added New Component: ', data);
            fn(data);
        })
        .error(function (err) {
            console.log('END:Page Service with ERROR');
        });
    };

    //website/:websiteid/page/:handle
    this.getPage = function (websiteID, handle, fn) {
        var apiUrl = baseUrl + ['cms', 'website', websiteID, 'page', handle].join('/');
        $http.get(apiUrl)
        .success(function (data, status, headers, config) {
            fn(data);
        })
        .error(function (err) {
            console.log('END:getSinglePage with ERROR');
            fn(err, null);
        });
    };

}]);