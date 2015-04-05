define(['angularAMD'], function (angularAMD) {
    angularAMD.directive('hoverClass', function () {
        return {
            restrict: 'A',
            scope: {
                hoverClass: '@'
            },
            link: function (scope, element) {
                element.on('mouseenter', function() {
                    element.addClass(scope.hoverClass);
                });
                element.on('mouseleave', function() {
                    element.removeClass(scope.hoverClass);
                });
            }
        };
    });
});