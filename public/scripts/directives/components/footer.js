app.directive('footerComponent', ['websiteService', '$location', function (WebsiteService, $location) {
  return {
    scope: {
      component: '='
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope, element, attrs, ctrl) {
      scope.component.spacing = scope.$parent.defaultSpacings;
      var accountHost = $location.$$host;
      var defaultAccountUrl = "//www.indigenous.io";
      scope.footerLinkUrl = defaultAccountUrl + "?utm_source=" + accountHost + "&utm_medium=footer_link";
      WebsiteService(function (err, data) {
        if (err) {
          console.log('Controller:LayoutCtrl -> Method:websiteService Error: ' + err);
        } else {
          scope.website = data;
          scope.copyright = {
            year: new Date().getFullYear()
          }
          scope.copyrightYear = new Date().getFullYear();
        }
      });
      // Check for legacy pages
      if(!element.parents(".ssb-section-layout").length){
        element.addClass("legacy-footer");
      }
    }
  }
}]);

