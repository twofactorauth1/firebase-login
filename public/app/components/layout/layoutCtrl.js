'use strict';

mainApp.controller('LayoutCtrl', ['$scope', 'pagesService',
    function ($scope, pagesService) {

        var account, theme, website, pages, that = this;
        console.log('i m layout controller');

        pagesService(function (err, data) {
            if (err) {
                console.log('Controller:LayoutCtrl -> Method:pageService Error: ' + err);
            } else {
                that.pages = data;
                console.log('Controller:LayoutCtrl -> Method:pageService Success: ', data);
            }
        });

    }]);
