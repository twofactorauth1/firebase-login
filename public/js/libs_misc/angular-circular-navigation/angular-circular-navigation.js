(function () {

  'use strict';

  /*global define, module, exports, require */

  /* istanbul ignore next */
  var angular = window.angular ? window.angular : 'undefined' !== typeof require ? require('angular') : undefined;

  var circular = angular.module('angularCircularNavigation', [])
    .directive('circular', ['$compile', '$timeout', '$location', function ($compile, $timeout, $location) {

      return {
        restrict: 'E',
        scope: {
          passedOptions: '=',
          passedIndex: '@',
          passedComponent: '=',
          passedComponentLength: '@'
        },
        templateUrl: '/js/libs_misc/angular-circular-navigation/angular-circular-navigation.html',
        link: function (scope, $element, $attrs) {
          
          scope.options = angular.copy(scope.passedOptions);
          // Check if single post 
          scope.component = angular.copy(scope.passedComponent);
          if ($location.search().posthandle) {
            scope.posthandle = true;
          };

          var timer;

          scope.toggleMenu = function () {
            scope.options.isOpen = !scope.options.isOpen;
            $timeout.cancel(timer);
          };

          scope.hideIt = function() {
            timer = $timeout(function() {
              scope.options.isOpen = false;
            }, 500);
          };


          scope.perform = function (options, item) {
            if (typeof item.onclick === 'function') {
              item.onclick(options, item, scope.passedComponent, scope.passedIndex);
            }

            if (scope.options.toggleOnClick) {
              scope.toggleMenu();
            }
          };        

          scope.hideItem = function(item)
          {
          var _hide = false;
          if(scope.component.type && scope.component.type === 'footer')
          {
            if(item.type==="delete" || item.type==="clone")
            {
              _hide = true;
            }
          }
          else if(scope.component.type && (scope.component.type === 'blog' ||  scope.component.type === 'blog-teaser'))
          {
            if(item.type==="clone")
            {
              _hide = true;
            }
          }
          
          if(scope.passedIndex == scope.passedComponentLength - 1 && item.type === "down")
          {
            _hide = true;
          }
          if(scope.passedIndex == 0 && item.type === "up")
          {
            _hide = true;
          }
          if(scope.posthandle)
          {
            if(item.type==="design" && scope.component.type === 'single-post')
            {
              _hide = false;
            }
            else{
              _hide = true; 
            }
          }
          return _hide;
          };          
        }
      };
    }]);

  /* istanbul ignore next */
  if (typeof define === 'function' && define.amd) {
    define('circular', ['angular'], circular);
  } else if ('undefined' !== typeof exports && 'undefined' !== typeof module) {
    module.exports = circular;
  }

})();
