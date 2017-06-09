'use strict';
/** 
  * A directive used for "close buttons" (eg: alert box).
  * It hides its parent node that has the class with the name of its value.
*/
app.directive('fixedHeaderTable', ["$timeout", "$document", "$rootScope", "$window",  function ($timeout, $document, $rootScope, $window) {
    return {
        restrict: 'A',
        link: function (scope, elem, attrs) {
            
            scope.$watch(function() {return elem.find("thead.sticky-header-class").length}, function(newValue){
                if(newValue){
                    setHeaderWidth();
                }
            });

            function setHeaderWidth(){
                var _width = angular.element(elem).find("tbody").width();
                var rows = $(".sticky-header-class tr");
                rows.width(_width + 'px');
            }

            $rootScope.$watch('app.layout.isSidebarClosed',  function (val) {
                //$document.scrollTopAnimated(0, 600);
                $timeout(function(){
                    setHeaderWidth();
                }, 0)
            });

            angular.element($window).bind('resize', function(){
                setHeaderWidth();
            })
        }
    };
}]);