'use strict';
/*global app, moment, angular, window*/
/*jslint unparam:true*/
app.directive('blogTeaserComponent', ['WebsiteService', '$filter', function (WebsiteService, $filter) {
  return {
    scope: {
      component: '=',
      ssbEditor: '='
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope, element, attrs) {
      scope.isEditing = true;
    },
    controller: function ($scope, WebsiteService, $compile) {
      WebsiteService.getPosts(function (posts) {
        $scope.teaserposts = posts;
      });

      $scope.sortBlogFn = function (component) {
        return function (blogpost) {
          if (component.postorder) {
            if (component.postorder === 1 || component.postorder === 2) {
              return Date.parse($filter('date')(blogpost.modified.date, "MM/dd/yyyy HH:mm:ss"));
            }
            if (component.postorder === 3 || component.postorder === 4) {
              return Date.parse($filter('date')(blogpost.created.date, "MM/dd/yyyy HH:mm:ss"));
            }
            if (component.postorder === 5 || component.postorder === 6) {
              return Date.parse($filter('date')(blogpost.publish_date || blogpost.created.date, "MM/dd/yyyy"));
            }
          } else {
            return Date.parse($filter('date')(blogpost.publish_date || blogpost.created.date, "MM/dd/yyyy"));
          }
        };
      };

      $scope.customSortOrder = function (component) {
        if (component.postorder === 1 || component.postorder === 3 || component.postorder === 5) {
          return false;
        }
        if (component.postorder === 2 || component.postorder === 4 || component.postorder === 6) {
          return true;
        }
        return true;
      };
    }
  };
}]);
