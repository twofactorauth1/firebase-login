app.directive('blogTeaserComponent', ['WebsiteService', function (WebsiteService) {
  return {
    scope: {
      component: '=',
      version: '='
    },
    templateUrl: '/components/component-wrap.html',
    controller: function ($scope, WebsiteService, $compile) {
      WebsiteService.getPosts(function (posts) {
        $scope.teaserposts = posts;
      });
    }
  }
}]);
