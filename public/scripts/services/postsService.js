/*
 * Getting Pages Data From Database
 *
 * */
'use strict';
mainApp.factory('postsService', ['accountService', '$http', function (accountService, $http) {
    var that = this;
    var accountObject = [];
    var posts = {};
    //TODO Fetch Pages Data From DB
    return function (callback) {
        //todo get handle (page name)
        if (that.posts) {
            callback(null,that.posts);
        } else {
            accountService(function (err, data) {
                if (err) {
                    callback(err, null)
                } else {
                    accountObject = data;
                    var handle = 'blog';
                    //API is getting only one page but we need page arrays
                    var postsUrl = '/api/1.0/cms/blog';

                    $http.get(postsUrl, { cache: true})
                        .success(function (post) {
                            if (post !== null) {

                                callback(null, post);
                            } else {
                                callback("post not found");
                            }
                        }).error(function (err) {
                            callback(err);
                        });

                }
            });
        }

    };
}]);