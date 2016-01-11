'use strict';
/*global mainApp*/
mainApp.factory('pagesService', ['$http', '$location', '$cacheFactory', function ($http, $location, $cacheFactory) {
    var apiURL = '/api/2.0/cms/website/';
    var pages = {};
    var pagecache = $cacheFactory('pages');
    //take advantage of precache
    if(window.indigenous && window.indigenous.precache && window.indigenous.precache.pages) {
        var page = window.indigenous.precache.pages;
        pages[page.handle] = page;
        delete window.indigenous.precache.pages;

    }

    return function (websiteId, callback) {
        var path = $location.$$path.replace('/page/', '');

        if (path === "/" || path === "") {
            path = "index";
        }

        if (path === "/signup") {
            path = "signup";
        }

        if (path.indexOf("blog/") > -1) {
            path = 'single-post';
        }

        if (path.indexOf("post/") > -1) {
            path = 'single-post';
        }

        if (path === 'blog' || path === '/blog' || path.indexOf("tag/") > -1 || path.indexOf("category/") > -1 || path.indexOf("author/") > -1) {
            path = 'blog';
        }

        if (path.indexOf('/') === 0) {
            path = path.replace('/', '');
        }


        var _pages = pagecache.get('pages');
        if (_pages) {
            var _path = path;
            if (path.indexOf('/') !== -1) {
                _path = path.replace('/', '');
            }
            var _matchingPage = _.find(_pages, function (_page) {
                return _page.handle === _path;
            });
            if (_matchingPage) {
                return callback(null, _matchingPage);
            }
        }

        return $http.get(apiURL + websiteId + '/page/' + path, {
            cache: true
        }).success(function (page) {
            if (page !== null && page.accountId) {
                $http.get(apiURL + websiteId + '/pages')
                    .success(function (pages) {
                        pagecache.put('pages', pages);
                    });
                callback(null, page);
            } else if (page !== null && path === 'index') {
                $http.get(apiURL + websiteId + '/page/coming-soon', {
                    cache: true
                }).success(function (page) {
                    if (page !== null) {
                        pages[page.handle] = page;
                        callback(null, page);
                    } else {
                        callback("page not found", null);
                    }
                }).error(function (err) {
                    // console.log("PageService >> DB-Hit >> ERROR");
                    callback(err, null);
                });
            } else {
                callback("page not found", null);
            }
        }).error(function (err) {
            if(path === 'index') {
                //we have no index page... look for a coming-soon page.
                $http.get(apiURL + websiteId + '/page/coming-soon', {
                    cache: true
                }).success(function (page) {
                    if (page !== null) {
                        pages[page.handle] = page;
                        callback(null, page);
                    } else {
                        callback("page not found", null);
                    }
                }).error(function (err) {
                    // console.log("PageService >> DB-Hit >> ERROR");
                    callback(err, null);
                });
            } else {
                // console.log("PageService >> DB-Hit >> ERROR");
                callback(err, null);
            }

        });
    };
}]);