'use strict';

mainApp.controller('LayoutCtrl', ['$scope', 'pagesService', 'websiteService', 'postsService', 'accountService', 'ENV', '$window', '$location',
    function ($scope, pagesService, websiteService, postsService, accountService, ENV, $window, $location) {

        var account, theme, website, pages, blogposts, route, postname, that = this;
        route = $location.$$path.replace('/', '');
        console.log('i m layout controller', route);
        //var config = angular.module('config');
        console.dir(ENV);
        that.segmentIOWriteKey = ENV.segmentKey;
        $window.segmentIOWriteKey = ENV.segmentKey;
        //that.themeUrl = $scope.themeUrl;

        accountService(function (err, data) {
            if (err) {
                console.log('Controller:MainCtrl -> Method:accountService Error: ' + err);
            } else {
                account = data;
                console.log('Controller:MainCtrl -> AccountService Hit');
                console.log('Data: ' + JSON.stringify(data));

                //Include Layout For Theme
                that.themeUrl = 'components/layout/layout_default.html';

                console.log('Controller:MainCtrl -> Method:accountService Success: ', data);
            }
        });

        pagesService(function (err, data) {
            if (err) {
                console.log('Controller:LayoutCtrl -> Method:pageService Error: ' + err);
            } else {
                if (route === '/' || route === '') {
                    route = 'index';
                }
                if (route.indexOf("blog/") > -1) {
                    route = 'single-post';
                }
                console.log('Route: '+route);
                that.pages = data[route];
                console.log('Controller:LayoutCtrl -> Method:pageService Success: ', data[route]);
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
                console.log('Post Name'+postname);
                console.log('Controller:LayoutCtrl -> Method:postsService Success: ', data);

                //do something
            }
        });

    }]);
