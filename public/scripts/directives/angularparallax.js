'use strict';

angular.module('angular-parallax', [
]).directive('parallax', ['$window', function($window) {
    return {
        restrict: 'A',
        scope: {
            parallaxRatio: '@',
            parallaxVerticalOffset: '@',
            parallaxHorizontalOffset: '@',
        },
        link: function($scope, elem, $attrs) {
            var setPosition = function () {
                // horizontal positioning
                elem.css('left', $scope.parallaxHorizontalOffset + "px");
                var calcValY = $window.pageYOffset * ($scope.parallaxRatio ? $scope.parallaxRatio : 1.1 );
                if (calcValY <= $window.innerHeight) {
                    var topVal = (calcValY < $scope.parallaxVerticalOffset ? $scope.parallaxVerticalOffset : calcValY);
                    elem.css('top', topVal + "px");
                }
            };

            setPosition();

            angular.element($window).bind("scroll", setPosition);
            angular.element($window).bind("touchmove", setPosition);
        }  // link function
    };
}]).directive('parallaxBackground', ['$window', '$timeout', function($window, $timeout) {
    return {
        restrict: 'A',
        transclude: true,
        template: '<div ng-transclude></div>',
        scope: {
            parallaxRatio: '@',
            parallaxVerticalOffset: '@',
            parallaxXPosition: '@'
        },
        link: function($scope, elem, attrs) {
            var initialRun = true;
            elem.addClass('opacity-0');
            var setPosition = function () {
                // Fix for smaller resolutions
                var calcValY = 0;
                var calcValX = "50%";
                if($scope.parallaxXPosition) {
                    if($scope.parallaxXPosition == 'left') {
                        calcValX = "0%";
                    }
                    if($scope.parallaxXPosition == 'center') {
                        calcValX = "50%";
                    }
                    if($scope.parallaxXPosition == 'right') {
                        calcValX = "100%";
                    }
                }
                if(elem.hasClass("parallax")){
                    var win_width = $(window).width();
                    var iOS = ( navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false );
                    if(win_width < 750 || iOS) {
                        $scope.parallaxRatio = 0.02;
                    }
                    var yoffset = 0;
                    if (initialRun && $window.pageYOffset == 0){
                        // yoffset = 10;
                    }
                    calcValY = (pos(elem[0]) - $window.pageYOffset) * ($scope.parallaxRatio ? $scope.parallaxRatio : 1.1 );
                    calcValY = calcValY - yoffset;
                    elem.css('background-position', calcValX + " " + calcValY + "px");
                    elem.css('background-attachment', "fixed");
                } else {
                    elem.css('background-position', calcValX + " " + calcValY + "px");
                    elem.css('background-attachment', "inherit");
                }

                if (initialRun) {
                    $timeout(function() {
                        elem.removeClass('opacity-0');
                    }, 0);
                    initialRun = false;
                }

            };

            var pos = function(obj){
                var curLeft  = 0;
                var curTop = 0;
                if (obj.offsetParent){
                    do {
                        curLeft += obj.offsetLeft;
                        curTop += obj.offsetTop;
                    } while(obj = obj.offsetParent);
                }
                return curTop;
            };

            // set our initial position - fixes webkit background render bug
            $(document).ready(function() {
                $timeout(function() {
                    setPosition();
                }, 0);
            })

            angular.element($window).bind("scroll", setPosition);
            angular.element($window).bind("touchmove", setPosition);
        }  // link function
    };
}]);
