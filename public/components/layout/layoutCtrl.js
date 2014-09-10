'use strict';

mainApp.controller('LayoutCtrl', ['$scope', 'pagesService', 'websiteService', 'postsService', 'accountService', 'ENV', '$window',
    function ($scope, pagesService, websiteService, postsService, accountService, ENV, $window) {

        var account, theme, website, pages, blogposts, that = this;
        console.log('i m layout controller');
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
                that.themeUrl = 'components/layout/layout_' + account.website.themeId + '.html';

                console.log('Controller:MainCtrl -> Method:accountService Success: ', data);
            }
        });

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
