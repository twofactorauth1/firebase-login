/*
 * Verifying Account According to Subdomain
 * */

'use strict';

mainApp.factory('accountService', ['$location', '$http', function ($location, $http) {

    var account = {};

    return function (callback) {

        if (Object.getOwnPropertyNames(account).length != 0) {
            callback(null,account);
        } else {
            // API URL: http://yoursubdomain.indigenous.local/api/1.0/account
            $http.get('/api/1.0/account')
            .success(function (data) {
                account = data;
                callback(null, data)
            })
            .error(function (err) {
                console.log('END:Account Service with ERROR ', err);
                callback(err, null);
            });
        }
    };
}]);