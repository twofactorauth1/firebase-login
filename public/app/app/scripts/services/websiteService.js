/*
 * Getting Website Data According to Website ID
 *
 * */

'use strict';

mainApp.factory('websiteService', ['accountService','$http', function (accountService,$http) {

    var that = this;
    that.website = null;

    return function (callback) {
        console.log('START:Website Service');
        if (that.website) {
            console.log('GET:Website Service Cached Data');
            callback(that.website);
        } else {
            accountService(function (err, data) {
                if (err) {
                    console.log('Method:accountService Error: ' + err);
                } else {
                    console.log('Method:accountService Success: ', data);
                    console.log('GET:Website Service Database Data');
                    // API URL: http://yoursubdomain.indigenous.local/api/1.0/cms/website/yourid
                    $http.get('/api/1.0/cms/website/' + data.website.websiteId)
                        .success(function (data) {
                            that.website = data;
                            console.log('END:Website Service with SUCCESS');
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