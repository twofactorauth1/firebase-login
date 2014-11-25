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
        'ipCookie',
        'ngResource',
        'ngRoute',
        'ngSanitize',
        'ngTouch',
        'angular-parallax',
        'config',
        'dm.style',
        'coursePreview',
        'duScroll',
        'mrPageEnterAnimate',
        'angularMoment',
        'mgo-angular-wizard',
        'iso.directives',
        'timer',
        'ui',
        'ui.bootstrap',
        "com.2fdevs.videogular",
        "com.2fdevs.videogular.plugins.controls",
        "com.2fdevs.videogular.plugins.overlayplay",
        "com.2fdevs.videogular.plugins.buffering",
        "com.2fdevs.videogular.plugins.poster",
        "ngTagsInput",
        'ngInputDate'
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
                templateUrl: '../views/singlepostpage.html',
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
            .when('/signup', {
                templateUrl: '../views/main.html',
                controller: 'LayoutCtrl as layout'
            })
            .otherwise({redirectTo: '/'});
    }])
    .controller('LayoutCtrl', function($scope, parallaxHelper){
        $scope.background = parallaxHelper.createAnimator(-0.3, 150, -150);
    })
    .run(function( $rootScope, $location, $anchorScroll, $routeParams, $document, $timeout, ipCookie, analyticsService) {

        analyticsService.sessionStart(function(data) {
        });


        // var addPageData = function() {
        //     if (!firstVisit) {
        //         var end = new Date().getTime();
        //         pageProperties.session_end = end;
        //         pageProperties.session_length = end-pageProperties.session_start;
        //         pages.push(pageProperties);
        //         sessionProperties.pages = pages;
        //     }
        //     firstVisit = false;
        // };

        $rootScope.$on("$routeChangeStart", function (scope, next, current) {
            var self = this;
        });

        $rootScope.$on("$routeChangeSuccess", function (scope, next, current) {
            // $rootScope.transitionState = "active";
            analyticsService.pageStart();

            //every 15 seconds send page tracking data
        });

        $rootScope.$on('$viewContentLoaded', function(scope, newRoute, oldRoute) {

          // addEventListener('load', load, false);

          // function load(){
          //     var someElement = angular.element(document.getElementById(loc));
          //     if ($location.hash()) {
          //       $document.scrollToElement(someElement, offset, duration);
          //     }
          //     $rootScope.$apply();
          // };

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


