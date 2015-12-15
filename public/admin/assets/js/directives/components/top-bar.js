'use strict';
/*global app, moment, angular, window*/
/*jslint unparam:true*/
app.directive('topBarComponent', function () {
  return {
    scope: {
      component: '=',
      ssbEditor: '='
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope, element, attrs, ctrl) {
      scope.isEditing = true;
      scope.sortableConfig = {
        animation: 150,
        onSort: function (evt) {
          
        },
        onStart: function (evt) {
          
        },
        onEnd: function (evt) {
          
        }
      };
    }
  };
});