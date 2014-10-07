define(['app', 'websiteService', 'jqueryUI', 'angularUI', 'userService', 'ngAnimate', 'toaster', 'colorpicker', 'angularBootstrapSwitch', 'ngProgress', 'unsafeHtml','mediaDirective'], function(app) {
    app.register.controller('WebsiteCtrl', ['$scope', '$window', '$timeout', 'WebsiteService', 'UserService', 'toaster', 'ngProgress',
        function($scope, $window, $timeout, WebsiteService, UserService, toaster, ngProgress) {
            ngProgress.start();
            var user, account, components, currentPageContents, previousComponentOrder, allPages, originalCurrentPageComponents = that = this;
            var iFrame = document.getElementById("iframe-website");
            var iframe_contents = iFrame.contentWindow.document.body.innerHTML;

            $scope.iframeData = {};

            $scope.allPages = [];

            $scope.spectrum = {
                options: {
                    showPalette: true,
                    clickoutFiresChange: true,
                    showInitial: true,
                    showInput: true,
                    showButtons: false,
                    hideAfterPaletteSelect: true,
                    showPaletteOnly: true,
                    togglePaletteOnly: true,
                    togglePaletteMoreText: 'more',
                    togglePaletteLessText: 'less',
                    palette: [
                        ["#000", "#444", "#666", "#999", "#ccc", "#eee", "#f3f3f3", "#fff"],
                        ["#f00", "#f90", "#ff0", "#0f0", "#0ff", "#00f", "#90f", "#f0f"],
                        ["#f4cccc", "#fce5cd", "#fff2cc", "#d9ead3", "#d0e0e3", "#cfe2f3", "#d9d2e9", "#ead1dc"],
                        ["#ea9999", "#f9cb9c", "#ffe599", "#b6d7a8", "#a2c4c9", "#9fc5e8", "#b4a7d6", "#d5a6bd"],
                        ["#e06666", "#f6b26b", "#ffd966", "#93c47d", "#76a5af", "#6fa8dc", "#8e7cc3", "#c27ba0"],
                        ["#c00", "#e69138", "#f1c232", "#6aa84f", "#45818e", "#3d85c6", "#674ea7", "#a64d79"],
                        ["#900", "#b45f06", "#bf9000", "#38761d", "#134f5c", "#0b5394", "#351c75", "#741b47"],
                        ["#600", "#783f04", "#7f6000", "#274e13", "#0c343d", "#073763", "#20124d", "#4c1130"]
                    ]
                }
            };

            //get user
            UserService.getUser(function(user) {
                $scope.user = user;
                that.user = user;
            });


            window.getUpdatediFrameRoute = function(data) {
                console.log('getUpdatediFrameRoute', data);
            };

            window.activateSettings = function() {
                console.log('Activate Settings!');
            };

            /*
             * On iFrame Loads
             */

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

                    console.log('style >>>', iframeDoc.body.querySelectorAll('.no-component'));

                    iframeDoc.body.querySelectorAll('.no-component')[0].style.display="block";
                    iframeDoc.body.querySelectorAll('.no-component')[0].style.visibility="visible";

                    //add click events for all the settings buttons
                    var settingsBtns = iframeDoc.querySelectorAll('.componentActions .settings');
                    console.log('settingsBtns >>> ', settingsBtns.length);
                    for (var i = 0; i < settingsBtns.length; i++) {
                        if (typeof settingsBtns[i].addEventListener != "undefined") {
                            settingsBtns[i].addEventListener("click", function(e) {
                                $scope.editComponent(e.currentTarget.attributes['data-id'].value);
                            });
                        } else if (typeof settingsBtns.attachEvent != "undefined") {
                            settingsBtns[i].attachEvent("onclick", iframeClickHandler);
                        }
                    };

                    //add click events for all the add component buttons
                    var addComponentBtns = iframeDoc.querySelectorAll('.add-component');
                    console.log('addComponentBtns >>> ', addComponentBtns.length);
                    for (var i = 0; i < addComponentBtns.length; i++) {
                        if (typeof addComponentBtns[i].addEventListener != "undefined") {
                            addComponentBtns[i].addEventListener("click", function(e) {
                                var element = angular.element('#add-component-modal');
                                element.modal('show');
                            });
                        } else if (typeof addComponentBtns.attachEvent != "undefined") {
                            addComponentBtns[i].attachEvent("onclick", iframeClickHandler);
                        }
                    };

                    //TODO get event from stop

                    iframeDoc.addEventListener("DOMSubtreeModified", function(e) {
                        console.log('dom changed');
                        setTimeout(function(){
                            $scope.$apply(function() {
                                $scope.editPage;
                            });
                        });
                    }, false);

                    iframeDoc.addEventListener("dblclick", function(e) {
                        console.log('double click');
                        $scope.editPage();
                    }, false);

                }, 500);
            };

            /*
             * Get Account, Pages, & Components from services
             */

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
                    $scope.primaryColor = $scope.website.settings.primary_color;
                    $scope.secondaryColor = $scope.website.settings.secondary_color;
                    $scope.primaryHighlight = $scope.website.settings.primary_highlight;
                    $scope.primaryTextColor = $scope.website.settings.primary_text_color;
                    $scope.primaryFontFamily = $scope.website.settings.font_family;
                    $scope.secondaryFontFamily = $scope.website.settings.font_family_2;
                });

            });

            /*
             * Components Array
             */

            $scope.components = [];

            /*
             * Set Initial isEditing
             */

            $scope.isEditing = false;

            /*
             * Set isMobile
             */

            $scope.isMobile = false;

            /*
             * Sort the Components
             */

            $scope.components.sort(function(a, b) {
                return a.i > b.i;
            });

            /*
             * Open Status
             */

            $scope.status = {
                isopen: false
            };

            $scope.toggled = function(open) {
                console.log('Dropdown is now: ', open);
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
                console.log('activate aloha');
                $scope.activateAloha();
                var iframe = document.getElementById("iframe-website");
                iframe.contentWindow.triggerEditMode();
                // var src = iframe.src;
                // iframe.setAttribute("src", src+"/?editor=true");
            };

            $scope.cancelPage = function() {
                // $scope.components = that.originalCurrentPageComponents;
                $scope.updateIframeComponents();
                $scope.deactivateAloha();
                $scope.isEditing = false;
                iFrame.contentWindow.triggerEditModeOff();
            };

            $scope.doubleClick = function() {
                console.log('doubleClick');
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
                    var componentType = editedPageComponents[i].attributes['data-class'].value;
                    var matchingComponent = _.findWhere($scope.currentPage.components, {
                        _id: componentId
                    });

                    //get all the editable variables and replace the ones in view with variables in DB
                    var componentEditable = editedPageComponents[i].querySelectorAll('.editable');

                    if (componentEditable.length > 1) {
                        for (var i2 = 0; i2 < componentEditable.length; i2++) {
                            var componentVar = componentEditable[i2].attributes['data-class'].value;
                            var componentVarContents = componentEditable[i2].innerHTML;
                            // console.log('componentVarContents before >>> ', componentVarContents);
                            // if (componentEditable[i2].querySelectorAll('.ng-binding').length >= 1) {
                            //     var span = componentEditable[i2].querySelectorAll('.ng-binding')[0]; // get the span
                            //     componentVarContents = span.innerHTML.replace(/(\r\n|\n|\r)/gm, "");
                            // }
                            // console.log('componentVarContents after >>> ', componentVarContents);

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

                console.log('componentIdArr >>> ', componentIdArr);
                //sort the components in currentPage to match iframe

                var newComponentOrder = [];

                for (var i = 0; i < componentIdArr.length; i++) {
                    var matchedComponent = _.findWhere($scope.currentPage.components, {
                        _id: componentIdArr[i]
                    });
                    newComponentOrder.push(matchedComponent);
                };

                 console.log('newComponentOrder >>> ', newComponentOrder);



                WebsiteService.updatePage($scope.currentPage.websiteId, $scope.currentPage._id,  $scope.currentPage, function(data) {
                    toaster.pop('success', "Page Saved", "The " + $scope.currentPage.handle + " page was saved successfully.");
                    $scope.isEditing = false;
                    $scope.deactivateAloha();
                    iFrame.contentWindow.triggerEditModeOff();
                });

                //website service - save page data
            };

            $scope.updatePage = function(handle) {
                $scope.isEditing = false;
                console
                    .log(handle);
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
                    console.log('Current Page Selected >>> ', currentPage);
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

            $scope.addComponent = function(component) {
                var pageId = $scope.currentPage._id;
                WebsiteService.addNewComponent(pageId, component.title, component.type, function(data) {
                    console.log('data >>> ', data);
                    if (data.components) {
                        var newComponent = data.components[data.components.length - 1];
                        $scope.components.push(newComponent);
                        $scope.updateIframeComponents();
                        $scope.bindEvents();
                        console.log('newComponent >>> ', newComponent);
                        $scope.deactivateAloha();
                        $scope.activateAloha();
                        //$scope.scrollToIframeComponent(newComponent.anchor);
                        toaster.pop('success', "Component Added", "The " + newComponent.type + " component was added successfully.");
                    }
                });
            };

            $scope.deleteComponent = function(componentId) {
                console.log('deleteComponent >>> ', componentId);
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
                    toaster.pop('success', "Component Deleted", "The " + deletedType + " component was deleted successfully.");
                });
            };

            $scope.updateIframeComponents = function() {
                document.getElementById("iframe-website").contentWindow.updateComponents($scope.components);
            };

            $scope.scrollToIframeComponent = function(section) {
                console.log('scrollToIframeComponent ', section);
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
                });
                //open right sidebar and component tab
                document.body.className += ' leftpanel-collapsed rightmenu-open';
                var nodes = document.body.querySelectorAll('.rightpanel-website .nav-tabs li a');
                var last = nodes[nodes.length - 1];
                console.log('last', last);
                angular.element(last).triggerHandler('click');
            };

            $scope.saveComponent = function() {
                var componentId = $scope.componentEditing._id;
                var componentIndex;
                for (var i = 0; i < $scope.components.length; i++) {
                    console.log($scope.components[i]._id);
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

            $scope.createPage = function(page) {
                console.log('create page', page);

                var websiteId = $scope.currentPage.websiteId;

                var pageData = {
                    title: page.title,
                    handle: page.handle,
                    mainmenu: page.mainmenu
                };

                WebsiteService.createPage(websiteId, pageData, function(newpage) {
                    console.log('$scope.allPages >>> ', $scope.allPages);
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
            };

            $scope.deletePage = function() {

                var pageId = $scope.currentPage._id;
                var websiteId = $scope.currentPage.websiteId;
                var title = $scope.currentPage.title;

                WebsiteService.deletePage(pageId, websiteId, title, function(data) {
                    console.log('Data >>> ', data);
                    toaster.pop('success', "Page Deleted", "The " + title + " page was deleted successfully.");
                    document.getElementById("iframe-website").setAttribute("src", "/");
                });
            };

            $scope.showMobile = function() {
                console.log('show mobile');
                $scope.isMobile = true;
            };

            $scope.updateThemeSettings = function() {
                console.log('update theme', $scope.website.settings);
                var data = {
                    _id: $scope.website._id,
                    accountId: $scope.website.accountId,
                    settings: $scope.website.settings
                };

                WebsiteService.updateWebsite(data, function(data) {
                    console.log('updated website settings');
                });
            };

        }
    ]);
});
