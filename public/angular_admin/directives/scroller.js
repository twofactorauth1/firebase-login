define(['angularAMD'], function (angularAMD) {
    angularAMD.directive('indiscroller', function() {
        return {
            restrict: 'A',
            link: function (scope, elem, attrs) {
                rawElement = elem[0];
                elem.bind('scroll', function () {
                    if((rawElement.scrollTop + rawElement.offsetHeight + 1000 ) >= rawElement.scrollHeight){
                        scope.$apply('customerScrollFn()');
                        scope.$apply('saveScrollFn(' + rawElement.scrollTop + ')');
                    }
                });
            }
        };
    });
});
