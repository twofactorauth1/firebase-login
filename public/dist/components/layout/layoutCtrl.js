'use strict';

mainApp.controller('LayoutCtrl', ['$scope', 'pagesService', 'accountService', 'websiteService', 'postsService',
    function ($scope, pagesService, accountService, websiteService, postsService) {

        var account, theme, website, pages, blogposts, that = this;
        console.log('i m layout controller');

        pagesService(function (err, data) {
            if (err) {
                console.log('Controller:LayoutCtrl -> Method:accountService Error: ' + err);
            } else {
                that.pages = data;
                console.log('Controller:LayoutCtrl -> Method:accountService Success: ', data);
            }
        });

        websiteService(function (err, data) {
            if (err) {
                console.log('Controller:LayoutCtrl -> Method:websiteService Error: ' + err);
            } else {
                that.website = data;
                console.log('Controller:LayoutCtrl -> Method:websiteService Success: ', data);
            }
        });

        postsService(function (err, data) {
            if (err) {
                console.log('Controller:LayoutCtrl -> Method:postsService Error: ' + err);
            } else {
                that.blogposts = data;
                console.log('Controller:LayoutCtrl -> Method:postsService Success: ', data);
            }
        });

    }]);
