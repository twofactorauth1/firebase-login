'use strict';

mainApp.controller('LayoutCtrl', ['$scope', 'pagesService', 'websiteService', 'postsService', 'accountService', 'ENV', '$window', '$location', '$route', '$routeParams', '$filter', '$anchorScroll',
    function ($scope, pagesService, websiteService, postsService, accountService, ENV, $window, $location, $route, $routeParams, $filter, $anchorScroll) {
        var account, theme, website, pages, blogposts, route, postname, that = this;
        route = $location.$$path;

        $scope.$route = $route;
        $scope.$location = $location;
        $scope.$routeParams = $routeParams;

        //var config = angular.module('config');
        that.segmentIOWriteKey = ENV.segmentKey;
        $window.segmentIOWriteKey = ENV.segmentKey;
        //that.themeUrl = $scope.themeUrl;

        accountService(function (err, data) {
            if (err) {
                console.log('Controller:MainCtrl -> Method:accountService Error: ' + err);
            } else {
                that.account = data;

                //Include Layout For Theme
                that.themeUrl = 'components/layout/layout_indimain.html';

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
                route = route.replace('/', '');
                that.pages = data[route];
            }
        });

        websiteService(function (err, data) {
            if (err) {
                console.log('Controller:LayoutCtrl -> Method:websiteService Error: ' + err);
            } else {
                that.website = data;
            }
        });

        postsService(function (err, data) {
            if (err) {
                console.log('Controller:LayoutCtrl -> Method:postsService Error: ' + err);
            } else {

                if ($route.current.params.tagname) {
                    console.log('Theres a tag name');
                     var found = $filter('getByProperty')('post_tags', $route.current.params.tagname, data);
                } else {

                    that.blogposts = data;

                }
            }
        });

    }]);
