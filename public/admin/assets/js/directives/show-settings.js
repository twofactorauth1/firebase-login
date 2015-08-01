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
          elem.find('.componentActions').addClass('display-settings');
          elem.find('.add-component').addClass('display-settings');
        }, 500);
      });
      elem.on('mouseleave', function () {
        $timeout.cancel(promise);
        elem.find('.componentActions').removeClass('display-settings');
        elem.find('.add-component').removeClass('display-settings');
      });
    }
  };
}]);
