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

        websiteService(function (err, data) {
            if (err) {
                console.log(err, "PageService >> WebsiteService ERROR");
                callback(err, null)
            }
	        else if(!data)
	            {
	            	callback("data is null", null);
	            }
            else {
                // if (pages.hasOwnProperty(path)) {
                if ( _.has( pages, path ) ) {
                    console.log(pages, path);
                    console.log( _.has(pages, path));
                    console.log('++++++++++');
                    callback(null, pages);
                } else {
                    websiteObject = data;
                    //API is getting only one page but we need page arrays
                    $http.get('/api/1.0/cms/website/' + websiteObject._id + '/page/' + path, { cache: true})
                    .success(function (page) {
                            if (page !== null) {
                                //TODO
                                //Temp page pushing array
                                pages[page.handle] = page;
                                console.log(pages);
                                callback(null, pages);
                            } else {
                                callback("page not found",null);
                            }
                        }).error(function (err) {
                            console.log("PageService >> DB-Hit >> ERROR");
                            callback(err,null);
                        });
                }
            }
        });
    };
}]);