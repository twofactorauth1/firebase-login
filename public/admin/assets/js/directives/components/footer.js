'use strict';
/*global app, moment, angular, window*/
/*jslint unparam:true*/
app.directive('footerComponent', ['WebsiteService', function (WebsiteService) {
  return {
    scope: {
      component: '='
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope, element, attrs, ctrl) {
      scope.isEditing = true;
      WebsiteService.getWebsite(function (website) {
        scope.website = website;
      });
    }
  };
}]);
