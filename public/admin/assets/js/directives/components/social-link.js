'use strict';
/*global app, moment, angular, window*/
/*jslint unparam:true*/
app.directive('socialLinkComponent', ["$modal", function ($modal) {
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
        delay: 10,
        onSort: function (evt) {
          
        },
        onStart: function (evt) {
          console.log("Start")
        },
        onEnd: function (evt) {
          
        }
      };
    }
  };
}]);
