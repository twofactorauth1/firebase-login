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
        
        'angular-jqcloud',
        '720kb.socialshare',
        'slick',
        'wu.masonry',
        'slugifier',
        'LocalStorageModule',
        'ngMap',
        'ngTextTruncate'
    ])
    .config(['$routeProvider', '$locationProvider', '$httpProvider', 'localStorageServiceProvider', function ($routeProvider, $locationProvider, $httpProvider, localStorageServiceProvider) {
        //$locationProvider.html5Mode(true);
        if (window.history && window.history.pushState) {
            $locationProvider.html5Mode(true).hashPrefix('!');
        }
        //$httpProvider.interceptors.push('noCacheInterceptor');
        $routeProvider
            .when('/', {
                /*
                templateUrl: '../views/cache.html',
                controller: 'CacheCtrl as cacheCtrl'
                */
                /*
                 templateUrl: '../views/main.html',
                 controller: 'LayoutCtrl as layout'
                */
                /*
                templateUrl: '/template/index',
                controller: 'CacheCtrl as cacheCtrl'
                */
                template: function(urlattr) {
                    var s = '<div class="main-include" ssb-data-styles data-ng-include="';
                    if(window.indigenous.defaultBlog === 1) {
                        s += " '/template/blog-list";
                    } else {
                        s += " '/template/index";
                    }
                    if(urlattr.cachebuster) {
                        s+='?cachebuster=' + urlattr.cachebuster;
                    }
                    s+= "'";
                    s += ' "></div>';
                    return s;
                },
                controller: 'CacheCtrl as cacheCtrl',
                reloadOnSearch: false
            })
            .when('/404', {
                templateUrl: '../views/404.html',
                controller: 'NotFoundCtrl as notfound'
            })
            .when('/blog', {
                template: function(urlattr) {
                    var _pageName = 'blog';
                    if(window.indigenous.ssbBlog === true) {
                        _pageName = 'blog-list';
                    }
                    var s = '<div class="main-include" ssb-data-styles data-ng-include="';
                    s += " '/template/" + _pageName;
                    if(urlattr.cachebuster) {
                        s+='?cachebuster=' + urlattr.cachebuster;
                    }
                    s+= "'";
                    s += ' "></div>';
                    return s;
                },
                controller: 'CacheCtrl as cacheCtrl'
            })
            .when('/page/blog/:postName', {
                template: function(urlattr) {
                    if(window.indigenous.ssbBlog === true) {
                        return '<div data-ng-include="\'blogpost.html\'"></div>';
                    } else {
                        var s = '<div data-ng-include="';
                        s += " '/template/single-post";
                        if(urlattr.cachebuster) {
                            s+='?cachebuster=' + urlattr.cachebuster;
                        }
                        s+= "'";
                        s += ' "></div>';
                        return s;
                    }
                },
                controller: 'CacheCtrl as cacheCtrl'
            })
            .when('/author/:author', {
                template: function(urlattr) {
                    var _pageName = 'blog';
                    if(window.indigenous.ssbBlog === true) {
                        _pageName = 'blog-list';
                    }

                    var s = '<div class="main-include" ssb-data-styles data-ng-include="';
                    s += " '/template/" + _pageName;
                    if(urlattr.cachebuster) {
                        s+='?cachebuster=' + urlattr.cachebuster;
                    }
                    s+= "'";
                    s += ' "></div>';
                    return s;
                },
                controller: 'CacheCtrl as cacheCtrl'
            })
            .when('/tag/:tag', {
                template: function(urlattr) {
                    var _pageName = 'blog';
                    if(window.indigenous.ssbBlog === true) {
                        _pageName = 'blog-list';
                    }

                    var s = '<div class="main-include" ssb-data-styles data-ng-include="';
                    s += " '/template/" + _pageName;
                        if(urlattr.cachebuster) {
                            s+='?cachebuster=' + urlattr.cachebuster;
                        }
                        s+= "'";
                        s += ' "></div>';
                        return s;
                },
                controller: 'CacheCtrl as cacheCtrl'
            })
            .when('/category/:category', {
                template: function(urlattr) {
                    var _pageName = 'blog';
                    if(window.indigenous.ssbBlog === true) {
                        _pageName = 'blog-list';
                    }

                    var s = '<div class="main-include" ssb-data-styles data-ng-include="';
                    s += " '/template/" + _pageName;
                        if(urlattr.cachebuster) {
                            s+='?cachebuster=' + urlattr.cachebuster;
                        }
                        s+= "'";
                        s += ' "></div>';
                        return s;
                },
                controller: 'CacheCtrl as cacheCtrl'
            })
            .when('/blog/:postName', {
                template: function(urlattr) {
                    if(window.indigenous.ssbBlog === true) {
                        return '<div data-ng-include="\'blogpost.html\'"></div>';
                    } else {
                        var s = '<div data-ng-include="';
                        s += " '/template/single-post";
                        if(urlattr.cachebuster) {
                            s+='?cachebuster=' + urlattr.cachebuster;
                        }
                        s+= "'";
                        s += ' "></div>';
                        return s;
                    }

                },
                controller: 'CacheCtrl as cacheCtrl'
            })
            .when('/:name', {
                template: function(urlattr) {
                    var s = '<div class="main-include" ssb-data-styles data-ng-include="';
                    s += " '/template/"+ urlattr.name.toLowerCase();
                    if(urlattr.cachebuster) {
                        s+='?cachebuster=' + urlattr.cachebuster;
                    }
                    s+= "'";
                    s += ' "></div>';
                    return s;
                },
                controller: 'CacheCtrl as cacheCtrl',
                reloadOnSearch: false
            })
            .when('/cached/:page', {
                controller: 'CacheCtrl as cacheCtrl',
                templateUrl: '../views/cache.html',
                reloadOnSearch: false
            })
            .when('/preview/:pageId', {
                controller: 'PreviewCtrl as previewCtrl',
                templateUrl: '../views/main.html',
                reloadOnSearch: false
            })
            .when('/preview/:pageId/:postId', {
                controller: 'PreviewCtrl as previewCtrl',
                templateUrl: '../views/main.html'
            })
            .when('/:name/:name_1', {
                template: function(urlattr) {
                    var s = '<div class="main-include" ssb-data-styles data-ng-include="';
                    s += " '/template/"+ urlattr.name.toLowerCase() + '/' + urlattr.name_1.toLowerCase();
                    if(urlattr.cachebuster) {
                        s+='?cachebuster=' + urlattr.cachebuster;
                    }
                    s+= "'";
                    s += ' "></div>';
                    return s;
                },
                controller: 'CacheCtrl as cacheCtrl',
                reloadOnSearch: false
            })
            .otherwise({
               template: function(urlattr) {
                   if(window.location.pathname.length>1)
                    urlattr.name=window.location.pathname.substr(1);
                    var s = '<div class="main-include" ssb-data-styles data-ng-include="';
                    s += " '/template/"+ encodeURIComponent(urlattr.name.toLowerCase());
                    if(urlattr.cachebuster) {
                        s+='?cachebuster=' + urlattr.cachebuster;
                    }
                    s+= "'";
                    s += ' "></div>';
                    return s;
                },
                controller: 'CacheCtrl as cacheCtrl',
                reloadOnSearch: false
            });

            localStorageServiceProvider.setPrefix('indi');

    }])
    // .factory('noCacheInterceptor', function () {
    //     return {
    //       request: function (config) {
    //           if(config.method=='GET' && config.url.indexOf('/api/') === 0 ){
    //               var separator = config.url.indexOf('?') === -1 ? '?' : '&';
    //               config.url = config.url+separator+'noCache=' + new Date().getTime();
    //           }
    //           return config;
    //       }
    //    };
    // })
    .run(function ($rootScope, $location, $anchorScroll, $routeParams, $document, $timeout, ipCookie, analyticsService) {

        var runningInterval;
        var isPreview = $location.$$path.indexOf("/preview/") === 0;
        var editorIndex = window.location.search.indexOf("editor=true");
        if (editorIndex == -1 && !isPreview) {
            analyticsService.sessionStart(function (data) {
            });
        }


        $rootScope.app = {
            isMobile: (function () { // true if the browser is a mobile device
                var check = false;
                if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                    check = true;
                }
                ;
                return check;
            })()
        };


        $rootScope.pageTitle = function () {
            if($rootScope.isSocialEnabled)
            {
                if(window.indigenous && window.indigenous.precache && window.indigenous.precache.siteData && window.indigenous.precache.siteData.post){
                    return window.indigenous.precache.siteData.post.post_title;
                }
            }
            else{
                return $rootScope.title;
            }
        };


        $rootScope.$on("$routeChangeStart", function (scope, next, current) {
            var self = this;
        });

        $rootScope.$on("$routeChangeSuccess", function (scope, next, current) {

            $rootScope.isSocialEnabled = $location.absUrl().search(/\/blog\/.+/) !== -1;
            if (editorIndex == -1 && !isPreview) {
                analyticsService.pageStart(function () {

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
                });
            }
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
    })
    .config(["$provide", function ($provide) {
        $provide.decorator("$exceptionHandler", ["$delegate", "$window", function($delegate, $window) {
                return function (exception, cause) {
                    if ($window.trackJs) {
                        $window.trackJs.track(exception);
                    }
                    // (Optional) Pass the error through to the delegate
                    $delegate(exception, cause);
                };
            }]);
    }]
);
mainApp.constant('formValidations', {
    //'email': /^[_a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/,
    'email': /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.([a-z]{2,})|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i,
    'phone': /^\(?(\d{3})\)?[ .-]?(\d{3})[ .-]?(\d{4})$/,
    'zip': /(^\d{5}$)|(^\d{5}-\d{4}$)/,
    'extension': /^[0-9]*$/
});
