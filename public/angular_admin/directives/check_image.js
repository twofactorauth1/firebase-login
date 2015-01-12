define(['angularAMD'], function(angularAMD) {'use strict'
angularAMD.directive('errSrc', function($compile) {
  return {
    link: function(scope, element, attrs) {
      scope.$watch(function() {
          return attrs['ngSrc'];
      });
      element.bind('error', function() {
        if(attrs.pageScope)
        {
          if(scope.$parent.page)
            scope.$parent.page.screenshot = "";
        }
        else if(attrs.errSrc)
        {
          var html = attrs.errSrc;
          var e = $compile(html)(scope);
          element.replaceWith(e);
        }        
      });
    }
  }
});
});