app.directive('indSlider',function($timeout){
 return {
   restrict: 'A',
   link: function(scope,element,attrs) {
     $timeout(function() {
         $(element).slick(scope.$eval(attrs.indSlider));
     });


    scope.$on('$refreshSlickSlider', function (event) {
        $(element).slick("unslick");
        $timeout(function () {
            scope.$apply(function () {
                $(element).slick(scope.$eval(attrs.indSlider));
            })
        }, 100);
    });

   }
 }
});
