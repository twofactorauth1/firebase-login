/*
 * Getting Pages Data From Database
 *
 * */
'use strict';
mainApp.factory('pagesService', ['websiteService','$http', '$location', function (websiteService, $http, $location) {
    var websiteObject, pages = {};

    return function (callback) {
        var path = $location.$$path.replace('/page/', '');

        if ( path == "/" || path == "" ) {
            path = "index";
        }

        if (path.indexOf("blog/") > -1) {
            path = 'single-post';
        }

        if (path.indexOf("post/") > -1) {
            path = 'single-post';
        }

        if ( path === 'blog' ||
             path === '/blog' ||
             path.indexOf("tag/") > -1 ||
             path.indexOf("category/") > -1 ||
             path.indexOf("author/") > -1 ) {
                path = 'blog';
        }

        websiteService(function (err, data) {
            if (err) {
                // console.log(err, "PageService >> WebsiteService ERROR");
                callback(err, null)
            } else if (!data) {
                    callback("data is null", null);
            } else {
                if ( _.has( pages, path ) ) {
                    callback(null, pages);
                } else {
                    websiteObject = data;
                    $http.get('/api/1.0/cms/website/' + websiteObject._id + '/page/' + path, { cache: true})
                        .success(function (page) {
                            if (page !== null) {
                                pages[page.handle] = page;
                                callback(null, pages);
                            } else {
                                callback("page not found",null);
                            }
                        }).error(function (err) {
                            // console.log("PageService >> DB-Hit >> ERROR");
                            callback(err,null);
                        });
                }
            }
        });
    };
}]);