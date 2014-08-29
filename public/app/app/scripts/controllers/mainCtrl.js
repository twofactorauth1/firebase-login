'use strict';

mainApp.controller('MainCtrl', ['$scope', 'accountService', 'websiteService', 'themeService', 'pagesService',
    function ($scope, accountService, websiteService, themeService, pagesService) {

        var account, pages,that = this;

        accountService(function (err, data) {
            if (err) {
                console.log('Controller:MainCtrl -> Method:accountService Error: ' + err);
            } else {
                account = data;

                //Include Layout For Theme
                that.themeUrl = 'components/layout/layout_' + account.website.themeId + '.html';

                //Include CSS For Theme
                that.themeStyle = 'styles/style.' + account.website.themeId + '.css';

                console.log('Controller:MainCtrl -> Method:accountService Success: ', data);
            }
        });

        pagesService(function (err, data) {
            if (err) {
                console.log('Controller:MainCtrl -> Method:pageService Error: ' + err);
            } else {
                pages = data;
                console.log('Controller:MainCtrl -> Method:pageService Success: ', data);

                //Set Page Title
                that.pageName = pages[0].title;
            }
        });
    }]);
