'use strict';
/*global app, moment, angular, window*/
/*jslint unparam:true*/
app.directive('socialLinkComponent', ["$modal", function ($modal) {
  return {
    scope: {
      component: '='
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope, element, attrs, ctrl) {
      scope.isEditing = true;
    }
  };
}]);
