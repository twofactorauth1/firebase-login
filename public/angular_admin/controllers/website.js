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
    'confirmClickDirective'
], function(app) {
    app.register.controller('WebsiteCtrl', [
        '$scope',
        '$window',
        '$timeout',
        'WebsiteService',
        'UserService',
        'toaster',
        'ngProgress',
        function($scope, $window, $timeout, WebsiteService, UserService, toaster, ngProgress) {
            ngProgress.start();

            var user, account, components, currentPageContents, previousComponentOrder, allPages, originalCurrentPageComponents = that = this;
            var iFrame = document.getElementById("iframe-website");
            var iframe_contents = iFrame.contentWindow.document.body.innerHTML;

            $scope.primaryFontStack = '';
            $scope.secondaryFontStack = '';
            $scope.iframeData = {};
            $scope.allPages = [];

            $scope.components = [];

            $scope.isEditing = false;

            $scope.isMobile = false;

            $scope.components.sort(function(a, b) {
                return a.i > b.i;
            });

            $scope.status = {
                isopen: false
            };

            $scope.spectrum = {
                options: {
                    showPalette: true,
                    clickoutFiresChange: true,
                    showInitial: true,
                    showInput: true,
                    showButtons: false,
                    allowEmpty:true,
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
            };

            //get user
            UserService.getUser(function(user) {
                $scope.user = user;
                that.user = user;
            });

            window.getUpdatediFrameRoute = function(data) {
                // console.log('getUpdatediFrameRoute', data);
            };

            window.activateSettings = function() {
                // console.log('Activate Settings!');
            };

            document.getElementById("iframe-website").onload = function() {
                ngProgress.complete();
                var iframe = document.getElementById("iframe-website");
                var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                $scope.bindEvents();
            }

            $scope.bindEvents = function() {
                var iframe = document.getElementById("iframe-website");
                var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

                //wait for iframe to load completely
                $timeout(function() {
                    //unhide no-component


                    if(iframeDoc.body.querySelectorAll('.no-component')[0]) {
                        iframeDoc.body.querySelectorAll('.no-component')[0].style.display="block";
                        iframeDoc.body.querySelectorAll('.no-component')[0].style.visibility="visible";
                    }

                    //add click events for all the settings buttons
                    var settingsBtns = iframeDoc.getElementById('body').querySelectorAll('.componentActions .settings');
                    for (var i = 0; i < settingsBtns.length; i++) {
                        if (typeof settingsBtns[i].addEventListener != "undefined") {
                            settingsBtns[i].addEventListener("click", function(e) {
                                console.log('e.currentTarget.attributes >>> ', e.currentTarget.attributes);
                                $scope.editComponent(e.currentTarget.attributes['data-id'].value);
                            });
                        } else if (typeof settingsBtns.attachEvent != "undefined") {
                            settingsBtns[i].attachEvent("onclick", iframeClickHandler);
                        }
                    };

                    //add click events for all the add component buttons
                    var addComponentBtns = iframeDoc.querySelectorAll('.add-component');
                    for (var i = 0; i < addComponentBtns.length; i++) {
                        if (typeof addComponentBtns[i].addEventListener != "undefined") {
				addComponentBtns[i].addEventListener("click", function(e) {
				$scope.editComponentIndex = e.currentTarget.attributes['data-index'].value;
				var element = angular.element('#add-component-modal');
                                element.modal('show');
                                //get the current index of the component pressed
                            });
                        } else if (typeof addComponentBtns.attachEvent != "undefined") {
                            addComponentBtns[i].attachEvent("onclick", iframeClickHandler);
                        }
                    };

                    //TODO get event from stop

                    iframeDoc.addEventListener("DOMSubtreeModified", function(e) {
                        setTimeout(function(){
                            $scope.$apply(function() {
                                $scope.editPage;
                            });
                        });
                    }, false);

                    iframeDoc.addEventListener("dblclick", function(e) {
                        $scope.editPage();
                    }, false);

                }, 5000);
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
                    //get components from page
                    if ($scope.currentPage) {
                        if ($scope.currentPage.components) {
                            $scope.components = $scope.currentPage.components;
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
                        name: account.website.themeId
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
                iframe.contentWindow.triggerEditMode();

                if ( iframe.contentWindow.copyPostMode ) {
                    iframe.contentWindow.copyPostMode();
                }
                // var src = iframe.src;
                // iframe.setAttribute("src", src+"/?editor=true");
            };

            $scope.cancelPage = function() {
                // $scope.components = that.originalCurrentPageComponents;
                var pageId = $scope.currentPage._id;
                WebsiteService.getPageComponents(pageId,function(components) {
                    $scope.components = components;
                    $scope.updateIframeComponents();
                //$scope.deactivateAloha();
                $scope.isEditing = false;
                $scope.componentEditing = null;
                iFrame.contentWindow.triggerEditModeOff();
                });
                

                //TODO Only use on single post
                if ( iFrame.contentWindow.updatePostMode ) {
                    iFrame.contentWindow.updatePostMode();
                }
            };

            $scope.doubleClick = function() {
                // console.log('doubleClick');
            };

            //TODO: use scope connection
            $scope.savePage = function() {

                var componentJSON = $scope.currentPage.components;
                var pageId = $scope.currentPage._id;
                var iFrame = document.getElementById("iframe-website");
                var iframe_contents = iFrame.contentWindow.document.body.innerHTML;
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

                    if (componentEditable.length > 1) {
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



                WebsiteService.updatePage($scope.currentPage.websiteId, $scope.currentPage._id,  $scope.currentPage, function(data) {
                    toaster.pop('success', "Page Saved", "The " + $scope.currentPage.handle + " page was saved successfully.");
                    $scope.isEditing = false;
                    $scope.deactivateAloha();
                    iFrame.contentWindow.triggerEditModeOff();
                    if ( iFrame.contentWindow.savePostMode ) {
                        iFrame.contentWindow.savePostMode();
                    }
                });

                var data = {
                    _id: $scope.website._id,
                    accountId: $scope.website.accountId,
                    settings: $scope.website.settings
                };

                WebsiteService.updateWebsite(data, function(data) {
                    // console.log('updated website settings', data);
                });

                //website service - save page data
            };

            $scope.updatePage = function(handle) {
                $scope.isEditing = false;

                $scope.pageSelected = handle || 'index';

                var route;
                var sPage = $scope.pageSelected;
                if (sPage === 'index') {
                    route = '';
                }
                if (sPage === 'single-post') {
                    route = '';
                }
                if (sPage === 'blog') {
                    route = "/" + sPage;
                } else {
                    route = '/page/' + sPage;
                }


                //TODO - replace with sending route through scope to update without iframe refresh
                document.getElementById("iframe-website").setAttribute("src", route + '?editor=true');

                WebsiteService.getPages(that.account.website.websiteId, function(pages) {
                    var currentPage = $scope.pageSelected;
                    var parsed = angular.fromJson(pages);
                    var arr = [];

                    for (var x in parsed) {
                        arr.push(parsed[x]);
                    }
                    $scope.allPages = arr;
                    that.allPages = arr;
                    $scope.currentPage = _.findWhere(pages, {
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
                });
            };

            $scope.addComponent = function() {
                var pageId = $scope.currentPage._id;
                WebsiteService.addNewComponent(pageId, $scope.selectedComponent.title, $scope.selectedComponent.type, function(data) {
                    if (data.components) {
                        var newComponent = data.components[data.components.length - 1];
                        var indexToadd = $scope.editComponentIndex ? $scope.editComponentIndex : 1
                        $scope.currentPage.components.splice(indexToadd, 0, newComponent);
                        //$scope.currentPage.components.push(newComponent);
                        //$scope.components.push(newComponent);
                        $scope.updateIframeComponents();
                        $scope.bindEvents();

                        $scope.deactivateAloha();
                        $scope.activateAloha();
                        //$scope.scrollToIframeComponent(newComponent.anchor);
                        toaster.pop('success', "Component Added", "The " + newComponent.type + " component was added successfully.");
                    }
                });
            };

            $scope.deleteComponent = function(componentId) {
                console.log('deleting component');
                var pageId = $scope.currentPage._id;
                var deletedType;
                WebsiteService.deleteComponent($scope.currentPage._id, componentId, function(data) {
                    // $scope.resfeshIframe();
                    for (var i = 0; i < $scope.components.length; i++) {
                        if ($scope.components[i]._id == componentId) {
                            deletedType = $scope.components[i].type;
                            $scope.components.splice(i, 1);
                            break;
                        }
                    }
                    $scope.updateIframeComponents();
                    $scope.componentEditing = null;
                    toaster.pop('success', "Component Deleted", "The " + deletedType + " component was deleted successfully.");
                });
            };

            $scope.updateIframeComponents = function() {
                document.getElementById("iframe-website").contentWindow.updateComponents($scope.components);
            };

            $scope.scrollToIframeComponent = function(section) {
                document.getElementById("iframe-website").contentWindow.scrollTo(section);
            };

            $scope.activateAloha = function() {               
                document.getElementById("iframe-website").contentWindow.activateAloha();
            };

            $scope.deactivateAloha = function() {
                document.getElementById("iframe-website").contentWindow.deactivateAloha();
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
                document.body.className += ' leftpanel-collapsed rightmenu-open';
                var nodes = document.body.querySelectorAll('.rightpanel-website .nav-tabs li a');
                var last = nodes[nodes.length - 1];
                angular.element(last).triggerHandler('click');
            };

            $scope.saveComponent = function() {
                var componentId = $scope.componentEditing._id;
                var componentIndex;
                for (var i = 0; i < $scope.components.length; i++) {
                    if ($scope.components[i]._id === componentId) {
                        $scope.components[i] = $scope.componentEditing
                    }
                }

                $scope.updateIframeComponents();
                $scope.isEditing = true;

                //update the scope as the temppage until save

                // var pageId = $scope.currentPage._id;
                // WebsiteService.updateComponent(pageId, $scope.componentEditing._id, $scope.componentEditing, function(data) {
                //     toaster.pop('success', "Component Saved", "The component was saved successfully.");
                //     $scope.updateIframeComponents();
                // });
            };

            $scope.createPage = function(page, $event) {

                var websiteId = $scope.currentPage.websiteId;

                var pageData = {
                    title: page.title,
                    handle: page.handle,
                    mainmenu: page.mainmenu
                };

                var hasHandle = false;
                $scope.allPages.forEach(function (v, i) {
                    if ( page.handle === v.handle ) {
                        hasHandle = true;
                    }
                });

                if (!hasHandle) {
                    WebsiteService.createPage(websiteId, pageData, function (newpage) {
                        toaster.pop('success', "Page Created", "The " + newpage.title + " page was created successfully.");
                        $scope.page = null;
                        $scope.allPages.push(newpage);
                        document.getElementById("iframe-website").setAttribute("src", "/page/" + newpage.handle);
                        $scope.currentPage = newpage;
                        $scope.pageSelected = newpage.handle;
                        //get components from page
                        if ($scope.currentPage && $scope.currentPage.components) {
                            $scope.components = $scope.currentPage.components;
                        } else {
                            $scope.components = [];
                        }
                    });
                } else {
                    toaster.pop('error', "Page URL " + page.handle, "Already exists");
                    $event.preventDefault();
                    $event.stopPropagation();
                }
            };

            $scope.deletePage = function() {

                var pageId = $scope.currentPage._id;
                var websiteId = $scope.currentPage.websiteId;
                var title = $scope.currentPage.title;

                WebsiteService.deletePage(pageId, websiteId, title, function(data) {
                    toaster.pop('success', "Page Deleted", "The " + title + " page was deleted successfully.");
                    document.getElementById("iframe-website").setAttribute("src", "/");
                });
            };

            $scope.showMobile = function() {
                $scope.isMobile = true;
            };

            $scope.updatePrimaryFont = function(font) {
                $scope.website.settings.font_family = font.name;
                //document.getElementById("iframe-website").contentWindow.updateWebsite($scope.website);
            };

            $scope.changeSelectedTheme = function(theme) {
                $scope.selectedTheme = theme;
            };

            $scope.changeTheme = function() {

                $scope.currentTheme = $scope.selectedTheme;

                $scope.website.settings = $scope.selectedTheme.config.settings;

                //change all components to the themes versions
                var theme = $scope.selectedTheme.config.components;
                for (var i = 0; i < $scope.currentPage.components.length; i++) {
                    var matching = _.findWhere(theme, {
                        type: $scope.currentPage.components[i].type
                    });
                    var current = $scope.currentPage.components[i];
                    if (matching) {
                        current.version = matching.version;
                        if (current.bg.img.url == '') {
                            current.bg.color = matching.bg.color;
                            current.txtcolor = matching.txtcolor;
                        }
                    }
                };
                $scope.components = $scope.currentPage.components;
                $scope.updateIframeComponents();
                $scope.updateThemeSettings();
            };

            //an array of component types and icons for the add component modal
            $scope.componentTypes = [
                {
                    title: 'Blog',
                    type: 'blog',
                    icon: 'custom blog'
                },
                {
                    title: 'Masthead',
                    type: 'masthead',
                    icon: 'custom masthead'
                },
                {
                    title: 'Feature List',
                    type: 'feature-list',
                    icon: 'fa fa-list-ul'
                },
                {
                    title: 'Contact Us',
                    type: 'contact-us',
                    icon: 'fa fa-map-marker'
                },
                {
                    title: 'Coming Soon',
                    type: 'coming-soon',
                    icon: 'fa fa-clock-o'
                },
                {
                    title: 'Feature block',
                    type: 'feature-block',
                    icon: 'custom feature-block'
                },
                {
                    title: 'Footer',
                    type: 'footer',
                    icon: 'custom footer'
                },
                {
                    title: 'Image Gallery',
                    type: 'image-gallery',
                    icon: 'fa fa-image'
                },
                {
                    title: 'Image Slider',
                    type: 'image-slider' ,
                    icon: 'custom image-slider'
                },
                {
                    title: 'Image Text',
                    type: 'image-text',
                    icon: 'custom image-text'
                },
                {
                    title: 'Logo List',
                    type: 'logo-list',
                    icon: 'custom logo-list'
                },
                {
                    title: 'Meet Team',
                    type: 'meet-team',
                    icon: 'fa fa-users'
                },
                {
                    title: 'Navigation',
                    type: 'navigation',
                    icon: 'fa fa-location-arrow'
                },
                {
                    title: 'Sign Up form',
                    type: 'signup-form',
                    icon: 'custom sign-up-form'
                },
                {
                    title: 'Single Post',
                    type: 'single-post',
                    icon: 'custom single-post'
                },
                {
                    title: 'Social Links',
                    type: 'social-feed',
                    icon: 'custom social-links'
                }
            ];

            $scope.selectComponent = function(type) {
                console.log('selectComponent', type);
                $scope.selectedComponent = type;
            };

            $scope.insertMedia=function(asset){
                $scope.componentEditing.bg.img.url=asset.url;
                $scope.updateIframeComponents();
            };

        }
    ]);
});
