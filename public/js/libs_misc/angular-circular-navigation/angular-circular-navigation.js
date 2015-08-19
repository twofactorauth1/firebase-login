(function () {

  'use strict';

  /*global define, module, exports, require */

  /* istanbul ignore next */
  var angular = window.angular ? window.angular : 'undefined' !== typeof require ? require('angular') : undefined;

  var circular = angular.module('angularCircularNavigation', [])
    .directive('circular', ['$compile', '$timeout', function ($compile, $timeout) {

      return {
        restrict: 'E',
        scope: {
          passedOptions: '=',
          passedIndex: '@',
          passedComponent: '='
        },
        template: '<div ng-mouseenter="toggleMenu()" ng-mouseleave="hideIt()"><button class="cn-button {{options.button.size}}" ng-style="{background: options.button.background ? \'{{options.button.background}}\' : \'{{options.background}}\', color: options.button.color ? \'{{options.button.color}}\' : \'{{options.color}}\'}"><span ng-class="options.button.cssClass"></span><div class="clearfix"></div><p class="text-small" ng-text-truncate="passedComponent.type" ng-tt-chars-threshold="10" ng-tt-no-toggling></p></button>' +
          '<div class="cn-wrapper {{options.size}} items-{{options.items.length}}" ng-class="{\'opened-nav\': options.isOpen}"><ul>' +
          '<li ng-repeat="item in options.items">' +
          '<a ng-hide="item.empty" ng-click="perform(options, item)" ng-class="{\'is-active\': item.isActive}" class="{{item.cssClass}}" ng-style="{background: item.background ? \'{{item.background}}\' : \'{{options.background}}\', color: item.color ? \'{{item.color}}\' : \'{{options.color}}\'}">' +
          '<span ng-bind-html="item.content"></span></div>' +
          '</a></li></ul></div>',
        link: function (scope, $element, $attrs) {
          scope.options = angular.copy(scope.passedOptions);
          scope.component = angular.copy(scope.passedComponent);

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
              item.onclick(options, item, scope.component, scope.passedIndex);
            }

            if (scope.options.toggleOnClick) {
              scope.toggleMenu();
            }
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
