'use strict';
/*global app, moment, angular, window*/
/*jslint unparam:true*/
app.directive('testimonialsComponent', ['$timeout', function ($timeout) {
  return {
    scope: {
      component: '=',
      version: '='
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope, element, attrs) {
      scope.autoplay = false;
      scope.isEditing = true;
      $timeout(function () {
        scope.dataLoaded = true;
      });
      scope.deleteTestimonial = function (index) {
        scope.dataLoaded = false;
        scope.component.testimonials.splice(index, 1);
        $timeout(function () {
          scope.dataLoaded = true;
        });
      };
      scope.addTestimonial = function (index) {
        scope.dataLoaded = false;
        var newTestimonial = {
          "img": "",
          "name": "Name",
          "site": "Site",
          "text": "Description"
        };
        scope.component.testimonials.splice(index + 1, 0, newTestimonial);
        $timeout(function () {
          scope.dataLoaded = true;
        });
      };
    }
  };
}]);
