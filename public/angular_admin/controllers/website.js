define(['app', 'websiteService', 'jqueryUI', 'angularUI', 'angularSortable', 'userService', 'ngAnimate', 'toaster', 'confirmClickDirective', 'colorpicker', 'angularBootstrapSwitch'], function(app) {
    app.register.controller('WebsiteCtrl', ['$scope', '$window', '$timeout', 'WebsiteService', 'UserService', 'toaster',  function ($scope, $window, $timeout, WebsiteService, UserService, toaster) {
        var user, account, components, currentPageContents, previousComponentOrder, allPages = that = this;
        var iFrame = document.getElementById("iframe-website");
        var iframe_contents = iFrame.contentWindow.document.body.innerHTML;

        $scope.iframeData = {};

         //get user
        UserService.getUser(function (user) {
            $scope.user = user;
            that.user = user;
        });

        //get account
        UserService.getAccount(function (account) {
            $scope.account = account;
            that.account = account;
            //get pages and find this page
            WebsiteService.getPages(account.website.websiteId, function (pages) {
                currentPage = 'index';
                that.allPages = pages;
                var parsed = angular.fromJson(pages);
                var arr = [];

                for(var x in parsed){
                  arr.push(parsed[x]);
                }
                $scope.allPages = arr;
                that.currentPageContents = _.findWhere(pages, {handle: currentPage});
                //get components from page
                if (that.currentPageContents.components) {
                    $scope.components = that.currentPageContents.components;
                }
            });

            //get website
            WebsiteService.getWebsite(account.website.websiteId, function (website) {
                $scope.website = website;
                $scope.primaryColor = $scope.website.settings.primary_color;
                $scope.secondaryColor = $scope.website.settings.secondary_color;
                $scope.primaryHighlight = $scope.website.settings.primary_highlight;
                $scope.primaryTextColor = $scope.website.settings.primary_text_color;
                $scope.primaryFontFamily = $scope.website.settings.font_family;
                $scope.secondaryFontFamily = $scope.website.settings.font_family_2;
            });

        });

        $scope.components = [];

        $scope.isEditing = false;

        $scope.isMobile = false;

        $scope.components.sort(function (a, b) {
            return a.i > b.i;
        });

        //put iframe contents in scope when loaded
        $window.iframeLoaded = function(){
            var iFrame = document.getElementById("iframe-website");
            var iframe_contents = iFrame.contentWindow.document.body.innerHTML;
        }

        $scope.sortableOptions = {
            start: function(e, ui) {
                //get previous element component id
                 // var componentId = ui.item[0].attributes['data-componentId'].value;
                that.previousComponentOrder= that.currentPageContents.components;
            },
            stop: function(e, ui) {
                console.log('drag ui', ui );
                var pageId = that.currentPageContents._id;
                var componentId = ui.item[0].attributes['data-componentId'].value;
                var newOrder = ui.item.index();
                var appendComponentAfter;

                for (var i = 0; i < that.currentPageContents.components.length; i++) {
                    if (i === newOrder) {
                      appendComponentAfter = that.currentPageContents.components[i]._id
                    }
                };

                console.log('appendComponentAfter >>> '+ appendComponentAfter);

                //page/:id/components/:componentId/order/:newOrder
                WebsiteService.updateComponentOrder(pageId, componentId, newOrder, function(data) {
                    console.log('Success: ', data);
                    $scope.updateIframeComponents();
                    $scope.scrollToIframeComponent(componentId);
                });
            }//end stor
        };

        $scope.resfeshIframe = function() {
            document.getElementById("iframe-website").setAttribute("src", document.getElementById("iframe-website").getAttribute("src"));
            $scope.components = that.currentPageContents.components;
        };

        $scope.editPage = function() {
            $scope.isEditing = true;
            console.log('activate aloha');
            $scope.activateAloha();
            // var iframe = document.getElementById("iframe-website");
            // var src = iframe.src;
            // iframe.setAttribute("src", src+"/?editor=true");
        };

        $scope.cancelPage = function() {
            $scope.deactivateAloha();
            $scope.isEditing = false;
        };

        $scope.savePage = function() {
            var componentJSON = that.currentPageContents.components;
            var pageId = that.currentPageContents._id;
            var iFrame = document.getElementById("iframe-website");
            var iframe_contents = iFrame.contentWindow.document.body.innerHTML;
            //foreach components by class .component
            var editedPageComponents = iFrame.contentWindow.document.getElementsByTagName("body")[0].querySelectorAll('.component');
            for (var i = 0; i < editedPageComponents.length; i++) {
                    var componentId = editedPageComponents[i].attributes['data-id'].value;
                    var componentType = editedPageComponents[i].attributes['data-class'].value;
                    var matchingComponent = _.findWhere(that.currentPageContents.components, { _id: componentId });
                    var componentEditable = editedPageComponents[i].querySelectorAll('.editable');

                    if (componentEditable.length > 1) {
                        for (var i2 = 0; i2 < componentEditable.length; i2++) {
                            var componentVar = componentEditable[i2].attributes['data-class'].value;
                            var componentVarContents = componentEditable[i2].innerHTML;
                            if (componentEditable[i2].querySelectorAll('.ng-binding').length >= 1) {
                                var span = componentEditable[i2].querySelectorAll('.ng-binding')[0]; // get the span
                                componentVarContents = span.innerHTML.replace(/(\r\n|\n|\r)/gm,"");
                            }

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


            //after updating components scope update the whole page
            WebsiteService.updateAllComponents(pageId, that.currentPageContents.components, function(data) {
                toaster.pop('success', "Page Saved", "The "+that.currentPageContents.handle+" page was saved successfully.");
                $scope.isEditing = false;
                $scope.deactivateAloha();
            });
        };

        $scope.updatePage = function() {
            console.log('Selected Page >>> '+ $scope.pageSelected);
            var box = document.getElementById('pageSelection');

            conceptName = box.options[box.selectedIndex].text;
            $scope.pageSelected = conceptName;
            var route;
            var sPage = conceptName;
            if (sPage === 'index') {
                route = '';
            }
            if (sPage === 'single-post') {
                route = '';
            }
            if (sPage === 'blog') {
                route = "/"+sPage;
            } else {
                route = '/page/'+sPage;
            }

            document.getElementById("iframe-website").setAttribute("src", route);

            WebsiteService.getPages(that.account.website.websiteId, function (pages) {
                var currentPage = conceptName || 'index';
                console.log('Current Page Selected >>> ', currentPage);
                that.allPages = pages;
                $scope.allPages = pages;
                that.currentPageContents = _.findWhere(pages, {handle: currentPage});
                //get components from page
                if (that.currentPageContents && that.currentPageContents.components) {
                    $scope.components = that.currentPageContents.components;
                } else {
                    $scope.components = [];
                }
            });
        };

        $scope.addComponent = function(component) {
            var pageId = that.currentPageContents._id;
            WebsiteService.addNewComponent(pageId, component.title, component.type, function(data){
                console.log('data >>> ', data);
                if (data.components) {
                    var newComponent = data.components[data.components.length - 1];
                    $scope.components.push(newComponent);
                    $scope.updateIframeComponents();
                    console.log('newComponent >>> ', newComponent);
                    $scope.scrollToIframeComponent(newComponent.anchor);
                    toaster.pop('success', "Component Added", "The "+newComponent.type+" component was added successfully.");
                }
            });
        };

        $scope.deleteComponent = function(componentId) {
            var pageId = that.currentPageContents._id;
            var deletedType;
            WebsiteService.deleteComponent(that.currentPageContents._id, componentId, function(data){
                // $scope.resfeshIframe();
                for(var i = 0; i < $scope.components.length; i++) {
                    if($scope.components[i]._id == componentId) {
                        deletedType = $scope.components[i].type;
                        $scope.components.splice(i, 1);
                        break;
                    }
                }
                $scope.updateIframeComponents();
                toaster.pop('success', "Component Deleted", "The "+deletedType+" component was deleted successfully.");
            });
        };

        $scope.updateIframeComponents = function() {
            console.log('>>> ', $scope.components);
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
            console.log('edit component');
            $scope.componentEditing = _.findWhere($scope.components, { _id: componentId });
        };

        $scope.saveComponent = function() {
            var componentId = $scope.componentEditing._id;
            var componentIndex;

            for (var i = 0; i < $scope.components.length; i++) {

                if ($scope.components._id === componentId) {
                    $scope.components[i] = $scope.componentEditing
                }
            }

            // $scope.components[componentIndex] = $scope.componentEditing;
            var pageId = that.currentPageContents._id;
            WebsiteService.updateComponent(pageId, $scope.componentEditing._id, $scope.componentEditing, function(data) {
                toaster.pop('success', "Component Saved", "The component was saved successfully.");
                $scope.updateIframeComponents();
            });
        };

        $scope.createPage = function(page) {
            console.log('create page');

            var websiteId = that.currentPageContents.websiteId;

            var pageData = {
                title: page.title,
                handle: page.handle
            };

            WebsiteService.createPage(websiteId, pageData, function(newpage) {
                console.log('Data >>> ', newpage);
                toaster.pop('success', "Page Created", "The "+newpage.title+" page was created successfully.");
                $scope.page = null;
                $scope.allPages.push(newpage);
                document.getElementById("iframe-website").setAttribute("src", "/page/"+newpage.handle);
                that.currentPageContents = newpage;
                //get components from page
                if (that.currentPageContents && that.currentPageContents.components) {
                    $scope.components = that.currentPageContents.components;
                } else {
                    $scope.components = [];
                }
            });
        };

        $scope.deletePage = function() {

            var pageId = that.currentPageContents._id;
            var websiteId = that.currentPageContents.websiteId;
            var title = that.currentPageContents.title;

            WebsiteService.deletePage(pageId, websiteId, title, function(data) {
                console.log('Data >>> ', data);
                toaster.pop('success', "Page Deleted", "The "+title+" page was deleted successfully.");
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

    }]);
});
