app.directive('navigationComponent', ['websiteService', 'accountService', '$timeout', function (websiteService, accountService, $timeout) {
    return {
        scope: {
            component: '='
        },
        templateUrl: '/components/component-wrap.html',
        controller: function ($scope, websiteService, accountService, $compile) {
            $scope.$watch('component', function(){
                if (!angular.isDefined($scope.component.shownavbox)) {
                    $scope.component.shownavbox = true;
                }
                websiteService(function (err, website) {
                    $scope.website = website;
                    $timeout(function () {
                        $(window).trigger('resize');
                    }, 0);
                });
                accountService(function (err, account) {
                    $scope.account = account;
                });
                var args = {};
                $scope.$emit('getCurrentPage', args);
                $scope.currentpage = args.currentpage;
                // Special case for blogs
                if($scope.currentpage && $scope.currentpage.handle=== 'blog-list'){
                    $scope.currentpage.handle = 'blog';
                }
            });

        }
    }
}]);
