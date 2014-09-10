'use strict';

mainApp.controller('LayoutCtrl', ['$scope', 'pagesService', 'websiteService', 'postsService', 'ENV', '$window',
    function ($scope, pagesService, websiteService, postsService, ENV, $window) {

        var account, theme, website, pages, blogposts, that = this;
        console.log('i m layout controller');
        //var config = angular.module('config');
        console.dir(ENV);
        that.segmentIOWriteKey = ENV.segmentKey;
        $window.segmentIOWriteKey = ENV.segmentKey;

        pagesService(function (err, data) {
            if (err) {
                console.log('Controller:LayoutCtrl -> Method:pageService Error: ' + err);
            } else {
                that.pages = data;
                console.log('Controller:LayoutCtrl -> Method:pageService Success: ', data);
            }
        });

        websiteService(function (err, data) {
            if (err) {
                console.log('Controller:LayoutCtrl -> Method:websiteService Error: ' + err);
            } else {
                that.website = data;
                console.log('Controller:LayoutCtrl -> Method:websiteService Success: ', data);

                //do something
            }
        });

        postsService(function (err, data) {
            if (err) {
                console.log('Controller:LayoutCtrl -> Method:postsService Error: ' + err);
            } else {
                that.blogposts = data;
                console.log('Controller:LayoutCtrl -> Method:postsService Success: ', data);

                //do something
            }
        });

    }]);
