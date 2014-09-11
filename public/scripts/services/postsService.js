/*
 * Getting Pages Data From Database
 *
 * */
'use strict';
mainApp.factory('postsService', ['accountService', '$http', function (accountService, $http) {
    var accountObject, posts = [];
    //TODO Fetch Pages Data From DB
    return function (callback) {
        //todo get handle (page name)
        accountService(function (err, data) {
            if (err) {
                console.log(err,">>>>>>>>>>>>>accountService>>>>>>>>>>>>>");
                callback(err, null)
            } else {
                accountObject = data;
                var handle = 'blog';
                //API is getting only one page but we need page arrays
                var postsUrl = '/api/1.0/cms/blog?limit=3';

                $http.get(postsUrl)
                    .success(function (post) {
                        if (post !== null) {
                            //TODO
                            //Temp page pushing array
                            //posts[0] = post;
                            callback(null, post);
                        } else {
                            callback("post not found");
                        }
                    }).error(function (err) {
                       console.log(err,">>>>>>>>>>>post>>>>>>>>>>>>");
                        callback(err);
                    });

            }
        });

    };
}]);