'use strict';
/*global app, moment, angular, window*/
/*jslint unparam:true*/
app.directive('footerComponent', ['WebsiteService', function (WebsiteService) {
  return {
    scope: {
      component: '=',
      ssbEditor: '='
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope, element, attrs, ctrl) {
      scope.isEditing = true;
      scope.component.spacing = scope.$parent.defaultSpacings;
      scope.copyright = {
        year: new Date().getFullYear()
      }
      scope.copyrightYear = new Date().getFullYear();
      WebsiteService.getWebsite(function (website) {
        scope.website = website;
      });
    }
  };
}]);
