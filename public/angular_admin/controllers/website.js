define(['app', 'websiteService', 'jqueryUI', 'angularUI', 'angularSortable', 'userService'], function(app) {
    app.register.controller('WebsiteCtrl', ['$scope', '$window', 'WebsiteService', 'UserService', function ($scope, $window, WebsiteService, UserService) {
        var user, account, components, currentPageContents, previousComponentOrder = that = this;
        var iFrame = document.getElementById("iframe-website");
        console.log('iFrame: ', iFrame);

         //get user
        UserService.getUser(function (user) {
            $scope.user = user;
            that.user = user;
            console.log('The User: ', user);
        });

        $scope.components = [];

        $scope.components.sort(function (a, b) {
            return a.i > b.i;
        });

        //put iframe contents in scope when loaded
        $window.addAttachment = function(){
            // console.log('Inner HTML: ', frames["iframe-website"].document.getElementsByTagName("body")[0].innerHTML);
            // $scope.attachments.push(JSON.parse(frames["iframe-website"].document.getElementsByTagName("body")[0].innerHTML));
            // console.log($scope.attachments);
            // $scope.$apply();
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

        $scope.sortingLog = [];

        $scope.resfeshIframe = function() {
            iFrame.attr("src",iFrame.attr("src"));
        };

        function logModels () {
            var logEntry = $scope.components.map(function(i){
                return i.type+'(pos:'+i.i+')';
            }).join(', ');
            $scope.sortingLog.push('Stop: ' + logEntry);
        };

        $scope.savePage = function() {
            var componentJSON = that.currentPageContents.components;
            console.log('componentJSON >>> ', componentJSON);
            var pageId = that.currentPageContents._id;
            console.log('pageId >>> ', pageId);
            WebsiteService.updateAllComponents(pageId, componentJSON, function(data) {
                console.log('Success: ', data);
            });
        };

        var iframe_contents = iFrame.contentWindow.document.body.innerHTML;
        console.log('iFrame Contents: ', iframe_contents);

        //get account
        UserService.getAccount(function (account) {
            $scope.account = account;
            that.account = account;
            console.log('The Account: ', account);
            //get pages and find this page
            WebsiteService.getPages(account.website.websiteId, function (pages) {
                var currentPage = 'index';
                that.currentPageContents = _.findWhere(pages, {handle: currentPage});
                console.log('currentPageContents >>> ', that.currentPageContents);
                //get components from page
                if (that.currentPageContents.components) {
                    console.log('components >>>', that.currentPageContents.components);
                    $scope.components = that.currentPageContents.components;
                }
            });
        });


    }]);
});
