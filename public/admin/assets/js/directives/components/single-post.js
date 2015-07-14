'use strict';
/*global app, moment, angular, window*/
/*jslint unparam:true*/
app.directive('singlePostComponent', ['$location', "WebsiteService", "$timeout", function ($location, WebsiteService, $timeout) {
  return {
    scope: {
      component: '=',
      version: '='
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope, element, attrs) {
      scope.isEditing = true;
      scope.blog = {};
      scope.datePicker = {};
      /*
       * @dateOptions
       * -
       */

      scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
      };

      /*
       * @open
       * -
       */

      scope.open = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        scope.datePicker.isOpen = true;
      };

      /*
       * @endOpen
       * -
       */

      scope.endOpen = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        scope.startOpened = false;
        scope.endOpened = !scope.endOpened;
      };

      /*
       * @startOpen
       * -
       */

      scope.startOpen = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        scope.endOpened = false;
        scope.startOpened = !scope.startOpened;
      };
      if (scope.$parent.blog) {
        scope.blog.post = scope.$parent.blog.post;
      }
    }
  };
}]);
