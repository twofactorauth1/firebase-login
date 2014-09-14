'use strict';

mainApp.controller('MainCtrl', ['$scope', 'accountService', 'websiteService', 'themeService', 'pagesService', 'ENV', '$location', '$document', '$anchorScroll',
    function ($scope, accountService, websiteService, themeService, pagesService, ENV, $location, $document, $anchorScroll) {

        var account, pages, website, that = this;
        that.segmentIOWriteKey = ENV.segmentKey;


        $scope.isSection = function(value) {
            if (value == 'section') {
              return true;
            } else {
              return false;
            }
        };

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
                that.website = data;
                if(website.settings) {
                    $scope.primaryColor = website.settings.primary_color;
                    $scope.primaryHighlight = website.settings.primary_highlight;
                    $scope.secondaryColor = website.settings.secondary_color;
                    $scope.navHover = website.settings.nav_hover;
                    $scope.primaryTextColor = website.settings.primary_text_color;
                    $scope.fontFamily = website.settings.font_family;
                    $scope.fontFamily2 = website.settings.font_family_2;
                } else {
                    console.warn('settings was null on the website object');
                }
            }
        });

    }]);
