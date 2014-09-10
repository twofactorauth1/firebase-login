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
        'angular-parallax'
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
            })
            .state('blog', {
                url: '/blog',
                templateUrl: 'views/blog.html',
                controller: 'BlogCtrl'
            });
        $routeProvider.otherwise({
            redirectTo: '/#/'
        });
    })
    .controller('LayoutCtrl', function($scope, parallaxHelper){
        $scope.background = parallaxHelper.createAnimator(-0.3, 150, -150);
    });