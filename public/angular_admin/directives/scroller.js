define(['angularAMD'], function (angularAMD) {
    angularAMD.directive('indiscroller', function() {
        return {
            restrict: 'A',
            scope: {
              updateFn: '=indiscrollerUpdate'
            },
            link: function (scope, elem, attrs) {
                rawElement = elem[0];
                elem.bind('scroll', function () {
                    if((rawElement.scrollTop + rawElement.offsetHeight + 1000 ) >= rawElement.scrollHeight){
                        scope.updateFn(rawElement.scrollTop);
                        scope.$apply('customerScrollFn()');
                    }
                });
            }
        };
    });
});
