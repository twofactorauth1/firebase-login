app.directive('footerComponent', ['websiteService', function (WebsiteService) {
  return {
    scope: {
      component: '=',
      version: '='
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope, element, attrs, ctrl) {

      WebsiteService(function (err, data) {
        if (err) {
          console.log('Controller:LayoutCtrl -> Method:websiteService Error: ' + err);
        } else {
          scope.website = data;
        }
      });
    }
  }
}]);
