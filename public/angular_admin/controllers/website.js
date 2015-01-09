define([
    'app',
    'websiteService',
    'jqueryUI',
    'angularUI',
    'userService',
    'ngAnimate',
    'toaster',
    'colorpicker',
    'angularBootstrapSwitch',
    'ngProgress',
    'unsafeHtml',
    'mediaDirective',
    'confirmClick2',
    'confirmClickDirective',
    'courseServiceAdmin',
    'navigationService',
    'draggableModalDirective',
    'bootstrap-iconpicker-font-awesome',
    'bootstrap-iconpicker',
    'ngSweetAlert',
], function(app) {
    app.register.controller('WebsiteCtrl', [
        '$scope',
        '$window',
        '$timeout',
        '$location',
        'WebsiteService',
        'UserService',
        'toaster',
        'ngProgress',
        '$rootScope',
        'CourseService',
        'NavigationService',
        'SweetAlert',
        function($scope, $window, $timeout, $location, WebsiteService, UserService, toaster, ngProgress, $rootScope, CourseService, NavigationService, SweetAlert) {
            var user, account, components, currentPageContents, previousComponentOrder, allPages, originalCurrentPageComponents = that = this;
            ngProgress.start();

            //get user
            // UserService.getUser(function(user) {
            //     $scope.user = user;
            //     that.user = user;
            //     console.log('that.user.user_preferences.lastPageHandle >> ', that.user.user_preferences.lastPageHandle);
            //     if(that.user.user_preferences.lastPageHandle) {
            //         document.getElementById("iframe-website").setAttribute("src", '/page/'+that.user.user_preferences.lastPageHandle+'?editor=true');
            //         $scope.updatePage(that.user.user_preferences.lastPageHandle);
            //     }
            // });

            if ($location.$$search['pagehandle']) {
                document.getElementById("iframe-website").setAttribute("src", '/page/' + $location.$$search['pagehandle'] + '?editor=true');
            }

            if ($location.$$search['posthandle']) {
                document.getElementById("iframe-website").setAttribute("src", '/page/post/' + $location.$$search['posthandle'] + '?editor=true');
            }

            if ($location.$$search['custid']) {
                current_src = document.getElementById("iframe-website").getAttribute("src");
                document.getElementById("iframe-website").setAttribute("src", current_src + '&custid=' + $location.$$search['custid']);
            }

            NavigationService.updateNavigation();
            $scope.$back = function() {
                window.history.back();
            };

            var iFrame = document.getElementById("iframe-website");
            var subdomainCharLimit = 4;
            $scope.primaryFontStack = '';
            $scope.secondaryFontStack = '';
            $scope.iframeData = {};
            $scope.allPages = [];
            $scope.backup = {};
            $scope.components = [];

            $scope.isEditing = true;

            $scope.isMobile = false;

            $scope.components.sort(function(a, b) {
                return a.i > b.i;
            });

            $scope.status = {
                isopen: false
            };

            window.getUpdatediFrameRoute = function(data) {
                // console.log('getUpdatediFrameRoute', data);
            };

            $scope.spectrum = {
                options: {
                    showPalette: true,
                    clickoutFiresChange: true,
                    showInput: true,
                    showButtons: false,
                    allowEmpty: true,
                    hideAfterPaletteSelect: false,
                    showPaletteOnly: true,
                    togglePaletteOnly: true,
                    togglePaletteMoreText: 'more',
                    togglePaletteLessText: 'less',
                    palette: [
                        ["#C91F37", "#DC3023", "#9D2933", "#CF000F", "#E68364", "#F22613", "#CF3A24", "#C3272B", "#8F1D21", "#D24D57"],
                        ["#F08F907", "#F47983", "#DB5A6B", "#C93756", "#FCC9B9", "#FFB3A7", "#F62459", "#F58F84", "#875F9A", "#5D3F6A"],
                        ["#89729E", "#763568", "#8D608C", "#A87CA0", "#5B3256", "#BF55EC", "#8E44AD", "#9B59B6", "#BE90D4", "#4D8FAC"],
                        ["#5D8CAE", "#22A7F0", "#19B5FE", "#59ABE3", "#48929B", "#317589", "#89C4F4", "#4B77BE", "#1F4788", "#003171"],
                        ["#044F67", "#264348", "#7A942E", "#8DB255", "#5B8930", "#6B9362", "#407A52", "#006442", "#87D37C", "#26A65B"],
                        ["#26C281", "#049372", "#2ABB9B", "#16A085", "#36D7B7", "#03A678", "#4DAF7C", "#D9B611", "#F3C13A", "#F7CA18"],
                        ["#E2B13C", "#A17917", "#F5D76E", "#F4D03F", "#FFA400", "#E08A1E", "#FFB61E", "#FAA945", "#FFA631", "#FFB94E"],
                        ["#E29C45", "#F9690E", "#CA6924", "#F5AB35", "#BFBFBF", "#F2F1EF", "#BDC3C7", "#ECF0F1", "#D2D7D3", "#757D75"],
                        ["#EEEEEE", "#ABB7B7", "#6C7A89", "#95A5A6"]
                    ]
                }
            }

            window.getUpdatediFrameRoute = function(data) {
                // console.log('getUpdatediFrameRoute', data);
            };

            window.activateSettings = function() {
                // console.log('Activate Settings!');
            };

            window.updateAdminPageScope = function(page) {
                $scope.singlePost = false;
                if (page._id !== $scope.currentPage._id) {
                    $scope.currentPage = _.findWhere(that.allPages, {
                        handle: page.handle
                    });
                   
                    //get components from page
                    if ($scope.currentPage && $scope.currentPage.components) {
                        $scope.components = $scope.currentPage.components;
                    } else {
                        $scope.components = [];
                    }
                    $scope.originalCurrentPage = angular.copy($scope.currentPage);
                }
            }

            window.checkIfSinglePost = function(post) {
                if (post)
                    $scope.singlePost = true;
            }

            document.getElementById("iframe-website").onload = function() {
                ngProgress.complete();
                var iframe = document.getElementById("iframe-website");
                var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                $scope.bindEvents();
                // to do need to check when iframe content is loaded properly
                if ($scope.isEditing) {
                    if ($("#iframe-website").contents().find("body").length) {
                        setTimeout(function() {
                            $scope.editPage();
                        }, 5000)
                    }
                }

            }

            $scope.bindEvents = function() {
                var iframe = document.getElementById("iframe-website");
                if (!iframe)
                    return;
                var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

                //wait for iframe to load completely
                //TODO: get trigger instead of timeout
                var elementBindingFn = function() {
                    //unhide no-component
                    if (iframeDoc.body.querySelectorAll('.no-component')[0]) {
                        iframeDoc.body.querySelectorAll('.no-component')[0].style.display = "block";
                        iframeDoc.body.querySelectorAll('.no-component')[0].style.visibility = "visible";
                    }

                    //add media modal click events to all images
                    var images = iframeDoc.getElementById('body').querySelectorAll('img');

                    for (var i = 0; i < images.length; i++) {
                        if (typeof images[i].addEventListener != "undefined") {
                            images[i].removeEventListener("click", function(e) {}, false);
                            images[i].addEventListener("click", function(e) {
                                $("#media-manager-modal").modal('show');
                                $scope.imageChange = true;
                                $scope.componentArrTarget = e.currentTarget;
                                $scope.componentEditing = _.findWhere($scope.components, {
                                    _id: $(e.currentTarget).closest('.component').data('id')
                                });
                            });
                        } else if (typeof images.attachEvent != "undefined") {
                            images[i].removeEvent("onclick");
                            images[i].attachEvent("onclick", iframeClickHandler);
                        }
                    };

                    //add click events for all the settings buttons
                    var settingsBtns = iframeDoc.getElementById('body').querySelectorAll('.componentActions .settings');
                    for (var i = 0; i < settingsBtns.length; i++) {
                        if (typeof settingsBtns[i].addEventListener != "undefined") {
                            settingsBtns[i].removeEventListener("click", function(e) {}, false);
                            settingsBtns[i].addEventListener("click", function(e) {
                                $scope.editComponent(e.currentTarget.attributes['data-id'].value);
                                var element = angular.element('#component-setting-modal');
                                element.modal('show');
                            });
                        } else if (typeof settingsBtns.attachEvent != "undefined") {
                            settingsBtns[i].removeEvent("onclick");
                            settingsBtns[i].attachEvent("onclick", iframeClickHandler);
                        }
                    };

                    //add click events for all the add component buttons
                    var addComponentBtns = iframeDoc.querySelectorAll('.add-component');
                    for (var i = 0; i < addComponentBtns.length; i++) {
                        if (typeof addComponentBtns[i].addEventListener != "undefined") {
                            addComponentBtns[i].removeEventListener("click", function(e) {}, false);
                            addComponentBtns[i].addEventListener("click", function(e) {
                                $scope.editComponentIndex = e.currentTarget.attributes['data-index'].value;
                                var element = angular.element('#add-component-modal');
                                element.modal('show');
                                //get the current index of the component pressed
                            });
                        } else if (typeof addComponentBtns.attachEvent != "undefined") {
                            addComponentBtns[i].removeEvent("onclick");
                            addComponentBtns[i].attachEvent("onclick", iframeClickHandler);
                        }
                    };

                    //TODO get event from stop

                    iframeDoc.addEventListener("DOMSubtreeModified", function(e) {
                        setTimeout(function() {
                            $scope.$apply(function() {
                                $scope.editPage;
                            });
                        });
                    }, false);

                    iframeDoc.addEventListener("dblclick", function(e) {
                        $scope.editPage();
                    }, false);
                };


                if (iframeDoc.getElementById('body')) {
                    elementBindingFn();
                }
            };

            UserService.getAccount(function(account) {
                $scope.account = account;
                that.account = account;
                //get pages and find this page
                WebsiteService.getPages(account.website.websiteId, function(pages) {
                    //TODO should be dynamic based on the history
                    currentPage = 'index';
                    that.allPages = pages;
                    var parsed = angular.fromJson(pages);
                    var arr = [];

                    for (var x in parsed) {
                        arr.push(parsed[x]);
                    }
                    $scope.allPages = arr;

                    $scope.currentPage = _.findWhere(pages, {
                        handle: currentPage
                    });

                    if ($scope.editingPageId) {
                        $scope.currentPage = _.findWhere(pages, {
                            _id: $scope.editingPageId
                        });
                        // if ($scope.currentPage && $scope.currentPage.components) {
                        //     $scope.components = $scope.currentPage.components;
                        // } else {
                        //     $scope.components = [];
                        // }
                        // console.log('$scope.currentPage >>> ', $scope.currentPage);
                        // $scope.resfeshIframe();
                    } else {
                        $scope.currentPage = _.findWhere(pages, {
                            handle: currentPage
                        });
                    }
                    //get components from page
                    if ($scope.currentPage) {
                        if ($scope.currentPage.components) {
                            $scope.components = $scope.currentPage.components;
                            if ($location.$$search['posthandle']) {
                                $scope.updatePage("post", true);
                            }
                        }
                    } else {
                        console.error('Falied to retrieve Page');
                    }

                });

                //get website
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
                });

                //get themes
                WebsiteService.getThemes(function(themes) {
                    $scope.themes = themes;
                    $scope.currentTheme = _.findWhere($scope.themes, {
                        _id: account.website.themeId
                    });
                });
            });

            $scope.toggled = function(open) {

                //console.log('Dropdown is now: ', open);
            };

            $scope.toggleDropdown = function($event) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.status.isopen = !$scope.status.isopen;
            };

            $scope.resfeshIframe = function() {
                document.getElementById("iframe-website").setAttribute("src", document.getElementById("iframe-website").getAttribute("src"));
                $scope.components = $scope.currentPage.components;
            };

            $scope.editPage = function() {
                $scope.isEditing = true;
                $scope.activateAloha();
                var iframe = document.getElementById("iframe-website");

                if(iframe.contentWindow.triggerEditMode)
                    iframe.contentWindow.triggerEditMode();

                if (iframe.contentWindow.copyPostMode) {
                    iframe.contentWindow.copyPostMode();
                    $scope.post_data = iframe.contentWindow.getPostData();
                    $scope.single_post = true;
                }
                // var src = iframe.src;
                // iframe.setAttribute("src", src+"/?editor=true");`

                $scope.backup['website'] = angular.copy($scope['website']);
                UserService.getUserPreferences(function(preferences) {
                    preferences.lastPageHandle = $scope.pageSelected;

                    UserService.updateUserPreferences(preferences, false, function() {});
                });
            };

            $scope.cancelPage = function() {
                console.log('cancel page');
                // $scope.components = that.originalCurrentPageComponents;
                var pageId = $scope.currentPage._id;
                //$scope.deactivateAloha && $scope.deactivateAloha();
                $scope.deactivateAloha();
                WebsiteService.getPageComponents(pageId, function(components) {
                    $scope.components = components;

                    $scope.updateIframeComponents && $scope.updateIframeComponents();
                    $scope.isEditing = false;
                    $scope.componentEditing = null;
                    iFrame && iFrame.contentWindow && iFrame.contentWindow.triggerEditModeOff && iFrame.contentWindow.triggerEditModeOff();

                    window.history.back();
                });


                //TODO Only use on single post
                // iFrame && iFrame.contentWindow && iFrame.contentWindow.updatePostMode && iFrame.contentWindow.updatePostMode();

                // $scope['website'] = angular.copy($scope.backup['website']);
                // $scope.backup = {};
                // $scope.primaryFontStack = $scope.website.settings.font_family;
                // $scope.secondaryFontStack = $scope.website.settings.font_family_2;
                // iFrame && iFrame.contentWindow && iFrame.contentWindow.triggerFontUpdate && iFrame.contentWindow.triggerFontUpdate($scope.website.settings.font_family)
            };

            $scope.doubleClick = function() {
                // console.log('doubleClick');
            };

            //TODO: use scope connection
            $scope.savePage = function() {
                var iFrame = document.getElementById("iframe-website");               
                if(iFrame && iFrame.contentWindow && iFrame.contentWindow.checkOrSetPageDirty)
                {
                    iFrame.contentWindow.checkOrSetPageDirty(true);
                }
                if ($location.$$search['posthandle']) {
                    iFrame && iFrame.contentWindow && iFrame.contentWindow.savePostMode && iFrame.contentWindow.savePostMode(toaster);
                    $scope.isEditing = false;
                } else {
                    var componentJSON = $scope.currentPage.components;
                    var pageId = $scope.currentPage._id;

                    var componentIdArr = [];

                    //foreach components by class .component
                    var editedPageComponents = iFrame.contentWindow.document.getElementsByTagName("body")[0].querySelectorAll('.component');
                    for (var i = 0; i < editedPageComponents.length; i++) {
                        var componentId = editedPageComponents[i].attributes['data-id'].value;
                        componentIdArr.push(componentId);
                        var componentType = editedPageComponents[i].attributes['data-type'].value;
                        var matchingComponent = _.findWhere($scope.currentPage.components, {
                            _id: componentId
                        });

                        //get all the editable variables and replace the ones in view with variables in DB
                        var componentEditable = editedPageComponents[i].querySelectorAll('.editable');
                        if (componentEditable.length >= 1) {
                            for (var i2 = 0; i2 < componentEditable.length; i2++) {
                                var componentVar = componentEditable[i2].attributes['data-class'].value;
                                var componentVarContents = componentEditable[i2].innerHTML;

                                //if innerhtml contains a span with the class ng-binding then remove it
                                var span = componentEditable[i2].querySelectorAll('.ng-binding')[0];

                                if (span) {
                                    var spanParent = span.parentNode;
                                    var spanInner = span.innerHTML;
                                    if (spanParent.classList.contains('editable')) {
                                        componentVarContents = spanInner;
                                    } else {
                                        spanParent.innerHTML = spanInner;
                                        componentVarContents = spanParent.parentNode.innerHTML;
                                    }
                                }
                                //remove "/n"
                                componentVarContents = componentVarContents.replace(/(\r\n|\n|\r)/gm, "");

                                var setterKey, pa;
                                //if contains an array of variables
                                if (componentVar.indexOf('.item') > 0) {
                                    //get index in array
                                    var first = componentVar.split(".")[0];
                                    var second = componentEditable[i2].attributes['data-index'].value;
                                    var third = componentVar.split(".")[2];
                                    matchingComponent[first][second][third] = componentVarContents;
                                }
                                //if needs to traverse a single
                                if (componentVar.indexOf('-') > 0) {
                                    var first = componentVar.split("-")[0];
                                    var second = componentVar.split("-")[1];
                                    matchingComponent[first][second] = componentVarContents;
                                }
                                //simple
                                if (componentVar.indexOf('.item') <= 0 && componentVar.indexOf('-') <= 0) {
                                    matchingComponent[componentVar] = componentVarContents;
                                }
                            }
                        }
                        $scope.backup = {};
                    };

                    //sort the components in currentPage to match iframe

                    var newComponentOrder = [];

                    for (var i = 0; i < componentIdArr.length; i++) {
                        var matchedComponent = _.findWhere($scope.currentPage.components, {
                            _id: componentIdArr[i]
                        });
                        newComponentOrder.push(matchedComponent);
                    };


                    $scope.currentPage.components = newComponentOrder;



                    WebsiteService.updatePage($scope.currentPage.websiteId, $scope.currentPage._id, $scope.currentPage, function(data) {
                        toaster.pop('success', "Page Saved", "The " + $scope.currentPage.handle + " page was saved successfully.");
                        $scope.isEditing = true;
                        //iFrame && iFrame.contentWindow && iFrame.contentWindow.triggerEditModeOff && iFrame.contentWindow.triggerEditModeOff();
                        //iFrame.contentWindow.triggerFontUpdate($scope.website.settings.font_family);
                        //document.getElementById('iframe-website').contentWindow.location.reload(true);
                        iFrame && iFrame.contentWindow && iFrame.contentWindow.saveBlobData && iFrame.contentWindow.saveBlobData(iFrame.contentWindow);
                        //document.getElementById("iframe-website").setAttribute("src", route + '?editor=true');
                    });
                    //$scope.deactivateAloha();
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
            };

            $scope.updatePage = function(handle, editing) {
                if (!angular.isDefined(editing))
                    $scope.isEditing = false;

                $scope.pageSelected = handle || 'index';
                var route;
                var sPage = $scope.pageSelected;
                if (sPage === 'index') {
                    route = '';
                } else {
                    route = '/page/' + sPage;
                }

                if ($location.$$search['posthandle']) {
                    route = '/page/' + sPage + '/' + $location.$$search['posthandle'] + '?editor=true';
                }



                //TODO - replace with sending route through scope to update without iframe refresh
                document.getElementById("iframe-website").setAttribute("src", route + '?editor=true');
                if ($location.$$search['custid']) {
                    current_src = document.getElementById("iframe-website").getAttribute("src");
                    document.getElementById("iframe-website").setAttribute("src", current_src + '&custid=' + $location.$$search['custid']);
                }
                WebsiteService.getPages($scope.account.website.websiteId, function(pages) {
                    var currentPage = $scope.pageSelected;
                    var parsed = angular.fromJson(pages);
                    var arr = [];

                    for (var x in parsed) {
                        arr.push(parsed[x]);
                    }
                    $scope.allPages = arr;
                    that.allPages = arr;
                    $scope.currentPage = _.findWhere(that.allPages, {
                        handle: currentPage
                    });

                    var localPage = _.findWhere(pages, {
                        handle: currentPage
                    });
                    //get components from page
                    if ($scope.currentPage && $scope.currentPage.components) {
                        $scope.components = $scope.currentPage.components;
                    } else {
                        $scope.components = [];
                    }

                    that.originalCurrentPageComponents = localPage.components;
                    $scope.originalCurrentPage = angular.copy($scope.currentPage);
                });
            };
            window.deleteTeamMember = function(componentId, index) {
                $scope.componentEditing = _.findWhere($scope.components, {
                    _id: componentId
                });
                $scope.componentEditing.teamMembers.splice(index, 1);
                $scope.saveCustomComponent();
            }
            window.updateSocialNetworks = function(old_value, mode, new_value) {
                var selectedName;
                switch (mode) {
                    case "add":
                        if (new_value && new_value.name && new_value.url) {
                            $scope.componentEditing.networks.push({
                                name: new_value.name,
                                url: new_value.url,
                                icon: new_value.icon
                            });
                            $scope.saveCustomComponent();
                        }
                        break;
                    case "update":
                        if (new_value && new_value.name && new_value.url) {
                            selectedName = _.findWhere($scope.componentEditing.networks, {
                                name: old_value.name
                            });
                            selectedName.name = new_value.name;
                            selectedName.url = new_value.url;
                            selectedName.icon = new_value.icon;
                            $scope.saveCustomComponent();
                        }
                        break;
                    case "delete":
                        selectedName = _.findWhere($scope.componentEditing.networks, {
                            name: old_value.name
                        });
                        if (selectedName) {
                            var index = $scope.componentEditing.networks.indexOf(selectedName)
                            $scope.componentEditing.networks.splice(index, 1);
                            $scope.saveCustomComponent();
                        }
                        break;
                }

            }

            window.getSocialNetworks = function(componentId) {
                $scope.componentEditing = _.findWhere($scope.components, {
                    _id: componentId
                });
                return $scope.componentEditing.networks;
            }

            $scope.addTeamMember = function(team) {
                if (team && team.name) {
                    $scope.componentEditing.teamMembers.push({
                        name: team.name,
                        position: team.position,
                        bio: team.bio,
                        profilepic: team.profilepic
                    });
                    $scope.saveComponent();
                }
            }
            window.changeBlogImage = function(blog) {
                $scope.changeblobImage = true;
                $scope.blog_post = blog;
                $("#media-manager-modal").modal('show');
                $(".insert-image").removeClass("ng-hide");
            }
            window.setPostImage = function(componentId) {
                $scope.postImage = true;
                $("#media-manager-modal").modal('show');
                $(".insert-image").removeClass("ng-hide");
            }
            window.changeProfilePhoto = function(componentId, customer) {
                $scope.profilepic = true;
                $scope.customerAccount = customer;
                $("#media-manager-modal").modal('show');
                $(".insert-image").removeClass("ng-hide");
            }

            window.changeLogoImage = function(componentId) {
                $scope.logoImage = true;
                $scope.componentEditing = _.findWhere($scope.components, {
                    _id: componentId
                });
                $("#media-manager-modal").modal('show');
                $(".insert-image").removeClass("ng-hide");
            }
            window.getPostImageUrl = function() {
                return $scope.postImageUrl;
            }

            window.clickImageButton = function()
            {
                $scope.insertMediaImage = true;
                $("#media-manager-modal").modal('show');
                $(".insert-image").removeClass("ng-hide");
            }

            $scope.addFeatureList = function(feature) {
                if (feature && feature.title) {
                    if (!$scope.featureIcon) {
                        $scope.featureIcon = {};
                        $scope.featureIcon.icon = 'fa-credit-card';
                    }
                    $scope.componentEditing.features.push({
                        title: feature.title,
                        subtitle: feature.subtitle,
                        icon: 'fa ' + $scope.featureIcon.icon
                    });
                    $scope.saveComponent();
                }
            }

            window.deleteFeatureList = function(componentId, index) {
                $scope.componentEditing = _.findWhere($scope.components, {
                    _id: componentId
                });
                $scope.componentEditing.features.splice(index, 1);
                $scope.saveCustomComponent();
            }

            $scope.addComponent = function() {
                var pageId = $scope.currentPage._id;
                if ($scope.selectedComponent.type === 'footer') {
                    var footerType = _.findWhere($scope.currentPage.components, {
                        type: $scope.selectedComponent.type
                    });
                    if (footerType) {
                        toaster.pop('error', "Footer component already exists");
                        return;
                    }
                }
                if ($scope.selectedComponent.type === 'navigation') {
                    var navigationType = _.findWhere($scope.currentPage.components, {
                        type: $scope.selectedComponent.type
                    });
                    if (navigationType) {
                        toaster.pop('error', "Navbar header already exists");
                        return;
                    }
                }
                $scope.components = $scope.currentPage.components;

                var cmpVersion = null;
                if ($scope.selectedTheme) {
                    var selectedType = _.findWhere($scope.selectedTheme.config.components, {
                        type: $scope.selectedComponent.type
                    });
                    if (selectedType) {
                        cmpVersion = selectedType.version;
                    }
                }
                WebsiteService.addNewComponent(pageId, $scope.selectedComponent.title, $scope.selectedComponent.type, cmpVersion, function(data) {
                    if (data.components) {
                        var newComponent = data.components[data.components.length - 1];
                        var indexToadd = $scope.editComponentIndex ? $scope.editComponentIndex : 1
                        $scope.currentPage.components.splice(indexToadd, 0, newComponent);
                        //$scope.currentPage.components.push(newComponent);
                        //$scope.components.push(newComponent);
                        $scope.components = $scope.currentPage.components;
                        $scope.updateIframeComponents();
                        $scope.bindEvents();

                        // $scope.deactivateAloha();
                        $scope.activateAloha();
                        //$scope.scrollToIframeComponent(newComponent.anchor);
                        toaster.pop('success', "Component Added", "The " + newComponent.type + " component was added successfully.");
                    }
                });
            };

            $scope.deleteComponent = function(componentId) {
                var pageId = $scope.currentPage._id;
                var deletedType;
                WebsiteService.deleteComponent($scope.currentPage._id, componentId, function(data) {
                    //$scope.resfeshIframe();
                    for (var i = 0; i < $scope.components.length; i++) {
                        if ($scope.components[i]._id == componentId) {
                            deletedType = $scope.components[i].type;
                            $scope.components.splice(i, 1);
                            break;
                        }
                    }
                    $scope.updateIframeComponents();
                    $scope.componentEditing = null;
                    $(".modal-backdrop").remove();
                    $("#component-setting-modal").modal('hide');
                    toaster.pop('success', "Component Deleted", "The " + deletedType + " component was deleted successfully.");
                });
            };

            $scope.updateIframeComponents = function(fn) {
                //document.getElementById("iframe-website").contentWindow.updateComponents($scope.components);
                iFrame && iFrame.contentWindow && iFrame.contentWindow.updateComponents && iFrame.contentWindow.updateComponents($scope.components);
                if (fn) {
                    fn();
                }
                $scope.bindEvents();
            };

            $scope.scrollToIframeComponent = function(section) {
                //document.getElementById("iframe-website").contentWindow.scrollTo(section);
                iFrame && iFrame.contentWindow && iFrame.contentWindow.scrollTo && iFrame.contentWindow.scrollTo(section)
            };

            $scope.activateAloha = function() {
                //document.getElementById("iframe-website").contentWindow.activateAloha();
                $scope.bindEvents();
                iFrame && iFrame.contentWindow && iFrame.contentWindow.activateAloha && iFrame.contentWindow.activateAloha()
            };

            $scope.deactivateAloha = function() {
                //document.getElementById("iframe-website").contentWindow.deactivateAloha();
                iFrame && iFrame.contentWindow && iFrame.contentWindow.deactivateAloha && iFrame.contentWindow.deactivateAloha()
            };

            $scope.editComponent = function(componentId) {
                $scope.$apply(function() {
                    $scope.componentEditing = _.findWhere($scope.components, {
                        _id: componentId
                    });
                    $scope.componentEditing.icon = _.findWhere($scope.componentTypes, {
                        type: $scope.componentEditing.type
                    }).icon;
                    $scope.componentEditing.title = _.findWhere($scope.componentTypes, {
                        type: $scope.componentEditing.type
                    }).title;
                });
                $scope.bindEvents();
                //open right sidebar and component tab
                // document.body.className += ' leftpanel-collapsed rightmenu-open';
                // var nodes = document.body.querySelectorAll('.rightpanel-website .nav-tabs li a');
                // var last = nodes[nodes.length - 1];
                // angular.element(last).triggerHandler('click');

                WebsiteService.getComponentVersions($scope.componentEditing.type, function(versions) {
                    $scope.componentEditingVersions = versions;
                    if ($scope.componentEditing.version)
                        $scope.componentEditing.version = $scope.componentEditing.version.toString();
                    $scope.versionSelected = $scope.componentEditing.version;
                    $scope.originalCurrentPage = angular.copy($scope.currentPage);
                });
                $('#feature-convert').iconpicker({
                    iconset: 'fontawesome',
                    icon: 'fa-credit-card',
                    rows: 5,
                    cols: 5,
                    placement: 'right',
                });

                $('#feature-convert').on('change', function(e) {
                    if (!$scope.featureIcon) {
                        $scope.featureIcon = {};
                    }
                    if ($scope.featureIcon) {
                        $scope.featureIcon.icon = e.icon;
                    }
                });
            };

            $scope.saveComponent = function() {
                var componentId = $scope.componentEditing._id;
                var componentIndex;
                for (var i = 0; i < $scope.components.length; i++) {
                    if ($scope.components[i]._id === componentId) {
                        $scope.components[i] = $scope.componentEditing
                    }
                }
                $scope.currentPage.components = $scope.components;
                $scope.updateIframeComponents(function() {
                    $scope.bindEvents();
                });
                $scope.isEditing = true;

                //update the scope as the temppage until save

                // var pageId = $scope.currentPage._id;
                // WebsiteService.updateComponent(pageId, $scope.componentEditing._id, $scope.componentEditing, function(data) {
                //     toaster.pop('success', "Component Saved", "The component was saved successfully.");
                //     $scope.updateIframeComponents();
                // });
            };


            $scope.saveCustomComponent = function() {
                var componentId = $scope.componentEditing._id;
                var componentIndex;
                for (var i = 0; i < $scope.components.length; i++) {
                    if ($scope.components[i]._id === componentId) {
                        $scope.components[i] = $scope.componentEditing
                    }
                }
                $scope.currentPage.components = $scope.components;
                iFrame && iFrame.contentWindow && iFrame.contentWindow.updateCustomComponent && iFrame.contentWindow.updateCustomComponent($scope.components, $scope.componentEditing.networks);

            };


            $scope.deletePage = function() {

                var pageId = $scope.currentPage._id;
                var websiteId = $scope.currentPage.websiteId;
                var title = $scope.currentPage.title;

                WebsiteService.deletePage(pageId, websiteId, title, function(data) {
                    toaster.pop('success', "Page Deleted", "The " + title + " page was deleted successfully.");
                    $scope.updatePage("index");
                });
            };

            $scope.deletePost = function(post_data) {
              iFrame && iFrame.contentWindow.deletePost && iFrame.contentWindow.deletePost(post_data, toaster);
            };

            $scope.showMobile = function() {
                $scope.isMobile = true;
            };

            $scope.updatePrimaryFont = function(font) {

                if ($scope.website.settings.font_family !== font.name) {
                    $scope.website.settings.font_family = font.name;
                    iFrame.contentWindow.triggerFontUpdate($scope.website.settings.font_family);
                    //document.getElementById("iframe-website").contentWindow.updateWebsite($scope.website);
                }
            };

            CourseService.getAllCourses(function(data) {
                $scope.courses = data;
            });

            //an array of component types and icons for the add component modal
            $scope.componentTypes = [{
                title: 'Blog',
                type: 'blog',
                icon: 'custom blog',
                enabled: false
            }, {
                title: 'Masthead',
                type: 'masthead',
                icon: 'custom masthead',
                enabled: true
            }, {
                title: 'Feature List',
                type: 'feature-list',
                icon: 'fa fa-list-ul',
                enabled: true
            }, {
                title: 'Campaign',
                type: 'campaign',
                icon: 'fa fa-bullhorn',
                enabled: true
            }, {
                title: 'Contact Us',
                type: 'contact-us',
                icon: 'fa fa-map-marker',
                enabled: false
            }, {
                title: 'Coming Soon',
                type: 'coming-soon',
                icon: 'fa fa-clock-o',
                enabled: true
            }, {
                title: 'Feature block',
                type: 'feature-block',
                icon: 'custom feature-block',
                enabled: true
            }, {
                title: 'Footer',
                type: 'footer',
                icon: 'custom footer',
                enabled: true
            }, {
                title: 'Image Gallery',
                type: 'image-gallery',
                icon: 'fa fa-image',
                enabled: true
            }, {
                title: 'Image Slider',
                type: 'image-slider',
                icon: 'custom image-slider',
                enabled: false
            }, {
                title: 'Image Text',
                type: 'image-text',
                icon: 'custom image-text',
                enabled: true
            }, {
                title: 'Logo List',
                type: 'logo-list',
                icon: 'custom logo-list',
                enabled: false
            }, {
                title: 'Meet Team',
                type: 'meet-team',
                icon: 'fa fa-users',
                enabled: true
            }, {
                title: 'Navigation',
                type: 'navigation',
                icon: 'fa fa-location-arrow',
                enabled: true
            }, {
                title: 'Products',
                type: 'products',
                icon: 'fa fa-money',
                enabled: false
            }, {
                title: 'Simple form',
                type: 'simple-form',
                icon: 'custom simple-form',
                enabled: true
            }, {
                title: 'Single Post',
                type: 'single-post',
                icon: 'custom single-post',
                enabled: false
            }, {
                title: 'Social Links',
                type: 'social',
                icon: 'custom social-links',
                enabled: false
            }, {
                title: 'Video',
                type: 'video',
                icon: 'fa fa-video',
                enabled: true
            }, {
                title: 'Social Links',
                type: 'social-link',
                icon: 'custom social-links',
                enabled: true
            }, {
                title: 'Text Only',
                type: 'text-only',
                icon: 'fa fa-file-text',
                enabled: true
            }, {
                title: 'Thumbnail Slider',
                type: 'text-only',
                icon: 'fa fa-like',
                enabled: true
            }, {
                title: 'Customer Account',
                type: 'customer-account',
                icon: 'fa fa-user',
                enabled: true
            }];

            $scope.selectComponent = function(type) {
                if (type.enabled) {
                    $scope.selectedComponent = type;
                }
            };

            $scope.insertMedia = function(asset) {
                if ($scope.componentEditing && $scope.componentEditing.type == "meet-team") {
                    if (!$scope.team) {
                        $scope.team = {}
                    }
                    $scope.team.profilepic = asset.url;
                    return;
                }
                if ($scope.imageChange) {
                    $scope.imageChange = false;
                    var type = $scope.componentEditing.type;
                    //if image/text component
                    if (type == 'image-text') {
                        $scope.componentEditing.imgurl = asset.url;
                    } else if (type == 'feature-list') {
                        var targetIndex = $($scope.componentArrTarget).closest('.single-feature').data('index');
                        $scope.componentEditing.features[targetIndex].imgurl = asset.url;
                    } else if (type == 'simple-form') {
                        $scope.componentEditing.imgurl = asset.url;
                    } else {
                        console.log('unknown component or image location');
                    }
                    $scope.bindEvents();
                } else if ($scope.postImage && !$scope.componentEditing) {
                    $scope.postImage = false;
                    $scope.postImageUrl = asset.url;
                    toaster.pop('success', "Post Image added successfully");
                    return;
                } else if ($scope.profilepic && !$scope.componentEditing) {
                    $scope.profilepic = false;
                    $scope.customerAccount.photo = asset.url;
                    return;
                } else if ($scope.insertMediaImage) {
                    $scope.insertMediaImage = false; 
                    var iFrame = document.getElementById("iframe-website");
                    iFrame && iFrame.contentWindow && iFrame.contentWindow.addCKEditorImage && iFrame.contentWindow.addCKEditorImage(asset.url);
                    return;
                 } else if ($scope.logoImage && $scope.componentEditing) {
                    $scope.logoImage = false;
                    $scope.componentEditing.logourl = asset.url;
                } else if ($scope.changeblobImage && !$scope.componentEditing) {
                    $scope.changeblobImage = false;
                    $scope.blog_post.featured_image = asset.url;
                    var iFrame = document.getElementById("iframe-website");
                    iFrame && iFrame.contentWindow && iFrame.contentWindow.updateCustomComponent && iFrame.contentWindow.updateCustomComponent();
                    return;
                } else {
                    $scope.componentEditing.bg.img.url = asset.url;
                }
                $scope.updateIframeComponents();
            };

            $scope.checkIfSubdomainExists = function() {
                var parent_div = $('div.form-group.subdomain');
                UserService.checkDuplicateSubdomain($scope.account.subdomain, $scope.account._id, function(result) {
                    if (result === "true") {
                        parent_div.addClass('has-error');
                        parent_div.find('span.error').remove();
                        parent_div.append("<span class='error help-block'>Domain already exists</span>");
                    } else {
                        UserService.putAccount($scope.account, function(account) {
                            parent_div.removeClass('has-error');
                            parent_div.find('span.error').remove();
                        });
                    }
                });
            }

           var offFn = $rootScope.$on('$locationChangeStart', function(event, newUrl, oldUrl) {
                event.preventDefault();
                console.log('newURl ', newUrl);
                console.log('oldUrl ', oldUrl);
                var isDirty = false;
                var iFrame = document.getElementById("iframe-website");
                if(iFrame && iFrame.contentWindow && iFrame.contentWindow.checkOrSetPageDirty)
                {
                    var isDirty = iFrame.contentWindow.checkOrSetPageDirty();
                }

                if (!$scope.backup['website']) {

                } else if ((isDirty || !(angular.equals($scope.originalCurrentPage,$scope.currentPage)))) {

                    SweetAlert.swal({
                       title: "Are you sure?",
                       text: "Do you want to save your changes?",
                       type: "warning",
                       showCancelButton: true,
                       confirmButtonColor: "#DD6B55",
                       confirmButtonText: "Yes, save changes!",
                       cancelButtonText: "No, do not save changes!",
                       closeOnConfirm: false,
                       closeOnCancel: false }, 
                    function(isConfirm){ 
                        offFn()
                       if (isConfirm) {
                          SweetAlert.swal("Saved!", "Your edits were saved to the page.", "success");
                          $location.path(newUrl);
                       } else {
                          SweetAlert.swal("Cancelled", "Your edits were NOT saved.", "error");
                          $location.path(newUrl);
                       }
                    });

                }
            });

            $scope.updateLinkList = function(linkLists) {
                var linkLabelsArr = [];
                var editedLinksLists = document.getElementById("reorderNavBarContainer").querySelectorAll('.head-menu-links');
                for (var i = 0; i < editedLinksLists.length; i++) {
                    var linkLabel = editedLinksLists[i].attributes['data-label'].value;
                    if (linkLabel)
                        linkLabelsArr.push(linkLabel);
                }
                if (linkLabelsArr.length) {
                    $scope.website.linkLists.forEach(function(value, index) {
                        if (value.handle === "head-menu") {
                            var newLinkListOrder = [];
                            for (var i = 0; i < editedLinksLists.length; i++) {
                                var matchedLinkList = _.findWhere(value.links, {
                                    label: linkLabelsArr[i]
                                });
                                newLinkListOrder.push(matchedLinkList);
                            };
                            if (newLinkListOrder.length) {
                                $scope.website.linkLists[index].links = newLinkListOrder;
                                WebsiteService.updateLinkList($scope.website.linkLists[index], $scope.website._id, 'head-menu', function(data) {
                                    toaster.pop('success', "Navigation updated successfully.");
                                });
                            }

                        }
                    });
                }

            }
        }
    ]);
});
