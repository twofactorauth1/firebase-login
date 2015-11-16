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
      WebsiteService.getWebsite(function (website) {
        scope.website = website;
      });
    }
  };
}]);
