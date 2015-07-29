'use strict';
/** 
 * Returns the id of the selected e-mail. 
 */
app.directive('showSettings', ['$timeout', function ($timeout) {
  return {
    restrict: 'C',
    link: function (scope, elem, attrs) {
      var promise;
      elem.on('mouseenter', function () {
        promise = $timeout(function () {
          elem.find('.component-wrap').addClass('display-settings');
        }, 800);
      });
      elem.on('mouseleave', function () {
        $timeout.cancel(promise);
        elem.find('.component-wrap').removeClass('display-settings');
      });
    }
  };
}]);
