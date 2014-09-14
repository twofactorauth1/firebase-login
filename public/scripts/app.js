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
        'angular-parallax',
        'config',
        'dm.style',
        'angularMoment'
    ])
    .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
        // if(window.history && window.history.pushState){
        //     $locationProvider.html5Mode(true);
        //   }
        $routeProvider
            .when('/', {
                templateUrl: '../views/main.html',
                controller: 'LayoutCtrl as layout'
            })
            .when('/blog', {
                templateUrl: '../views/main.html',
                controller: 'LayoutCtrl as layout'
            })
            .when('/blog/:postname', {
                templateUrl: '../views/blog.html',
                controller: 'BlogCtrl as blog'
            })
            .when('/tag/:tagname', {
                templateUrl: '../views/main.html',
                controller: 'BlogCtrl as blog'
            })
            .otherwise({ redirectTo: '/' });
    }])
    .controller('LayoutCtrl', function($scope, parallaxHelper){
        $scope.background = parallaxHelper.createAnimator(-0.3, 150, -150);
    });


    // $stateProvider
        //     .state('main', {
        //         url: '/',
        //         templateUrl: 'views/main.html',
        //         controller: 'LayoutCtrl as layout'
        //     })
        //     .state('about', {
        //         url: '/about',
        //         templateUrl: 'views/about.html',
        //         controller: 'MainCtrl'
        //     })
        //     .state('blog', {
        //         url: '/blog',
        //         templateUrl: 'views/main.html',
        //         controller: 'LayoutCtrl as layout'
        //     })
        //     .state('/blog/:postname', {
        //         templateUrl: 'views/main.html',
        //         controller: 'LayoutCtrl as layout'
        //     });
        // $routeProvider.otherwise({
        //     redirectTo: '/#/'
        // });
