define(['angularAMD'], function(angularAMD) {'use strict'
angularAMD.directive('errSrc', function($compile) {
  return {
    link: function(scope, element, attrs) {

      scope.$watch(function() {
          return attrs['ngSrc'];
        }, function (value) {
          if (!value) {
            element.attr('src', attrs.errSrc);  
          }
      });

      element.bind('error', function() {
          var html = attrs.errSrc;
          var e = $compile(html)(scope);
          element.replaceWith(e);
      });
    }
  }
});
});