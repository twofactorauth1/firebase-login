define(['app', 'websiteService', 'jqueryUI', 'angularUI', 'angularSortable', 'userService'], function(app) {
    app.register.controller('WebsiteCtrl', ['$scope', '$window', 'WebsiteService', 'UserService', function ($scope, $window, WebsiteService, UserService) {
        var user, account, components = that = this;
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

        $scope.sortableOptions = {
            stop: function(e, ui) {
              for (var index in $scope.components) {
                $scope.components[index].i = index;
              }

              logModels();
            }
        };

        $scope.sortingLog = [];

        function logModels () {
            var logEntry = $scope.components.map(function(i){
                return i.type+'(pos:'+i.i+')';
            }).join(', ');
            $scope.sortingLog.push('Stop: ' + logEntry);
        }

        $scope.resfeshIframe = function() {
            iFrame.attr("src",iFrame.attr("src"));
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
                var currentPageContents = _.findWhere(pages, {handle: currentPage});
                console.log('currentPageContents >>> ', currentPageContents);
                //get components from page
                console.log('components >>>', currentPageContents.components);
                $scope.components = currentPageContents.components;
            });

        });

    }]);
});
