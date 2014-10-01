define(['angularAMD'], function (angularAMD) {
    angularAMD.directive('resize', function ($window) {
        return function (scope, element) {
            var w = angular.element($window);
            scope.getWindowDimensions = function () {
                return { 'h': w.height(), 'w': w.width() };
            };
            scope.$watch(scope.getWindowDimensions, function (newValue, oldValue) {
                scope.windowHeight = newValue.h;
                scope.windowWidth = newValue.w;

                scope.style = function () {
                    return { 
                        'height': (newValue.h)-125 + 'px',
                        'width': '100%',
                        'overflow' : 'hidden'
                    };
                };

                scope.styleMarketing = function () {
                    return { 
                        'height': (newValue.h)-215 + 'px',
                        'width': '100%',
                        'overflow-x' : 'hidden'
                    };
                };

                scope.styleCustomers = function () {
                    return { 
                        'height': (newValue.h)-115 + 'px',
                        'width': '100%',
                        'overflow-y' : 'scroll'
                    };
                };

            }, true);

            w.bind('resize', function () {
                scope.$apply();
            });
        }
    });
});