define(['app', 'websiteService', 'jqueryUI', 'angularUI', 'angularSortable', 'userService', 'confirmClickDirective', 'colorpicker'], function(app) {
    app.register.controller('WebsiteCtrl', ['$scope', '$window', '$timeout', 'WebsiteService', 'UserService', function ($scope, $window, $timeout, WebsiteService, UserService) {
        var user, account, components, currentPageContents, previousComponentOrder, allPages = that = this;
        var iFrame = document.getElementById("iframe-website");
        var iframe_contents = iFrame.contentWindow.document.body.innerHTML;

        $scope.selectedPage;

         //get user
        UserService.getUser(function (user) {
            $scope.user = user;
            that.user = user;
            console.log('The User: ', user);
        });

        $scope.components = [];

        $scope.hey = null;

        $scope.components.sort(function (a, b) {
            return a.i > b.i;
        });

        //put iframe contents in scope when loaded
        $window.iframeLoaded = function(){

            var iFrame = document.getElementById("iframe-website");
            var iframe_contents = iFrame.contentWindow.document.body.innerHTML;
            //when component is on hover show on sidebar
            // $timeout(function() {
            //      var components = iFrame.contentWindow.document.getElementsByTagName("body")[0].querySelectorAll('.component');
            //         console.log('Elements >>> ', components);
            //     for (var i in components) {
            //         if (!components.hasOwnProperty(i)) continue;
            //         components[i].addEventListener( 'mouseover', function(event) {
            //             var target = event.currentTarget;
            //             if (target.getAttribute('data-id').length > -1) {
            //                 var componentId = target.getAttribute('data-id').value;
            //                 var matchingSidebar = document.getElementsByClassName("rightpanel-website").querySelectorAll('.dd-item[data-component-id="'+componentId+'"]');
            //                 console.log('Match >>> ', matchingSidebar);
            //                 if (matchingSidebar.length > -1) {
            //                     matchingSidebar.setAttribute("class", "hover");
            //                 }
            //             }
            //         });
            //         components[i].addEventListener('mouseout', function(event) {
            //             var target = event.currentTarget;
            //             if (target.getAttribute('data-id').length > -1) {
            //                 var componentId = target.getAttribute('data-id').value;
            //                 var d = document.querySelectorAll('.dd-item[data-component-id="'+componentId+'"]');
            //                 d.className=d.className.replace("hover","");
            //             }
            //         });
            //     };
            // }, 1000);
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
                    iFrame.contentWindow.location.reload();
                    //update the dom inside the iframe
                    // var iFrameContents = iFrame.contentDocument || iFrame.contentWindow.document;
                    // var iFrameBody = iFrameContents.getElementById('body');
                    // var matchingComponent = angular.element(iFrameBody.querySelectorAll('.component[data-id="'+componentId+'"]'));
                    // matchingComponent.remove();
                    // iFrameContents.getElementById('body').querySelectorAll('.component[data-id="'+appendComponentAfter+'"]').insertAdjacentHTML('beforebegin', matchingComponent[0].innerHTML);
                    //element.appendChild(para);
                        //get the element in the iframe by component id
                        //get the id of the next ui
                        //append component of next ui componentid
                });
            }//end stor
        };

        $scope.resfeshIframe = function() {
            document.getElementById("iframe-website").setAttribute("src", document.getElementById("iframe-website").getAttribute("src"));
            $scope.components = that.currentPageContents.components;
        };

        //if website has been edited
        $scope.isEditing = false;

        $scope.editPage = function() {
            $scope.isEditing = true;
            document.getElementById("iframe-website").src = "/?editor=true";
        };

        $scope.cancelPage = function() {
            document.getElementById("iframe-website").src = "/";
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
                                console.log('Component with (.item) >>> '+ first+' '+third);
                                matchingComponent[first][second][third] = componentVarContents;
                            }
                            //if needs to traverse a single
                            if (componentVar.indexOf('-') > 0) {
                                var first = componentVar.split("-")[0];
                                var second = componentVar.split("-")[1];
                                console.log('Component with (-) >>> '+ first+' '+second);
                                matchingComponent[first][second] = componentVarContents;
                            }
                            //simple
                            if (componentVar.indexOf('.item') <= 0 && componentVar.indexOf('-') <= 0) {
                                console.log('Component >>> '+ componentVar);
                                matchingComponent[componentVar] = componentVarContents;
                            }
                        }
                    }
            };

            console.log('After Components >>> ', that.currentPageContents.components);

            //after updating components scope update the whole page
            WebsiteService.updateAllComponents(pageId, that.currentPageContents.components, function(data) {
                console.log('Success: ', data);
            });
        };

        $scope.updatePage = function() {
            console.log($scope.selectedPage);
            //change the iframe src
            var route;
            var sPage = $scope.selectedPage;
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

            document.getElementById("iframe-website").setAttribute("src", route+"/?editor=true");

            WebsiteService.getPages(that.account.website.websiteId, function (pages) {
                var currentPage = $scope.selectedPage || 'index';
                console.log('Current Page Selected >>> ', currentPage);
                that.allPages = pages;
                $scope.allPages = pages;
                that.currentPageContents = _.findWhere(pages, {handle: currentPage});
                //get components from page
                if (that.currentPageContents && that.currentPageContents.components.length > -1) {
                    $scope.components = that.currentPageContents.components;
                }
            });
        };

        $scope.addComponent = function(component) {
            console.log(angular.copy(component));
            WebsiteService.addNewComponent(that.currentPageContents._id, component.title, component.type, function(data){
                //send 
            });
        };

        $scope.deleteComponent = function(componentId) {
            console.log(componentId);
            WebsiteService.deleteComponent(that.currentPageContents._id, componentId, function(data){
                $scope.resfeshIframe();
            });
        };

        $scope.editComponent = function() {
            console.log('edit component');
        };


        //get account
        UserService.getAccount(function (account) {
            $scope.account = account;
            that.account = account;
            //get pages and find this page
            WebsiteService.getPages(account.website.websiteId, function (pages) {
                currentPage = 'index';
                that.allPages = pages;
                $scope.allPages = pages;
                that.currentPageContents = _.findWhere(pages, {handle: currentPage});
                //get components from page
                if (that.currentPageContents.components) {
                    $scope.components = that.currentPageContents.components;
                }
            });
        });


    }]);
});
