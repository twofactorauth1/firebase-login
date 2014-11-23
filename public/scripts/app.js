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
            // .when('/page/blog', {
            //     templateUrl: '../views/blog.html',
            //     controller: 'BlogCtrl as blog'
            // })
            // .when('/page/blog/:postname', {
            //     templateUrl: '../views/singlepostpage.html',
            //     controller: 'BlogCtrl as blog'
            // })
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
            analyticsService.pageStart(function(data) {
                console.log('sessionStart return >>> ', data);
            });
        });

        $rootScope.$on("$routeChangeSuccess", function (scope, next, current) {
            // $rootScope.transitionState = "active";
            // var startPageTimer = new Date().getTime();
            // var parsedUrl = $.url(fullUrl);

            // pageProperties = {
            //     url: {
            //         source: parsedUrl.attr("source"),
            //         protocol: parsedUrl.attr("protocol"),
            //         domain: parsedUrl.attr("host"),
            //         port: parsedUrl.attr("port"),
            //         path: parsedUrl.attr("path"),
            //         anchor: parsedUrl.attr("anchor")
            //     },
            //     pageActions: [],
            //     session_start: startPageTimer,
            //     session_end: 0,
            //     session_length: 0,
            // };

            // //track mouse movement
            // document.body.onmousemove = function(ev) {
            //       var now = new Date().getTime();
            //       pageProperties.pageActions.push({
            //         type: 'mm',
            //         ms:now-startPageTimer,
            //         x: ev.layerX,
            //         y: ev.layerY
            //       });
            // };

            // //track scrolling
            // window.onscroll = function () {
            //     var now = new Date().getTime();
            //     pageProperties.pageActions.push({
            //         type: 'sc',
            //         ms:now-startPageTimer,
            //         x: document.body.scrollTop
            //     });
            // };

            // //track clicks
            // document.body.onclick = function(ev) {
            //   var now = new Date().getTime();
            //   var node;
            //   if (event.target.id) {
            //     node = event.target.nodeName+'#'+event.target.id;
            //   } else if(event.target.className) {
            //     node = event.target.nodeName+'.'+event.target.className;
            //   } else {
            //     node = '';
            //   }
            //   pageProperties.pageActions.push({
            //     type: 'cl',
            //     ms:now-startPageTimer,
            //     ev: node,
            //     x: ev.layerX,
            //     y: ev.layerY
            //   });
            // };
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

          //   //start keen client
          //   var client = new Keen({
          //       projectId: "54528c1380a7bd6a92e17d29",
          //       writeKey: "c36124b0ccbbfd0a5e50e6d8c7e80a870472af9bf6e74bd11685d30323096486a19961ebf98d57ee642d4b83e33bd3929c77540fa479f46e68a0cdd0ab57747a96bff23c4d558b3424ea58019066869fd98d04b2df4c8de473d0eb66cc6164f03530f8ab7459be65d3bf2e8e8a21c34a",
          //       readKey: "bc102d9d256d3110db7ccc89a2c7efeb6ac37f1ff07b0a1f421516162522a972443b3b58ff6120ea6bd4d9dd469acc83b1a7d8a51cbb82caa89e590492e0579c8b7c65853ec1c6d6ce6f76535480f8c2f17fcb66dca14e699486efb02b83084744c68859b89f71f37ad846f7088ff96b",
          //       protocol: "https",
          //       host: "api.keen.io/3.0",
          //       requestType: "jsonp"
          //   });



            // window.onbeforeunload = function (e) {

            //     if (pages.length <= 0) {
            //         addPageData();
            //     }

            //     var end = new Date().getTime();
            //     sessionProperties["session_end"] = end;
            //     sessionProperties["pages"] = pages;
            //     sessionProperties["page_length"] = pages.length;
            //     sessionProperties["session_length"] = end-start;
            //     client.addEvent("frontsessions", sessionProperties);

            //     return 'Are you sure you want to exit?';
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


