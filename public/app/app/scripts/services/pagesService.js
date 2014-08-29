/*
 * Getting Pages Data From Database
 *
 * */
'use strict';
mainApp.factory('pagesService', 'websiteService', '$http', function (websiteService, $http) {
    console.log("pageService start")
    //TODO Fetch Pages Data From DB
    return function (callback) {
        //todo get handle (page name)
        var websiteObject, handle = 'index';
        websiteObject = websiteService();
        console.log(" api hit for page .....");
        $http.get('api/1.0/cms/website/' + websiteObject._id + '/page/' + handle).success(function (page) {
            if (page !== null) {
                console.log("===========page information=======");
                console.log(page);
                callback(null, page);
            } else {
                console.log("Request page not found");
                callback("page not found");
            }
        }).error(function (err) {
                console.log("Error while fetching info  ", err);
                callback(err);
            });
    };
});