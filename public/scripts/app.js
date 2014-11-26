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
        'ngInputDate',
        'angularFileUpload'
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
    .run(function( $rootScope, $location, $anchorScroll, $routeParams, $document, $timeout, ipCookie) {

        var firstVisit = true;
        var pageProperties;
        var sessionProperties;
        var pages = [];

        //get and parse current url
        var fullUrl = window.location.href;
        var parsedUrl = $.url(fullUrl);
        var parser = new UAParser();

        $rootScope.$on("$routeChangeStart", function (scope, next, current) {
            console.log('routeChangeStart >>> ');
            var self = this;
            if (!firstVisit) {
                var end = new Date().getTime();
                pageProperties.session_end = end;
                pageProperties.session_length = end-pageProperties.session_start;
                pages.push(pageProperties);
                sessionProperties.pages = pages;
            }
            firstVisit = false;
        });

        $rootScope.$on("$routeChangeSuccess", function (scope, next, current) {
            console.log('routeChangeSuccess >>> ');
            $rootScope.transitionState = "active";
            var startPageTimer = new Date().getTime();

            pageProperties = {
                url: {
                    source: parsedUrl.attr("source"),
                    protocol: parsedUrl.attr("protocol"),
                    domain: parsedUrl.attr("host"),
                    port: parsedUrl.attr("port"),
                    path: parsedUrl.attr("path"),
                    anchor: parsedUrl.attr("anchor")
                },
                pageActions: [],
                session_start: startPageTimer,
                session_end: 0,
                session_length: 0,
            };

            //track mouse movement
            document.body.onmousemove = function(ev) {
                  var now = new Date().getTime();
                  pageProperties.pageActions.push({
                    type: 'mm',
                    ms:now-startPageTimer,
                    x: ev.layerX,
                    y: ev.layerY
                  });
            };

            //track scrolling
            window.onscroll = function () {
                var now = new Date().getTime();
                pageProperties.pageActions.push({
                    type: 'sc',
                    ms:now-startPageTimer,
                    x: document.body.scrollTop
                });
            };

            //track clicks
            document.body.onclick = function(ev) {
              var now = new Date().getTime();
              var node;
              if (event.target.id) {
                node = event.target.nodeName+'#'+event.target.id;
              } else if(event.target.className) {
                node = event.target.nodeName+'.'+event.target.className;
              } else {
                node = '';
              }
              pageProperties.pageActions.push({
                type: 'cl',
                ms:now-startPageTimer,
                ev: node,
                x: ev.layerX,
                y: ev.layerY
              });
            };
        });

        $rootScope.$on('$viewContentLoaded', function(scope, newRoute, oldRoute) {

          addEventListener('load', load, false);

          function load(){
              var someElement = angular.element(document.getElementById(loc));
              if ($location.hash()) {
                $document.scrollToElement(someElement, offset, duration);
              }
              $rootScope.$apply();
          };

                var loc = $location.hash();
                var top = 400;
                var duration = 2000;
                var offset = 0;

                var start = new Date().getTime();

                //Set the amount of time a session should last.
                var sessionExpireTime = new Date();
                sessionExpireTime.setMinutes(sessionExpireTime.getMinutes()+30);

                //Check if we have a session cookie:
                var session_cookie = ipCookie("session_cookie");

                //If it is undefined, set a new one.
                if(session_cookie == undefined){
                    ipCookie("session_cookie", {
                        id: Math.uuid()
                    }, {
                        expires: sessionExpireTime,
                        path: "/" //Makes this cookie readable from all pages
                    });
                }
                //If it does exist, delete it and set a new one with new expiration time
                else{
                    ipCookie.remove("session_cookie", {
                        path: "/"
                    });
                    ipCookie("session_cookie", session_cookie, {
                        expires: sessionExpireTime,
                        path: "/"
                    });
                }

                var permanent_cookie = ipCookie("permanent_cookie");

                //If it is undefined, set a new one.
                if(permanent_cookie == undefined){
                    ipCookie("permanent_cookie", {
                        id: Math.uuid()
                    }, {
                        expires: 3650, //10 year expiration date
                        path: "/" //Makes this cookie readable from all pages
                    });
                }

                //determine if the device is mobile or not
                var device;
                var isMobile = {
                    Android: function() {
                        return navigator.userAgent.match(/Android/i);
                    },
                    BlackBerry: function() {
                        return navigator.userAgent.match(/BlackBerry/i);
                    },
                    iOS: function() {
                        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
                    },
                    Opera: function() {
                        return navigator.userAgent.match(/Opera Mini/i);
                    },
                    Windows: function() {
                        return navigator.userAgent.match(/IEMobile/i) || navigator.userAgent.match(/WPDesktop/i);
                    },
                    any: function() {
                        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
                    }
                };

                if( isMobile.any() ) {
                    device = 'mobile';
                } else {
                    device = 'desktop'
                }

                //get browser fingerprint
                var fingerprint = new Fingerprint().get();


                //all the properties of the session
                sessionProperties = {
                    session_id: ipCookie("session_cookie")["id"],
                    permanent_tracker: ipCookie("permanent_cookie")["id"],
                    keen : {
                        addons : [
                            {
                                name : "keen:ip_to_geo",
                                input : {
                                    ip : "ip_address"
                                },
                                output : "ip_geo_info"
                            }
                        ]
                    },
                    user_agent: {
                        browser: parser.getBrowser(),
                        engine: parser.getEngine(),
                        os: parser.getOS(),
                        device: device
                    },
                    ip_address : "${keen.ip}",
                    fingerprint: fingerprint,
                    session_start: start,
                    pages: []
                };

                /*
                //If you know that the user is currently logged in, add information about the user.
                sessionProperties["user"] = {
                    id: "",
                    signupDate: ""
                    etc: ".."
                };
                */

                //TODO: determine if the user is logged into any social sites

                //Add information about the referrer of the same format as the current page
                var referrer = document.referrer;
                var referrerObject = null;

                if(referrer != undefined){
                    var parsedReferrer = $.url(referrer);

                    referrerObject = {
                        source: parsedReferrer.attr("source"),
                        protocol: parsedReferrer.attr("protocol"),
                        domain: parsedReferrer.attr("host"),
                        port: parsedReferrer.attr("port"),
                        path: parsedReferrer.attr("path"),
                        anchor: parsedReferrer.attr("anchor")
                    }
                }

                sessionProperties["referrer"] = referrerObject;

                //start keen client
                var client = new Keen({
                    projectId: "54528c1380a7bd6a92e17d29",
                    writeKey: "c36124b0ccbbfd0a5e50e6d8c7e80a870472af9bf6e74bd11685d30323096486a19961ebf98d57ee642d4b83e33bd3929c77540fa479f46e68a0cdd0ab57747a96bff23c4d558b3424ea58019066869fd98d04b2df4c8de473d0eb66cc6164f03530f8ab7459be65d3bf2e8e8a21c34a",
                    readKey: "bc102d9d256d3110db7ccc89a2c7efeb6ac37f1ff07b0a1f421516162522a972443b3b58ff6120ea6bd4d9dd469acc83b1a7d8a51cbb82caa89e590492e0579c8b7c65853ec1c6d6ce6f76535480f8c2f17fcb66dca14e699486efb02b83084744c68859b89f71f37ad846f7088ff96b",
                    protocol: "https",
                    host: "api.keen.io/3.0",
                    requestType: "jsonp"
                });

                window.onbeforeunload = function (e) {

                    var end = new Date().getTime();
                    sessionProperties["session_end"] = end;
                    sessionProperties["pages"] = pages;
                    sessionProperties["page_length"] = pages.length;
                    sessionProperties["session_length"] = end-start;
                    client.addEvent("frontsessions", sessionProperties);

                    return 'Are you sure you want to exit?';
                };
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


