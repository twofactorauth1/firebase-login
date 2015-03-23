define(['angularAMD'], function (angularAMD) {
    angularAMD.directive('indiscroller', function() {
        return {
            restrict: 'A',
            scope: {
              scrollFn: '=indiscrollerUpdate',
              savePosFn: '=indiscrollerSave'
            },
            link: function (scope, elem, attrs) {
              console.log(scope.indiscrollerUpdate);
                rawElement = elem[0];
                elem.bind('scroll', function () {
                    if((rawElement.scrollTop + rawElement.offsetHeight + 1000 ) >= rawElement.scrollHeight){
                        scope.scrollFn();
                        scope.savePosFn();
                    }
                });
            }
        };
    });
});
