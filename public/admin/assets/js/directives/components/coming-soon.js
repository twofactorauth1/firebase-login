'use strict';
/*global app, moment, angular, window*/
/*jslint unparam:true*/
app.directive('comingSoonComponent', function () {
  return {
    scope: {
      component: '=',
      version: '='
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope, element, attrs) {
      scope.isEditing = true;
    }
  };
});