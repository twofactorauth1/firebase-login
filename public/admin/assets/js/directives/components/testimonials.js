'use strict';
/*global app, moment, angular, window*/
/*jslint unparam:true*/
app.directive('testimonialsComponent', ['$timeout', function ($timeout) {
  return {
    scope: {
      component: '=',
      control: '='
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope, element, attrs) {
      scope.touchMove = false;
      scope.draggable = false;
      scope.autoplay = false;
      scope.isEditing = true;

      if(!scope.component.slider)
      {
        scope.component.slider = {
          speed: 300, autoPlay: true, autoPlayInterval: 5000
        };
      }
      scope.autoplay = false;

      scope.$parent.$watch('ckeditorLoaded', function (newValue, oldValue) {
        if(newValue){          
          scope.dataLoaded = true;
        }
      });

      var addRemoveTestimonials = function(index, add){
        var testimonials = angular.copy(scope.component.testimonials);
        if(add){
          var newTestimonial = {
            "img": "<img src='https://s3-us-west-2.amazonaws.com/indigenous-admin/default-user.png'/>",
            "name": "First Last",
            "site": "www.examplesite.com",
            "text": "This is the testimonial."
          };
          testimonials.splice(index + 1, 0, newTestimonial);  
        }
        else{
          testimonials.splice(index, 1); 
        }   
        scope.component.testimonials = testimonials;      
        $timeout(function () {
          scope.$apply(function(){
            scope.dataLoaded = !scope.dataLoaded;
          })
        });
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
        $timeout(function () {
          scope.dataLoaded = !scope.dataLoaded;
        });
      };
    }
  };
}]);
