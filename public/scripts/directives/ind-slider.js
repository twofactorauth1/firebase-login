app.directive('indSlider',function($timeout,$window){
	return {
		restrict: 'A',
		link: function(scope,element,attrs) {
			$timeout(function() {
				$(element).slick(scope.$eval(attrs.indSlider));
			}, 0);
            angular.element($window).bind('resize', function(){

          $timeout(function() {
              var sliderHeight=$(element).height();
              var textWrapHeight=$(element).closest("[testimonials-component]").siblings(".flex-container-absolute-column").height();
              if(sliderHeight<textWrapHeight){
                  console.log("change height")
                  if($(element).hasClass('slick-initialized')){
                  $(element).slick("unslick");
                     $timeout(function () {
                        scope.$apply(function () {
                            $(element).closest("[testimonials-component]").attr("height",textWrapHeight+"px")
                           $(element).slick(scope.$eval(attrs.indSlider));
                        })
                     }, 100);
                  }
              }
			}, 0);

         // manuall $digest required as resize event
         // is outside of angular
         scope.$digest();
       });



		}
	}
});
