define([
    'app',
    'userService',
    'websiteService',
    'colorpicker',
    'ngProgress',
    'toaster',
    'truncate',
], function(app) {
    app.register.controller('WebsiteManageCtrl', [
        '$scope',
        'UserService',
        'WebsiteService',
        'ngProgress',
        'toaster',
        function($scope, UserService, WebsiteService, ngProgress, toaster) {
            ngProgress.start();
            var account;
            $scope.showToaster = false;

            $scope.$watch('activeTab', function(newValue, oldValue) {
                if ($scope.userPreferences) {
                    $scope.userPreferences.website_default_tab = newValue;
                    $scope.savePreferencesFn();
                }
            });

            UserService.getUserPreferences(function(preferences) {
                $scope.userPreferences = preferences;
                $scope.activeTab = preferences.website_default_tab || 'pages';
            });

            $scope.savePreferencesFn = function() {
                UserService.updateUserPreferences($scope.userPreferences, $scope.showToaster, function() {})
            };

            UserService.getAccount(function(account) {
                $scope.account = account;
                this.account = account;
                //get pages and find this page
                WebsiteService.getPages(account.website.websiteId, function(pages) {
                    console.log('pages ', pages);
                    var _pages =[];
                    for( var i in pages ) {
                        if (pages.hasOwnProperty(i)){
                           _pages.unshift(pages[i]);
                        }
                    }
                    $scope.pages = _pages;
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

            $scope.changeTheme = function(theme) {

                $scope.currentTheme = theme;

                WebsiteService.setWebsiteTheme($scope.currentTheme._id, $scope.website._id, function(data) {
                    toaster.pop('success', "Theme saved successfully");
                });
            };

            $scope.createPageValidated = false;

            $scope.validateCreatePage = function(page) {
                console.log('page ', page);
                if (page.handle == '') {
                    $scope.handleError = true
                } else {
                    $scope.handleError = false
                }
                if (page.title == '') {
                    $scope.titleError = true
                } else {
                    $scope.titleError = false
                }
                console.log('$scope.titleError ', $scope.titleError);
                console.log('$scope.handleError  ', $scope.handleError);
                if (page && page.title && page.title != '' && page.handle && page.handle != '') {
                    console.log('page validated');
                    $scope.createPageValidated = true;
                }
            };

            $scope.createPage = function(page, $event) {

                console.log('$scope.createPageValidated ', $scope.createPageValidated);

                if (!$scope.createPageValidated) {
                    return false;
                }

                var websiteId = $scope.website._id;

                var pageData = {
                    title: page.title,
                    handle: page.handle,
                    mainmenu: page.mainmenu
                };

                var hasHandle = false;
                for (var i = 0; i < $scope.pages.length; i++) {
                    if ($scope.pages[i].handle === page.handle) {
                        hasHandle = true;
                    }
                };


                if (!hasHandle) {
                    WebsiteService.createPage(websiteId, pageData, function(newpage) {
                        toaster.pop('success', "Page Created", "The " + newpage.title + " page was created successfully.");
                        $('#create-page-modal').modal('hide');
                        $scope.pages.push(newpage);
                    });
                } else {
                    toaster.pop('error', "Page URL " + page.handle, "Already exists");
                    $event.preventDefault();
                    $event.stopPropagation();
                }
            };
        }
    ]);
});
