/*
 * Getting Pages Data From Database
 *
 * */
'use strict';
mainApp.factory('pagesService', ['websiteService', '$http', function (websiteService, $cacheFactory, $http) {
    var websiteObject, pages = [];

    return function (callback) {
        //todo get handle (page name)
        websiteService(function (err, data) {
            if (err) {
                console.log(err, "PageService >> WebsiteService ERROR");
                callback(err, null)
            } else {
                if (pages.length != 0) {
                    console.log('Getting PageData From cache ');
                    console.log(null, pages);
                    callback(null, pages);
                } else {
                    websiteObject = data;
                    //API is getting only one page but we need page arrays
                    $http.get('/api/1.0/cms/website/' + websiteObject._id + '/pages')
                        .success(function (page) {
                            console.log('Getting PageData From Database');
                            if (page !== null) {
                                //TODO
                                //Temp page pushing array
                                pages[0] = page;
                                callback(null, pages);
                            } else {
                                callback("page not found",null);
                            }
                        }).error(function (err) {
                            console.log(err, "PageService >> DB-Hit >> ERROR");
                            callback(err,null);
                        });
                }
            }
        });
    };
}]);