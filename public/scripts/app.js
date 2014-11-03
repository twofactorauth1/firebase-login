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
        'ui',
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
//            .when('/blog/:postname', {
//                templateUrl: '../views/blog.html',
//                controller: 'BlogCtrl as blog'
//            })
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
    .run(function( $rootScope, $location, $anchorScroll, $routeParams, $document, $timeout) {
        var client = new Keen({
            projectId: "54528c1380a7bd6a92e17d29",       // String (required)
            writeKey: "c36124b0ccbbfd0a5e50e6d8c7e80a870472af9bf6e74bd11685d30323096486a19961ebf98d57ee642d4b83e33bd3929c77540fa479f46e68a0cdd0ab57747a96bff23c4d558b3424ea58019066869fd98d04b2df4c8de473d0eb66cc6164f03530f8ab7459be65d3bf2e8e8a21c34a", // String (required for sending data)
            readKey: "bc102d9d256d3110db7ccc89a2c7efeb6ac37f1ff07b0a1f421516162522a972443b3b58ff6120ea6bd4d9dd469acc83b1a7d8a51cbb82caa89e590492e0579c8b7c65853ec1c6d6ce6f76535480f8c2f17fcb66dca14e699486efb02b83084744c68859b89f71f37ad846f7088ff96b",   // String (required for querying data)
            protocol: "https",                  // String (optional: https | http | auto)
            host: "api.keen.io/3.0",            // String (optional)
            requestType: "jsonp"                // String (optional: jsonp, xhr, beacon)
        });
        var start = Date.now();
        window.onbeforeunload = function(event) {
          console.log('before onload');
            var end = Date.now();
            var length = end - start;
            console.log('length >>> ', length);

            var session_event = {
                session: {
                  session_start: start,
                  session_end: end,
                  session_length: length
                },
                visitor: {
                  referrer: document.referrer,
                  ip_address: "${keen.ip}",
                  user_agent: "${keen.user_agent}"
                },
                keen: {
                  timestamp: new Date().toISOString(),
                  addons: [
                    { name:"keen:ip_to_geo", input: { ip:"visitor.ip_address" }, output:"visitor.geo" },
                    { name:"keen:ua_parser", input: { ua_string:"visitor.user_agent" }, output:"visitor.tech" }
                  ]
                }
            };
            client.addEvent("sessions", session_event);
        };
        $rootScope.$on("$routeChangeSuccess", function (scope, next, current) {
            $rootScope.transitionState = "active";

            var visit = {
                     page: {
                      title: document.title,
                      host: document.location.host,
                      href: document.location.href,
                      path: document.location.pathname,
                      protocol: document.location.protocol.replace(/:/g, ""),
                      query: document.location.search
                    },
                    visitor: {
                      referrer: document.referrer,
                      ip_address: "${keen.ip}",
                      // tech: {} //^ created by ip_to_geo add-on
                      user_agent: "${keen.user_agent}"
                      // visitor: {} //^ created by ua_parser add-on
                    },
                    keen: {
                      timestamp: new Date().toISOString(),
                      addons: [
                        { name:"keen:ip_to_geo", input: { ip:"visitor.ip_address" }, output:"visitor.geo" },
                        { name:"keen:ua_parser", input: { ua_string:"visitor.user_agent" }, output:"visitor.tech" }
                      ]
                    }
                };
            client.addEvent("pageviews", visit);
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


