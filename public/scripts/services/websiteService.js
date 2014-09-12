/*
 * Getting Website Data According to Website ID
 *
 * */

'use strict';

mainApp.factory('websiteService', ['accountService','$http', function (accountService,$http) {

    var that = this;
    that.website = null;

    return function (callback) {
        if (that.website) {
            callback(null,that.website);
        } else {
            accountService(function (err, data) {
                if (err) {
                    console.log('Method:accountService Error: ' + err);
                    callback(err, null);
                } else {

                    // API URL: http://yoursubdomain.indigenous.local/api/1.0/cms/website/yourid
                    $http.get('/api/1.0/cms/website/' + data.website.websiteId)
                    .success(function (data) {
                        that.website = data;
                        callback(null, data)
                    })
                    .error(function (err) {
                        console.log('END:Website Service with ERROR');
                        callback(err, null);
                    });
                }

            });
        }
    };
}]);