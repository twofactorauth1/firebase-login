'use strict';

angular.module('angular-parallax', [
]).directive('parallaxBackground', ['$window', function($window) {
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
        var calcValY = 0;
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
        if(elem.hasClass("parallax")){
          var win_width = $(window).width();
          var iOS = ( navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false );

          if(win_width < 750 || iOS)
            $scope.parallaxRatio = 0.02;
          var yoffset = 0;
          if ($window.pageYOffset == 0){
            yoffset = 10;
          }
          var calcValY = 0;
          if(angular.element(".sortable-page-content").length > 0){
                calcValY = (elem.offset().top - $scope.offsetTop - $window.pageYOffset) * ($scope.parallaxRatio ? $scope.parallaxRatio : 1.1) - ($scope.parallaxVerticalOffset || 0);
                 if(navigator.userAgent.indexOf("Firefox") > 0) {
                    calcValY=-1*calcValY
                }
                elem.css('background-position', "50% " + calcValY + "px");
                elem.css('background-attachment', "fixed");
          }
          else{
                calcValY = (pos(elem[0]) - $window.pageYOffset) * ($scope.parallaxRatio ? $scope.parallaxRatio : 1.1 );
                calcValY = calcValY - yoffset;
                elem.css('background-position', calcValX + " " + calcValY + "px");
                elem.css('background-attachment', "fixed");
          }

        }
        else
        {
          elem.css('background-position', calcValX + " " + calcValY + "px");
          elem.css('background-attachment', "inherit");
        }
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

        var unbindWatcher = $scope.$watch(function() {
                return angular.element(".sortable-page-content").length
            }, function(newValue, oldValue) {
            if (newValue && newValue > 0) {
                var _top = angular.element("ssb-topbar").offset().top;
                var _height = angular.element("ssb-topbar").height();
                var _winHeight = angular.element(window).height();
                var _heightDiff = _height + _top;
                $scope.offsetTop = _heightDiff;
                 angular.element(".ssb-site-builder-container").scroll(function() {
                    setPosition();
                });
                setTimeout(function() {
                    setPosition();
                }, 0)
                unbindWatcher();
            }
        });
          angular.element($window).bind("scroll", setPosition);
          angular.element($window).bind("touchmove", setPosition);
          $scope.$on('parallaxCall', function(event, args) {
               setTimeout(function() {
                    setPosition();
                }, 100)
          });
          // set our initial position - fixes webkit background render bug

      })

      angular.element($window).bind('load', function(e) {
        setPosition();
        $scope.$apply();
      });
    }  // link function
  };
}]);
