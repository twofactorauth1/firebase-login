'use strict';

/**
 * @ngdoc overview
 * @name appApp
 * @description
 * # appApp
 *
 * Main module of the application.
 */
var mainApp = angular
    .module('mainApp', [
        'ngAnimate',
        'ngCookies',
        'ngResource',
        'ngRoute',
        'ngSanitize',
        'ngTouch',
        'ui.router'
    ])
    .config(function ($stateProvider, $routeProvider) {
        $stateProvider
            .state('/', {
                url: '/',
                templateUrl: 'views/main.html',
                controller: 'LayoutCtrl as layout'
            })
            .state('about', {
                url: '/about',
                templateUrl: 'views/about.html',
                controller: 'MainCtrl'
            });
        $routeProvider.otherwise({
            redirectTo: '/#/'
        });
    });
