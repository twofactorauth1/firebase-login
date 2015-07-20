'use strict';
/*global mainApp*/
mainApp.factory('pagesService', ['$http', '$location', function ($http, $location) {
  var pages = {};

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


    $http.get('/api/1.0/cms/website/' + websiteId + '/page/' + path, {
      cache: true
    }).success(function (page) {
      if (page !== null && page.accountId) {
        callback(null, page);
      } else if (page !== null && path === 'index') {
        $http.get('/api/1.0/cms/website/' + websiteId + '/page/coming-soon', {
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
      // console.log("PageService >> DB-Hit >> ERROR");
      callback(err, null);
    });
  };
}]);
