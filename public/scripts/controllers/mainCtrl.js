'use strict';

mainApp.controller('MainCtrl', ['$scope', 'accountService', 'websiteService', 'themeService', 'pagesService',
    function ($scope, accountService, websiteService, themeService, pagesService) {

        var account, pages, website, that = this;

        accountService(function (err, data) {
            if (err) {
                console.log('Controller:MainCtrl -> Method:accountService Error: ' + err);
            } else {
                account = data;

                //Include Layout For Theme
                that.themeUrl = 'components/layout/layout_' + account.website.themeId + '.html';
            }
        });

        pagesService(function (err, data) {
            if (err) {
                console.log('Controller:MainCtrl -> Method:pageService Error: ' + err);
            } else {
                pages = data;

                //Set Page Title
                that.pageName = pages.title;
            }
        });

        websiteService(function (err, data) {
            if (err) {
                console.log('Controller:MainCtrl -> Method:websiteService Error: ' + err);
            } else {
                website = data;
            }
        });

    }]);
