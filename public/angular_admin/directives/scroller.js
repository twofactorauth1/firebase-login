define(['angularAMD'], function (angularAMD) {
    angularAMD.directive('scroller', function() {
        return {
            restrict: 'A',
            link: function (scope, elem, attrs) {
                rawElement = elem[0]; // new
                elem.bind('scroll', function () {
                    if((rawElement.scrollTop + rawElement.offsetHeight+1000) >= rawElement.scrollHeight){ //new
                        console.log('scroll funt execute');
                        scope.$apply('customerScrollFn()');
                    }
                });
            }
        };
    });
});