app.directive('footerComponent', ['$window','websiteService', '$location', function ($window,WebsiteService, $location) {
  return {
    scope: {
      component: '='
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope, element, attrs, ctrl) {

      scope.orgId=$window.indigenous.orgId;
      scope.component.spacing = scope.$parent.defaultSpacings;
      var accountHost = $location.$$host;
      var defaultAccountUrl = "//www.indigenous.io";
      if(scope.orgId==1){
          defaultAccountUrl = "//www.gorvlvr.com";
      } else if (scope.orgId==4){
          defaultAccountUrl = "//techevent.us";
        }
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

