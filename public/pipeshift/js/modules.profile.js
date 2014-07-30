(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // Register as an anonymous AMD module:
        define([
            'jquery',
            'angular'
        ], factory);
    } else {
        factory();
    }
}(function () {
        'use strict';

        angular.module('app.modules.profile', [])
            .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
                $routeProvider
                    .when('/profile', {
                        templateUrl: 'profile/view',
                        controller: 'ProfileController'
                    })
                ;
                $locationProvider.html5Mode(true);
            }]);

    }
));
