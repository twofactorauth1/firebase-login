app.directive('indSlider',function($timeout){
 return {
   restrict: 'A',
   link: function(scope,element,attrs) {
     $timeout(function() {
         $(element).slick(scope.$eval(attrs.indiSlider));
     });


    scope.$on('$refreshSlickSlider', function (event) {
        $(element).slick("unslick");
        $timeout(function () {
            scope.$apply(function () {
                $(element).slick(scope.$eval(attrs.indiSlider));
            })
        }, 100);
    });

   }
 }
});
