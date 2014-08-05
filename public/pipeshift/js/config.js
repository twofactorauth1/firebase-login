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

        var app = angular.module('app');
        app.config(['$routeProvider', '$locationProvider', '$httpProvider', function ($routeProvider, $locationProvider, $httpProvider) {
            $routeProvider
                .when('/admin/pipeshift/', {
                    templateUrl: '/pipeshift/views/home.html',
                    controller: 'HomeController'
                })
                .when('/admin/pipeshift/profile/', {
                    templateUrl: '/pipeshift/views/profile.html',
                    controller: 'ProfileController'
                })
                .when('/admin/pipeshift/editor/', {
                    templateUrl: '/pipeshift/views/video/listeditor.html',
                    controller: 'ListEditorController'
                })
                .otherwise({ redirectTo: '/admin/pipeshift/' });
            ;
            $locationProvider.html5Mode(true);

            //interceptor

            var interceptor =
                function ($q, $rootScope, $location) {
                    return {
                        'responseError': function (rejection) { // Handle errors
                            switch (rejection.status) {
                                case 401:
                                    if (rejection.config.url !== '/login' && $location.path() !== '/') {
                                        // If we're not on the login page
                                        $rootScope.$broadcast('auth:loginRequired');
                                    }
                                    break;
                                case 403:
                                    $rootScope.$broadcast('auth:forbidden');
                                    break;
                            }
                            return $q.reject(rejection);
                        }
                    }
                }
            //
            $httpProvider.interceptors.push(interceptor);
        }]);
//        //CORS
//        app.config(function ($httpProvider) {
//            $httpProvider.defaults.useXDomain = true;
//            delete $httpProvider.defaults.headers
//                .common['X-Requested-With'];
//        });
        ;
    }
))
;
