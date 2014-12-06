define([
    'app',
    'userService',
    'websiteService',
    'colorpicker',
    'ngProgress'
], function(app) {
    app.register.controller('WebsiteManageCtrl', [
        '$scope',
        'UserService',
        'WebsiteService',
        'ngProgress',
        function($scope, UserService, WebsiteService, ngProgress) {
            ngProgress.start();
            var account;
            $scope.activeTab = 'pages';
            UserService.getAccount(function(account) {
                $scope.account = account;
                this.account = account;
                //get pages and find this page
                WebsiteService.getPages(account.website.websiteId, function(pages) {
                    console.log('pages ', pages);
                    $scope.pages = pages;
                });

                WebsiteService.getPosts(function(posts) {
                    console.log('posts ', posts);
                    $scope.posts = posts;
                });

                WebsiteService.getThemes(function(themes) {
                    $scope.themes = themes;
                    console.log('themes ', themes);
                    $scope.currentTheme = _.findWhere($scope.themes, {
                        _id: account.website.themeId
                    });
                });

                WebsiteService.getWebsite(account.website.websiteId, function(website) {

                    $scope.website = website;
                    $scope.website.settings = $scope.website.settings || {};

                    $scope.primaryColor = $scope.website.settings.primary_color;
                    $scope.secondaryColor = $scope.website.settings.secondary_color;
                    $scope.primaryHighlight = $scope.website.settings.primary_highlight;
                    $scope.primaryTextColor = $scope.website.settings.primary_text_color;
                    $scope.primaryFontFamily = $scope.website.settings.font_family;
                    $scope.secondaryFontFamily = $scope.website.settings.font_family_2;
                    $scope.googleFontFamily = $scope.website.settings.google_font_family;

                    $scope.primaryFontStack = $scope.website.settings.font_family;
                    $scope.secondaryFontStack = $scope.website.settings.font_family_2;

                    ngProgress.complete();
                });
            });

            $scope.changeSelectedTheme = function(theme) {
                $scope.selectedTheme = theme;
            };
        }
    ]);
});
