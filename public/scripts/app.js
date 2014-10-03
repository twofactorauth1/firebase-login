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
        'duScroll',
        'mrPageEnterAnimate',
        'angularMoment',
        'mgo-angular-wizard',
        'iso.directives',
        'timer',
        'google-maps'
    ])
    .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
        if(window.history && window.history.pushState){
            $locationProvider.html5Mode(true).hashPrefix('!');
          }
        $routeProvider
            .when('/', {
                templateUrl: '../views/main.html',
                controller: 'LayoutCtrl as layout'
            })
            .when('/blog', {
                templateUrl: '../views/blog.html',
                controller: 'BlogCtrl as blog'
            })
            .when('/blog/:postname', {
                templateUrl: '../views/blog.html',
                controller: 'BlogCtrl as blog'
            })
            .when('/tag/:tagname', {
                templateUrl: '../views/blog.html',
                controller: 'BlogCtrl as blog'
            })
            .when('/category/:catname', {
                templateUrl: '../views/blog.html',
                controller: 'BlogCtrl as blog'
            })
            .when('/author/:authorname', {
                templateUrl: '../views/blog.html',
                controller: 'BlogCtrl as blog'
            })
            .when('/page/:pagename', {
                templateUrl: '../views/main.html',
                controller: 'LayoutCtrl as layout'
            })
            .otherwise({redirectTo: '/'});
    }])
    .controller('LayoutCtrl', function($scope, parallaxHelper){
        $scope.background = parallaxHelper.createAnimator(-0.3, 150, -150);
    })
    .run(function( $rootScope, $location, $anchorScroll, $routeParams, $document, $timeout) {
        $rootScope.$on("$routeChangeSuccess", function (scope, next, current) {
            $rootScope.transitionState = "active"
        });
        $rootScope.$on('$viewContentLoaded', function(scope, newRoute, oldRoute) {

          var loc = $location.hash();
          var top = 400;
          var duration = 2000;
          var offset = 0;
          addEventListener('load', load, false);

          function load(){
              var someElement = angular.element(document.getElementById(loc));
              if ($location.hash()) {
                $document.scrollToElement(someElement, offset, duration);
              }
              $rootScope.$apply();
          }
        });
    })
    .run(function($rootScope, $location){
      $rootScope.$on('duScrollspy:becameActive', function($event, $element){
        //Automaticly update location
        var hash = $element.prop('hash');
        if(hash) {
          $location.hash(hash.substr(1)).replace();
          $rootScope.$apply();
        }
      });
    });


