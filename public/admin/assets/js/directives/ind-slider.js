app.directive('indSlider',function($timeout){
 return {
   restrict: 'A',
   link: function(scope,element,attrs) {
     $timeout(function() {
         $(element).slick(scope.$eval(attrs.indSlider));
     }, 500);
     scope.$on('updatetestimonialHeight.component', function(event, args) {
         if($(element).hasClass('slick-initialized')){
             $(element).slick("unslick");
             $timeout(function () {
                 scope.$apply(function () {
                     $(element).slick(scope.$eval(attrs.indSlider));
                 });
             }, 0);
         }
     });
     scope.$on('$refreshSlickSlider', function (event, index) {
        if($(element).hasClass('slick-initialized')){
            $(element).slick("unslick");
            $timeout(function () {
                scope.$apply(function () {
                   $(element).slick(scope.$eval(attrs.indSlider));
                    if(index)
                        $(element).slick("slickGoTo", index);
                })
            }, 100);
        }
    });

   }
 }
});
