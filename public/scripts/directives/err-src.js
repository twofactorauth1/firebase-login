'use strict';
/**
 * Any element that gets a 404 image get replaced
 */
app.directive('errSrc', function () {
  return {
    scope: {
      errSrc: '@'
    },
    link: function (scope, element, attrs) {

      
      scope.$watch(function () {
        return attrs['ngSrc'];
      }, function (value) {
        if(!value)
        {
           element.attr('src', scope.errSrc);
        }
      });

      element.bind('error', function () {
        if (scope.errSrc.length > 0) {
          element.attr('src', scope.errSrc);
        }
      });
    }
  }
});
