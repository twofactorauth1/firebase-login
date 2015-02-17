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

                scope.styleWebsite = function () {
                    var iOS = ( navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false );
                    var width = "100%";
                    if (iOS) 
                        width = "99%";
                    return {
                        'height': (newValue.h)-70 + 'px',
                        'width': width
                    };
                };

                scope.styleDashboard = function () {
                    return {
                        'height': (newValue.h)-110 + 'px',
                        'width': '100%',
                        'overflow-y' : 'scroll'
                    };
                };

                scope.styleMarketingSection = function () {
                    return {
                        'height': (newValue.h)-109 + 'px',
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
                        'height': (newValue.h)-110 + 'px',
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

                scope.styleWebsiteManage = function () {
                    return {
                        'height': (newValue.h)-110 + 'px',
                        'width': '100%',
                        'overflow-y' : 'scroll'
                    };
                };

                scope.styleIndi = function () {
                    return {
                        'height': (newValue.h)-110 + 'px',
                        'width': '100%',
                        'overflow-y' : 'scroll'
                    };
                };

                scope.styleCampaignDetail = function () {
                    return {
                        'height': (newValue.h)-70 + 'px',
                        'width': '100%',
                        'overflow-y' : 'scroll'
                    };
                };

                scope.styleIndiWelcome = function () {
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