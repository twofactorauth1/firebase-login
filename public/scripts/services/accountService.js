/*
 * Verifying Account According to Subdomain
 * */

'use strict';

mainApp.factory('accountService', ['$location', '$http', function ($location, $http) {

    var that = this;
    that.account = {};

    return function (callback) {
        if (Object.getOwnPropertyNames(that.account).length != 0) {
            callback(null,that.account);
        } else {
            // API URL: http://yoursubdomain.indigenous.local/api/1.0/account
            $http.get('/api/1.0/account')
            .success(function (data) {
                that.account = data;
                callback(null, data)
            })
            .error(function (err) {
                console.log('END:Account Service with ERROR');
                callback(err, null);
            });
        }
    };
}]);