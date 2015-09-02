'use strict';
/*global app, moment, angular, window*/
/*jslint unparam:true*/
app.directive('testimonialsComponent', ['$timeout', function ($timeout) {
  return {
    scope: {
      component: '='
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope, element, attrs) {
      scope.touchMove = false;
      scope.draggable = false;
      scope.autoplay = false;
      scope.isEditing = true;
      $(document).ready(function () {
        $timeout(function () {
          scope.dataLoaded = true;
        },1000);
      });
      scope.deleteTestimonial = function (index) {
        scope.dataLoaded = false;
        console.log(index);
        scope.component.testimonials.splice(index, 1);
        $timeout(function () {
          scope.dataLoaded = true;
        });
      };
      scope.addTestimonial = function (index) {
        scope.dataLoaded = false;
        var newTestimonial = {
          "img": "<img src='https://s3-us-west-2.amazonaws.com/indigenous-admin/default-user.png'/>",
          "name": "First Last",
          "site": "www.examplesite.com",
          "text": "This is the testimonial."
        };
        scope.component.testimonials.splice(index + 1, 0, newTestimonial);
        $timeout(function () {
          scope.dataLoaded = true;
        });
      };
    }
  };
}]);
