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
    'checkImageDirective',
    'blockUI',
    'toasterService',
    'headroom',
    'ngHeadroom'
], function(app) {
    app.register.controller('WebsiteManageCtrl', [
        '$scope',
        '$location',
        'UserService',
        'WebsiteService',
        'ngProgress',
        'toaster',
        'blockUI', '$state', 'ToasterService',
        function($scope, $location, UserService, WebsiteService, ngProgress, toaster, blockUI, $state, ToasterService) {
            ngProgress.start();
            var account;
            $scope.showToaster = false;
            $scope.showOnboarding = false;
            $scope.stepIndex = 0;
            $scope.onboardingSteps = [{
                overlay: false
            }]
            $scope.toasterOptions = {
                'time-out': 3000,
                'close-button': true,
                'position-class': 'toast-top-right'
            };
            $scope.onboardingSteps = [{
                overlay: false
            }];
            $scope.numPerPage = 27;
            $scope.paginationRange = 12;
            $scope.pagesPaging = {};
            $scope.pagesPaging.take = $scope.numPerPage;
            $scope.pagesPaging.page = 1;
            $scope.postPaging = {};
            $scope.postPaging.take = $scope.numPerPage;
            $scope.postPaging.page = 1;


            $scope.beginOnboarding = function(type) {

                $scope.obType = type;
                if (type == 'select-theme') {
                    $scope.stepIndex = 0

                    $scope.activeTab = 'themes';
                    $scope.onboardingSteps = [{
                        overlay: true,
                        title: 'Task: Select A Theme',
                        description: "Choosing a theme will automatically create a website for your visitors to go, so you can capture them as leads.",
                        position: 'centered'
                    }, {
                        attachTo: '.btn-view-themes',
                        position: 'bottom',
                        overlay: false,
                        title: 'Themes Tab',
                        width: 400,
                        description: "This is the theme tab where you can change or modify your theme after you choose one."
                    }, {
                        attachTo: '.themes',
                        position: 'top',
                        overlay: false,
                        title: 'Select A Theme',
                        description: 'Choose one of the themes from below by clicking the switch button.'
                    }];
                }
                if (type == 'add-post') {
                    $scope.stepIndex = 0

                    $scope.activeTab = 'posts';
                    $scope.onboardingSteps = [{
                        overlay: true,
                        title: 'Task: Create First Blog Post',
                        description: "Keep everyone up to date and informed with a regular blog.",
                        position: 'centered'
                    }, {
                        attachTo: '.btn-view-posts',
                        position: 'bottom',
                        overlay: false,
                        title: 'Posts Tab',
                        width: 400,
                        description: "This is the posts tab where you can manage all your blog posts past, and future."
                    }, {
                        attachTo: '.btn-add',
                        position: 'bottom',
                        xOffset: -60,
                        overlay: false,
                        title: 'Add Post Button',
                        description: 'Select Add Post from the drop down and you will be greeted with a pop-up to add your basic post information.'
                    }];
                }
            };

            $scope.finishOnboarding = function() {
                if ($scope.obType == 'add-post') {
                    $scope.userPreferences.tasks.add_post = true;
                }
                if ($scope.obType == 'select-theme') {
                    $scope.userPreferences.tasks.select_theme = true;
                }
                UserService.updateUserPreferences($scope.userPreferences, false, function() {});
            };

            if ($location.$$search['onboarding']) {
                $scope.beginOnboarding($location.$$search['onboarding']);
            }

            $scope.$watch('activeTab', function(newValue, oldValue) {
                console.log('active tab changing to ' + newValue + ' from ' + oldValue);
                if ($scope.userPreferences) {
                    $scope.userPreferences.website_default_tab = newValue;
                    console.log('final change ' + $scope.userPreferences.website_default_tab);
                    $scope.savePreferencesFn();
                }
            });

            UserService.getUserPreferences(function(preferences) {
                console.log('getUserPreferences >>> ', preferences);
                $scope.userPreferences = preferences;
                if ($scope.userPreferences.tasks) {
                    if ($scope.showOnboarding = false && $scope.userPreferences.tasks.add_post == undefined || $scope.userPreferences.tasks.add_post == false) {
                        $scope.finishOnboarding();
                    }
                }
                if (!$location.$$search['onboarding']) {
                    console.log('setting active tab >>> ', preferences.website_default_tab);
                    $scope.activeTab = preferences.website_default_tab || 'pages';
                }
            });

            $scope.savePreferencesFn = function() {
                UserService.updateUserPreferences($scope.userPreferences, $scope.showToaster, function() {})
                console.log('savePreferencesFn >>> $scope.userPreferences ', $scope.userPreferences);
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
              if (account.locked_sub == undefined || account.locked_sub == true) {
                UserService.getUserPreferences(function(preferences) {
                    $scope.preferences = preferences;
                    $scope.userPreferences.account_default_tab = 'billing';
                  UserService.updateUserPreferences($scope.userPreferences, $scope.showToaster, function() {
                    ToasterService.setPending('warning', "No Subscription");
                    $state.go('account');
                  });
                });
              }
                $scope.account = account;
                this.account = account;

                $scope.loadWebsitePages();

                UserService.getUserPreferences(function(preferences) {
                    $scope.preferences = preferences;
                    // UserService.updateUserPreferences(preferences, false, function() {});
                });

                $scope.loadWebsitePosts();

                WebsiteService.getTemplates(function(templates) {
                    $scope.templates = templates;
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
                    if ($scope.website.settings == {}) {
                        $scope.primaryFontFamily = 'Spinnaker';
                        $scope.secondaryFontFamily = 'Spinnaker';
                        $scope.googleFontFamily = 'Spinnaker';

                        $scope.primaryFontStack = 'Spinnaker';
                        $scope.secondaryFontStack = 'Spinnaker';
                    }

                    ngProgress.complete();
                    if ($location.$$search.onboarding) {
                        $scope.showOnboarding = true;
                    }
                });
            });

            $scope.loadWebsitePages = function() {
                var queryParams = {
                        limit: $scope.pagesPaging.take,
                        skip: ($scope.pagesPaging.page - 1) * $scope.pagesPaging.take
                    }
                    //get pages and find this page
                WebsiteService.getPagesWithLimit($scope.account.website.websiteId, queryParams, function(pages) {
                    var _pages = [];
                    $scope.pagesPaging.total = pages.total;
                    $scope.calculatePages();
                    $scope.pagesPaging.disablePaging = false;
                    for (var i in pages.results) {
                        if (pages.results.hasOwnProperty(i)) {
                            _pages.unshift(pages.results[i]);
                        }
                        if (pages.results[i].handle == 'blog') {
                            $scope.blogId = pages.results[i]._id;
                        }
                        if (pages.results[i].handle == 'post') {
                            $scope.postId = pages.results[i]._id;
                        }
                    }
                    $scope.pages = _pages;
                    var editPageHandle = WebsiteService.getEditedPageHandle();
                    if ($scope.activeTab === 'pages' && editPageHandle) {

                        $scope.editedPage = _.findWhere($scope.pages, {
                            handle: editPageHandle
                        });
                        if ($scope.editedPage && $scope.editedPage.screenshot == null) {
                            var pagesBlockUI = blockUI.instances.get('pagesBlockUI');
                            pagesBlockUI.start();
                            var maxTries = 10;
                            var getScreenShot = function() {
                                WebsiteService.getPageScreenShot(editPageHandle, function(data) {
                                    if ((!data || !data.length) && maxTries > 0) {
                                        getScreenShot();
                                        maxTries = maxTries - 1;
                                    } else {
                                        WebsiteService.setEditedPageHandle();
                                        if (data && data.length)
                                            $scope.editedPage.screenshot = data;
                                        pagesBlockUI.stop();
                                    }
                                })
                            }
                            setTimeout(function() {
                                getScreenShot();
                            }, 5000);
                        }
                    }
                });
            };

            $scope.nextPage = function() {
                if($scope.pagesPaging.page !== $scope.pageCount())
                {
                    $scope.pagesPaging.disablePaging = true;
                    $scope.pagesPaging.page++;
                    $scope.loadWebsitePages();
                }
            };

            $scope.previousPage = function() {
                if($scope.pagesPaging.page !== 1)
                {
                    $scope.pagesPaging.disablePaging = true;
                    $scope.pagesPaging.page--;
                    $scope.loadWebsitePages();
                }
            };

            $scope.goToPage = function(index) {
                if($scope.pagesPaging.page !==  index && index !=="...")
                {
                    $scope.pagesPaging.disablePaging = true;
                    $scope.pagesPaging.page = index;
                    $scope.loadWebsitePages();
                }
            };

            $scope.calculatePages = function()
            {
                var totalPages = Math.ceil($scope.pagesPaging.total / $scope.numPerPage);
                var halfWay = Math.ceil($scope.paginationRange / 2);
                var position;

                if ($scope.pagesPaging.page <= halfWay) {
                    position = 'start';
                } else if (totalPages - halfWay < $scope.pagesPaging.page) {
                    position = 'end';
                } else {
                    position = 'middle';
                }
                $scope.paging = [];
                var i = 1;
                var ellipsesNeeded = $scope.paginationRange < totalPages;
                while (i <= totalPages && i <= $scope.paginationRange) {
                    var pageNumber = $scope.calculatePageNumber(i, $scope.pagesPaging.page, $scope.paginationRange, totalPages);

                    var openingEllipsesNeeded = (i === 2 && (position === 'middle' || position === 'end'));
                    var closingEllipsesNeeded = (i === $scope.paginationRange - 1 && (position === 'middle' || position === 'start'));
                    if (ellipsesNeeded && (openingEllipsesNeeded || closingEllipsesNeeded)) {
                        $scope.paging.push('...');
                    } else {
                        $scope.paging.push(pageNumber);
                    }
                    i ++;
                }
            }

            $scope.nextPageDisabled = function() {
                return $scope.pagesPaging.page === $scope.pageCount() ? true : false;
            };
            $scope.prevPageDisabled = function() {
                return $scope.pagesPaging.page <= 1 ? true : false;
            };
            $scope.pageCount = function() {
                var totalPages = Math.ceil($scope.pagesPaging.total / $scope.numPerPage);
                return totalPages;
            };

            $scope.calculatePageNumber=function(i, currentPage, paginationRange, totalPages) {
            var halfWay = Math.ceil(paginationRange/2);
            if (i === paginationRange) {
                return totalPages;
            } else if (i === 1) {
                return i;
            } else if (paginationRange < totalPages) {
                if (totalPages - halfWay < currentPage) {
                    return totalPages - paginationRange + i;
                } else if (halfWay < currentPage) {
                    return currentPage - halfWay + i;
                } else {
                    return i;
                }
            } else {
                return i;
            }
        }

            $scope.loadWebsitePosts = function() {
                var queryParams = {
                    limit: $scope.postPaging.take,
                    skip: ($scope.postPaging.page - 1) * $scope.postPaging.take
                }
                WebsiteService.getPostsWithLimit(queryParams, function(posts) {
                    $scope.postPaging.total = posts.total;
                    $scope.calculatePagePosts();
                    $scope.postPaging.disablePaging = false;
                    $scope.posts = posts.results;
                });

            }
            $scope.goToPostPage = function(index) {
                if($scope.postPaging.page !==  index && index !== '...')
                {
                    $scope.postPaging.disablePaging = true;
                    $scope.postPaging.page = index;
                    $scope.loadWebsitePosts();
                }
            };
            $scope.postNextPage = function() {
                 if($scope.postPaging.page !== $scope.postCount())
                 {
                    $scope.postPaging.disablePaging = true;
                    $scope.postPaging.page++;
                    $scope.loadWebsitePosts();
                 }
            };

            $scope.postPreviousPage = function() {
                if($scope.postPaging.page !== 1)
                {
                    $scope.postPaging.disablePaging = true;
                    $scope.postPaging.page--;
                    $scope.loadWebsitePosts();
                }
            };

            $scope.calculatePagePosts = function()
            {
                var totalPages = Math.ceil($scope.postPaging.total / $scope.numPerPage);
                var halfWay = Math.ceil($scope.paginationRange / 2);
                var position;

                if ($scope.postPaging.page <= halfWay) {
                    position = 'start';
                } else if (totalPages - halfWay < $scope.postPaging.page) {
                    position = 'end';
                } else {
                    position = 'middle';
                }
                $scope.pagingPost = [];
                var i = 1;
                var ellipsesNeeded = $scope.paginationRange < totalPages;
                while (i <= totalPages && i <= $scope.paginationRange) {
                    var pageNumber = $scope.calculatePageNumber(i, $scope.postPaging.page, $scope.paginationRange, totalPages);

                    var openingEllipsesNeeded = (i === 2 && (position === 'middle' || position === 'end'));
                    var closingEllipsesNeeded = (i === $scope.paginationRange - 1 && (position === 'middle' || position === 'start'));
                    if (ellipsesNeeded && (openingEllipsesNeeded || closingEllipsesNeeded)) {
                        $scope.pagingPost.push('...');
                    } else {
                        $scope.pagingPost.push(pageNumber);
                    }
                    i ++;
                }
            }

            $scope.postCount = function() {
                var totalPosts = Math.ceil($scope.postPaging.total / $scope.numPerPage);
                return totalPosts;
            };

            $scope.changeTheme = function(theme) {

                //if theme doesn;t exist, set task complete
                if (!$scope.preferences.tasks) {
                    $scope.preferences.tasks = {};
                }

                if (!$scope.preferences.tasks.select_theme || $scope.preferences.tasks.select_theme == false) {
                    $scope.preferences.tasks.select_theme = true;
                    UserService.updateUserPreferences($scope.preferences, false, function() {
                        $scope.toasterOptions['position-class'] = 'toast-bottom-full-width';
                        toaster.pop('success', "You selected you first theme!", '<div class="mb15"></div><a href="/admin#/account?onboarding=connect-social" class="btn btn-primary">Next Step: Connect Social Account</a>', 0, 'trustedHtml');
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
                    if (!hasHandle) {
                        WebsiteService.createPageFromTheme($scope.currentTheme._id, $scope.website._id, page_handle, function(data) {
                            $scope.pages.push(data);
                            toaster.pop('success', "Page created successfully");
                        })
                    }
                });
            };

            $scope.createPageValidated = false;

            $scope.validateCreatePage = function(page) {
                $scope.createPageValidated = false;
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
                if (page && page.title && page.title != '' && page.handle && page.handle != '') {
                    $scope.createPageValidated = true;
                }
            };

            $scope.createPage = function(page, $event) {
                $scope.validateCreatePage(page);
                console.log('$scope.createPageValidated ', $scope.createPageValidated);

                if (!$scope.createPageValidated) {
                    $('#page-title').parents('div.form-group').addClass('has-error');
                    $('#page-url').parents('div.form-group').addClass('has-error');
                    return false;
                } else {
                    $('#page-title').parents('div.form-group').removeClass('has-error');
                    $('#page-url').parents('div.form-group').removeClass('has-error');
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
                        validateCreatePage
                        $scope.pages.push(newpage);
                    });
                } else {
                    toaster.pop('error', "Page URL " + page.handle, "Already exists");
                    $event.preventDefault();
                    $event.stopPropagation();
                }
            };

            $scope.createPageFromTemplate = function(page, $event) {
                $scope.validateCreatePage(page);
                console.log('$scope.createPageValidated ', $scope.createPageValidated);

                if (!$scope.createPageValidated) {
                    $('#page-title').parents('div.form-group').addClass('has-error');
                    $('#page-url').parents('div.form-group').addClass('has-error');
                    return false;
                } else {
                    $('#page-title').parents('div.form-group').removeClass('has-error');
                    $('#page-url').parents('div.form-group').removeClass('has-error');
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
                    WebsiteService.createPageFromTemplate($scope.selectedTemplate._id, websiteId, pageData, function(newpage) {
                        toaster.pop('success', "Page Created", "The " + newpage.title + " page was created successfully.");
                        $('#create-page-modal').modal('hide');
                        $scope.pages.push(newpage);
                        page.title = "";
                        page.handle= "";
                        $scope.showChangeURL = false;                        
                    });
                } else {
                    toaster.pop('error', "Page URL " + page.handle, "Already exists");
                    $event.preventDefault();
                    $event.stopPropagation();
                }
            };

            $scope.setTemplateDetails = function(templateDetails) {
                console.log('setTemplateDetails >>> ', templateDetails);
                $scope.templateDetails = true;
                $scope.selectedTemplate = templateDetails;
            };

            $scope.createPostValidated = false;
            $scope.validateCreatePost = function(post) {
                if (!post.post_title || post.post_title == '') {
                    $scope.postTitleError = true
                } else {
                    $scope.postTitleError = false
                }
                if (!post.post_author || post.post_author == '') {
                    $scope.postAuthorError = true
                } else {
                    $scope.postAuthorError = false
                }
                if (!post.post_url || post.post_url == '') {
                    $scope.postUrlError = true
                } else {
                    $scope.postUrlError = false
                }
                if (post && post.post_title && post.post_title != '' && post.post_author && post.post_author != '' && post.post_url && post.post_url != '') {
                    $scope.createPostValidated = true;
                }
            };

            $scope.createPost = function(postData) {
                $scope.validateCreatePost(postData);
                console.log('$scope.createPostValidated ', $scope.createPostValidated);
                if (!$scope.createPostValidated) {
                    return false;
                }


                postData.websiteId = $scope.website._id;
                WebsiteService.createPost($scope.blogId || -1, postData, function(data) {
                    toaster.pop('success', "Post Created", "The " + data.post_title + " post was created successfully.");
                    $('#create-post-modal').modal('hide');
                    $scope.posts.push(data);
                })

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
            $scope.updateThemeSettings = function() {
                var data = {
                    _id: $scope.website._id,
                    accountId: $scope.website.accountId,
                    settings: $scope.website.settings
                };
                //website service - save page data
                WebsiteService.updateWebsite(data, function(data) {
                    console.log('updated website settings', data);
                });
            }

            //update the primary font
            $scope.updatePrimaryFont = function(font) {

                if ($scope.website.settings.font_family !== font.name) {
                    $scope.website.settings.font_family = font.name;
                    iFrame.contentWindow.triggerFontUpdate($scope.website.settings.font_family);
                    //document.getElementById("iframe-website").contentWindow.updateWebsite($scope.website);
                }
            };
        }
    ]);
});
