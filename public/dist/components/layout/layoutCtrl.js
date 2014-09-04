'use strict';

mainApp.controller('LayoutCtrl', ['$scope', 'pagesService', 'accountService', 'websiteService',
    function ($scope, pagesService, accountService, websiteService) {

        var account, theme, website, pages, that = this;
        console.log('i m layout controller');

        pagesService(function (err, data) {
            if (err) {
                console.log('Controller:LayoutCtrl -> Method:accountService Error: ' + err);
            } else {
                that.pages = data;
                console.log('Controller:LayoutCtrl -> Method:accountService Success: ', data);
            }
        });

    }]);
