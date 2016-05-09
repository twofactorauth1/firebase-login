'use strict';
/*global app, moment, angular, window*/
/*jslint unparam:true*/
app.directive('testimonialsComponent', ['$timeout', function ($timeout) {
  return {
    scope: {
      component: '=',
      control: '=',
      ssbEditor: '='
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope, element, attrs) {
        scope.touchMove = false;
        scope.draggable = false;
        scope.autoplay = false;
        scope.isEditing = true;

        if(!scope.component.slider) {
            scope.component.slider = {
                speed: 300, autoPlay: true, autoPlayInterval: 5000
            };
        }

        scope.autoplay = false;

        scope.$parent.$watchGroup(['ckeditorLoaded', 'vm.uiState.loaded'], function (newValue, oldValue) {
            if (newValue[0] || newValue[1]) {
                scope.dataLoaded = true;
            }
        });

        scope.newTestimonial = scope.component.newSlide ? angular.copy(scope.component.newSlide) : {
            "img": "<img src='https://s3-us-west-2.amazonaws.com/indigenous-admin/default-user.png'/>",
            "name": "First Last",
            "site": "www.examplesite.com",
            "text": "This is the testimonial."
        };

        function addRemoveTestimonials(index, add){
            scope.$broadcast('$refreshSlickSlider', index + 1);
            var testimonials = angular.copy(scope.component.testimonials);
            if(add){
                testimonials.splice(index + 1, 0, angular.copy(scope.newTestimonial));
            } else {
                testimonials.splice(index, 1);
            }
            scope.component.testimonials = testimonials;

        };

        scope.deleteTestimonial = function (index) {
            console.log(index);
            addRemoveTestimonials(index, false);
        };
        scope.addTestimonial = function (index) {
            console.log(index);
            addRemoveTestimonials(index, true);
        };

        scope.control.refreshSlider = function () {
            scope.dataLoaded = false;
            $timeout(function () {
                scope.dataLoaded = true;
            });
        };

    }
  };
}]);
