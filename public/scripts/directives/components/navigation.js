app.directive('navigationComponent', ['websiteService', 'accountService', '$timeout', function (websiteService, accountService, $timeout) {
    return {
        scope: {
            component: '='
        },
        templateUrl: '/components/component-wrap.html',
        controller: function ($scope, websiteService, accountService, SsbPageSectionService, $compile) {
            $scope.navbarId = _.random(0, 1000);
            $scope.website = {};
            if(window.indigenous && window.indigenous.precache && window.indigenous.precache.siteData && window.indigenous.precache.siteData.linkList){
                $scope.website.linkLists = window.indigenous.precache.siteData.linkList;
            }
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
                if($scope.currentpage && ($scope.currentpage.handle=== 'blog-list' || $scope.currentpage.handle=== 'blog-post')){
                    $scope.currentpage.handle = 'blog';
                }
            });
            $scope.toggleNavClass=function(ele){
                var li=$(ele.target).parents("li");
                if(li){
                    if(!li.hasClass("nav-active")){
                        li.parents("section").addClass("overflow_visible");
                        li.siblings().removeClass("nav-active");
                        li.addClass("nav-active");
                    }else{
                        li.removeClass("nav-active");
                        li.parents("section").remove("overflow_visible");
                    }
                }
            }
            $scope.$watch(function() { return SsbPageSectionService.offset }, function(offset) {
                $scope.scrollOffsetTop = offset;
            }, true);

        }
    }
}]);
