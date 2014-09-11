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
        'ui.router',
        'angular-parallax',
        'config'
    ])
    .config(function ($stateProvider, $routeProvider) {
        // $routeProvider
        //     .when('', {
        //         templateUrl: 'views/main.html',
        //         controller: 'LayoutCtrl as layout'
        //     })
        //     .when('/about', {
        //         templateUrl: 'views/about.html',
        //         controller: 'MainCtrl'
        //     })
        //     .when('/blog', {
        //         templateUrl: 'views/main.html',
        //         controller: 'LayoutCtrl as layout'
        //     }).when('/blog/:postname', {
        //         templateUrl: 'views/main.html',
        //         controller: 'LayoutCtrl as layout'
        //     });
        $stateProvider
            .state('main', {
                url: '',
                templateUrl: 'views/main.html',
                controller: 'LayoutCtrl as layout'
            })
            .state('about', {
                url: '/about',
                templateUrl: 'views/about.html',
                controller: 'MainCtrl'
            })
            .state('blog', {
                url: '/blog',
                templateUrl: 'views/main.html',
                controller: 'LayoutCtrl as layout'
            })
            .state('/blog/:postname', {
                templateUrl: 'views/main.html',
                controller: 'LayoutCtrl as layout'
            });
        $routeProvider.otherwise({
            redirectTo: '/#/'
        });
    })
    .controller('LayoutCtrl', function($scope, parallaxHelper){
        $scope.background = parallaxHelper.createAnimator(-0.3, 150, -150);
    });