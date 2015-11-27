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
    'ngMask',
    'angular-parallax',
    'config',
    'dm.style',
    'duScroll',
    'mrPageEnterAnimate',
    'angularMoment',
    'mgo-angular-wizard',
    'timer',
    'ui',
    'ui.bootstrap',
    "com.2fdevs.videogular",
    "com.2fdevs.videogular.plugins.controls",
    "com.2fdevs.videogular.plugins.overlayplay",
    "com.2fdevs.videogular.plugins.buffering",
    "com.2fdevs.videogular.plugins.poster",
    "truncate",
    'angular-jqcloud',
    'socialLinks',
    'slick',
    'ngMap',
    'wu.masonry'
  ])
  .config(['$routeProvider', '$locationProvider', '$httpProvider', function ($routeProvider, $locationProvider, $httpProvider) {
    //$locationProvider.html5Mode(true);
    if (window.history && window.history.pushState) {
      $locationProvider.html5Mode(true).hashPrefix('!');
    }
    $httpProvider.interceptors.push('noCacheInterceptor');
    $routeProvider
      .when('/', {
        templateUrl: '../views/cache.html',
        controller: 'CacheCtrl as cacheCtrl'
      })
      .when('/404', {
        templateUrl: '../views/404.html',
        controller: 'NotFoundCtrl as notfound'
      })
        .when('/cached/:page', {
            controller: 'CacheCtrl as cacheCtrl',
            templateUrl: '../views/cache.html'
        })

      .otherwise({
            templateUrl: '../views/main.html',
            controller: 'LayoutCtrl as layout'
      });

  }]).factory('noCacheInterceptor', function () {
      return {
        request: function (config) {
            if(config.method=='GET' && config.url.indexOf('/api/') === 0 ){
                var separator = config.url.indexOf('?') === -1 ? '?' : '&';
                config.url = config.url+separator+'noCache=' + new Date().getTime();
            }
            return config;
        }
     };
  })
.run(function ($rootScope, $location, $anchorScroll, $routeParams, $document, $timeout, ipCookie, analyticsService) {

    var runningInterval;

    analyticsService.sessionStart(function (data) {});

    $rootScope.app = {
      isMobile: (function () { // true if the browser is a mobile device
        var check = false;
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
          check = true;
        };
        return check;
      })()
    };


    $rootScope.$on("$routeChangeStart", function (scope, next, current) {
      var self = this;
    });

    $rootScope.$on("$routeChangeSuccess", function (scope, next, current) {
      // $rootScope.transitionState = "active";
      analyticsService.pageStart(function () {
        var editorIndex = window.location.search.indexOf("editor=true");
        if (editorIndex == -1) {
          analyticsService.pagePing();
          clearInterval(runningInterval);

          var counter = 0;
          //every 15 seconds send page tracking data
          runningInterval = setInterval(function () {
            analyticsService.pagePing();
            counter++;

            if (counter >= (1000 * 60 * 60)) {
              clearInterval(runningInterval);
            }
          }, 15000);
        }
      });
    });


  })
  .run(function ($rootScope, $location) {
    $rootScope.$on('duScrollspy:becameActive', function ($event, $element) {
      //Automaticly update location
      var hash = $element.prop('hash');
      if (hash) {
        $location.hash(hash.substr(1)).replace();
        $rootScope.$apply();
      }
    });
  });
  mainApp.constant('formValidations', {
   //'email': /^[_a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/,
   'email': /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i,
   'phone': /^\(?(\d{3})\)?[ .-]?(\d{3})[ .-]?(\d{4})$/,
   'zip': /(^\d{5}$)|(^\d{5}-\d{4}$)/,
   'extension': /^[0-9]*$/
  });
