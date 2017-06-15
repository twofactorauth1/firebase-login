'use strict';
/*global app, moment, angular, window*/
/*jslint unparam:true*/
app.directive('footerComponent', ['WebsiteService', '$location', function (WebsiteService, $location) {
  return {
    scope: {
      component: '=',
      ssbEditor: '='
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope, element, attrs, ctrl) {
      scope.orgId=scope.$parent.$parent.vm.state.account.orgId;
      scope.isEditing = true;
      var accountHost = $location.$$host;
      var defaultAccountUrl = "//www.indigenous.io";
      scope.footerLinkUrl = defaultAccountUrl + "?utm_source=" + accountHost + "&utm_medium=footer_link";
      if(!scope.ssbEditor)
        scope.component.spacing = scope.$parent.defaultSpacings;
        scope.copyright = {
          year: new Date().getFullYear()
        }
        scope.copyrightYear = new Date().getFullYear();
        WebsiteService.getWebsite(function (website) {
          scope.website = website;
        });
      // Check for legacy pages
        if(!element.parents(".ssb-section-layout").length){
          element.addClass("legacy-footer");
        }
      }
    };
}]);
