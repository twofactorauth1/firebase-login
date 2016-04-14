app.directive('testimonialSlider',function($timeout){
 return {
   restrict: 'A',
   link: function(scope,element,attrs) {
     $timeout(function() {
         $(element).slick(scope.$eval(attrs.testimonialSlider));
     });

 	function addRemoveSlides(index, newSlide){
 		scope.$broadcast('$refreshSlickSlider');
        var testimonials = angular.copy(scope.component.testimonials);
        if(newSlide){
            testimonials.splice(index + 1, 0, angular.copy(scope.newTestimonial));
        } else {
            testimonials.splice(index, 1);
        }
        scope.component.testimonials = testimonials;

    };

    scope.deleteSlide = function (index) {
        console.log(index);
        addRemoveSlides(index);
    };
    scope.addSlide = function (index, newSlide) {
        console.log(index);
        addRemoveSlides(index, newSlide);
    };

    scope.deleteImageSlide = function (index) {
        removeImage(index);
    };

    function removeImage(index){
        scope.$broadcast('$refreshSlickSlider');
        scope.component.images.splice(index, 1);
    }

    scope.$on('$refreshSlickSlider', function (event) {
        $(element).slick("unslick");
        $timeout(function () {
            scope.$apply(function () {
                $(element).slick(scope.$eval(attrs.testimonialSlider));
            })
        }, 100);
    });

   }
 }
});
