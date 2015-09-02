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
}]).directive('parallaxBackground', ['$window', function($window) {
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
      var setPosition = function () {
         // Fix for smaller resolutions
        var win_width = $(window).width();
        var iOS = ( navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false );

        if(win_width < 750 || iOS)
          $scope.parallaxRatio = 0.02;
        var yoffset = 0;
        if ($window.pageYOffset == 0){
          yoffset = 10;
        }
        var calcValY = (pos(elem[0]) - $window.pageYOffset) * ($scope.parallaxRatio ? $scope.parallaxRatio : 1.1 );
        calcValY = calcValY - yoffset;
        //elem.css('background-position-y', calcValY + "px");
        var calcValX = "50%";
        if($scope.parallaxXPosition)
        {
          if($scope.parallaxXPosition == 'left')
          {
            calcValX = "0%";
          }
          if($scope.parallaxXPosition == 'center')
          {
            calcValX = "50%";
          }
          if($scope.parallaxXPosition == 'right')
          {
            calcValX = "100%";
          }
        }
        elem.css('background-position', calcValX + " " + calcValY + "px");
      };

      var pos = function(obj){
        var curLeft  = 0;
        var curTop = 0;
        if (obj.offsetParent){
            do {
                curLeft += obj.offsetLeft;
                curTop += obj.offsetTop;
            }while(obj = obj.offsetParent);
        }
        return curTop;
    };

      // set our initial position - fixes webkit background render bug
      $(document).ready(function() {
          setTimeout(function() {
          setPosition();
        }, 500)
      })
      
      angular.element($window).bind("scroll", setPosition);
      angular.element($window).bind("touchmove", setPosition);
    }  // link function
  };
}]);
