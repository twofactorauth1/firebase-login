app.directive('testimonialSlider',function($timeout){
 return {
   restrict: 'A',
   link: function(scope,element,attrs) {
     $timeout(function() {
         $(element).slick(scope.$eval(attrs.testimonialSlider));
     });
   }
 }
});