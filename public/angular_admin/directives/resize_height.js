define(['angularAMD'], function (angularAMD) {
    angularAMD.directive('indigewebResize', function ($window) {
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
                        'height': (newValue.h)-68 + 'px',
                        'width': '100%',
                        'overflow' : 'hidden'
                    };
                };

                scope.styleDashboard = function () {
                    return {
                        'height': (newValue.h)-108 + 'px',
                        'width': '100%',
                        'overflow-y' : 'scroll'
                    };
                };

                scope.styleMarketing = function () {
                    return {
                        'height': (newValue.h) - 1000 + 'px',
                        'width': '100%',
                        'overflow-y' : 'scroll'
                    };
                };

                scope.styleCustomers = function () {
                    return {
                        'height': (newValue.h)-63 + 'px',
                        'width': '100%',
                        'overflow-y' : 'scroll'
                    };
                };

                scope.styleAccount = function () {
                    return {
                        'height': (newValue.h)-108 + 'px',
                        'width': '100%',
                        'overflow-y' : 'scroll'
                    };
                };

                scope.styleAccountEdit = function () {
                    return {
                        'height': (newValue.h)-63 + 'px',
                        'width': '100%',
                        'overflow-y' : 'scroll'
                    };
                };

                scope.styleCommerce = function () {
                    return {
                        'height': (newValue.h)-63 + 'px',
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