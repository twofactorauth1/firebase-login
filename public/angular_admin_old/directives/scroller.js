define(['angularAMD'], function(angularAMD) {
  angularAMD.directive('indiscroller', function() {
    return {
      restrict: 'A',
      scope: {
        scrollFn: '=indiscrollerUpdate',
        savePosFn: '=indiscrollerSave'
      },
      link: function(scope, elem, attrs) {
        console.log(scope.indiscrollerUpdate);
        rawElement = elem[0];
        elem.bind('scroll', function() {
          var scrollGap = scope.$parent.scrollGap || 1000;
          if ((rawElement.scrollTop + rawElement.offsetHeight + scrollGap) >= rawElement.scrollHeight) {           
            scope.scrollFn();
            scope.savePosFn(rawElement.scrollTop);
          }
        });
      }
    };
  });
});
