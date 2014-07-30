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

        angular.module('app.modules.home', [])
            .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
                $routeProvider
                    .when('/', {
                        templateUrl: 'views/home.html',
                        controller: 'HomeController'
                    })
                ;
                $locationProvider.html5Mode(true);
            }]);

    }
));
