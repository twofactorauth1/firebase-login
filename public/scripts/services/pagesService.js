/*
 * Getting Pages Data From Database
 *
 * */
'use strict';
mainApp.factory('pagesService', ['websiteService','$http', function (websiteService, $http) {
    var websiteObject, pages = [];

    return function (callback) {
        //todo get handle (page name)
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
                if (pages.length != 0) {
                    callback(null, pages);
                } else {
                    websiteObject = data;
                    //API is getting only one page but we need page arrays
                    $http.get('/api/1.0/cms/website/' + websiteObject._id + '/pages')
                    .success(function (page) {
                            if (page !== null) {
                                //TODO
                                //Temp page pushing array
                                pages = page;
                                callback(null, page);
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