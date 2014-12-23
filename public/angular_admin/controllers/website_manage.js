define([
    'app',
    'userService',
    'websiteService',
    'colorpicker',
    'ngProgress',
    'toaster',
    'truncate',
    'ngOnboarding',
    'timeAgoFilter',
    'reverse',
    'jquery',
    'mediaDirective',
], function(app) {
    app.register.controller('WebsiteManageCtrl', [
        '$scope',
        '$location',
        'UserService',
        'WebsiteService',
        'ngProgress',
        'toaster',
        function($scope, $location, UserService, WebsiteService, ngProgress, toaster) {
            ngProgress.start();
            var account;
            $scope.showToaster = false;
            $scope.toasterOptions = { 'time-out': 3000, 'close-button':true, 'position-class': 'toast-top-right' };

            $scope.beginOnboarding = function(type) {
                if (type == 'select-theme') {
                    $scope.stepIndex = 0
                    $scope.showOnboarding = true;
                    $scope.activeTab = 'themes';
                    $scope.onboardingSteps = [
                      {
                        overlay: true,
                        title: 'Task: Select A Theme',
                        description: "Choosing a theme will automatically create a website for your visitors to go, so you can capture them as leads.",
                        position: 'centered'
                      },
                      {
                        attachTo: '.btn-view-themes',
                        position: 'bottom',
                        overlay: false,
                        title: 'Themes Tab',
                        width: 400,
                        description: "This is the theme tab where you can change or modify your theme after you choose one."
                      },
                      {
                        attachTo: '.themes',
                        position: 'top',
                        overlay: false,
                        title: 'Select A Theme',
                        description: 'Choose one of the themes from below by clicking the switch button.'
                      }
                    ];
                }
                if (type == 'add-post') {
                    $scope.stepIndex = 0
                    $scope.showOnboarding = true;
                    $scope.activeTab = 'posts';
                    $scope.onboardingSteps = [
                      {
                        overlay: true,
                        title: 'Task: Create First Blog Post',
                        description: "Keep everyone up to date and informed with a regular blog.",
                        position: 'centered'
                      },
                      {
                        attachTo: '.btn-view-posts',
                        position: 'bottom',
                        overlay: false,
                        title: 'Posts Tab',
                        width: 400,
                        description: "This is the posts tab where you can manage all your blog posts past, and future."
                      },
                      {
                        attachTo: '.btn-add',
                        position: 'bottom',
                        xOffset: -60,
                        overlay: false,
                        title: 'Add Post Button',
                        description: 'Select Add Post from the drop down and you will be greeted with a pop-up to add your basic post information.'
                      }
                    ];
                }
            };

            if ($location.$$search['onboarding']) {
                $scope.beginOnboarding($location.$$search['onboarding']);
            }

            $scope.$watch('activeTab', function(newValue, oldValue) {
                if ($scope.userPreferences) {
                    $scope.userPreferences.website_default_tab = newValue;
                    $scope.savePreferencesFn();
                }
            });

            UserService.getUserPreferences(function(preferences) {
                $scope.userPreferences = preferences;
                if (!$location.$$search['onboarding']) {
                    $scope.activeTab = preferences.website_default_tab || 'pages';
                }
            });

            $scope.savePreferencesFn = function() {
                UserService.updateUserPreferences($scope.userPreferences, $scope.showToaster, function() {})
            };

            // var xH;
            // $('.scrollhover').hover(
            //     function() {
            //         console.log('scrollhover');
            //         xH = $(this).children("img").css("height");
            //         xH = parseInt(xH);
            //         console.log('xh ', xh);
            //         xH = xH - 150;
            //         xH = "-" + xH + "px";
            //         $(this).children( "img" ).css("top",xH);
            //     }, function() {
            //         $(this).children( "img" ).css("top","0px");
            //     }
            // );

            $('.scrollhover').on('hover', function() {
                console.log('hovering');
            });

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
                        if (pages[i].handle == 'blog') {
                            $scope.blogId = pages[i]._id;
                        }
                    }
                    $scope.pages = _pages;
                });

                UserService.getUserPreferences(function(preferences) {
                    $scope.preferences = preferences;
                    console.log('preferences ', preferences);
                    // UserService.updateUserPreferences(preferences, false, function() {});
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

                //if theme doesn;t exist, set task complete
                if (!$scope.preferences.tasks) {
                    $scope.preferences.tasks = {};
                }

                if (!$scope.preferences.tasks.select_theme || $scope.preferences.tasks.select_theme == false) {
                    $scope.preferences.tasks.select_theme = true;
                    UserService.updateUserPreferences($scope.preferences, false, function() {
                        $scope.toasterOptions['position-class'] = 'toast-bottom-full-width';
                        toaster.pop('success', "You selected you first theme!");
                    });
                };

                $scope.currentTheme = theme;

                WebsiteService.setWebsiteTheme($scope.currentTheme._id, $scope.website._id, function(data) {
                    toaster.pop('success', "Theme saved successfully");
                    var hasHandle = false;
                    var page_handle = 'index'
                    for (var i = 0; i < $scope.pages.length; i++) {
                        if ($scope.pages[i].handle === page_handle) {
                            hasHandle = true;
                        }
                    };
                    if(!hasHandle)
                    {
                       WebsiteService.createPageFromTheme($scope.currentTheme._id, $scope.website._id, page_handle, function(data) {
                        $scope.pages.push(data);
                        toaster.pop('success', "Page created successfully");
                       })
                    }
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

            $scope.createPost = function(postData) {
                console.log('$scope.blogId ', $scope.blogId);
                WebsiteService.createPost($scope.blogId, postData, function(data) {
                    console.log('successfully created post ', data);
                    toaster.pop('success', "Post Created", "The " + data.post_title + " post was created successfully.");
                    $('#create-post-modal').modal('hide');
                    $scope.posts.push(data);
                });
            };

             $scope.insertMedia = function(asset) {
                $scope.website.settings.favicon = asset.url;
                        var data = {
                           _id: $scope.website._id,
                           accountId: $scope.website.accountId,
                           settings: $scope.website.settings
                        };
                        //website service - save page data
                    WebsiteService.updateWebsite(data, function(data) {
                            console.log('updated website settings', data);
                    });

             };

        }
    ]);
});