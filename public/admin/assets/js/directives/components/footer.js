app.directive('footerComponent', ['WebsiteService', function (WebsiteService) {
  return {
    scope: {
      component: '=',
      version: '='
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope, element, attrs, ctrl) {

      WebsiteService.getWebsite(function (website) {
        scope.website = website;
      });
    }
  };
}]);
