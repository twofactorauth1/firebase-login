/*
 * Verifying Account According to Subdomain
 * */

'use strict';

mainApp.factory('accountService', ['$location', '$http', function ($location, $http) {

    var that = this;
    that.account = {};

    return function (callback) {
            console.log('accountService >>>');
        if (Object.getOwnPropertyNames(that.account).length != 0) {
            console.log('cached');
            callback(null,that.account);
        } else {
            // API URL: http://yoursubdomain.indigenous.local/api/1.0/account
            $http.get('/api/1.0/account')
            .success(function (data) {
                console.log('that.account ', that.account);
                that.account = data;
                console.log('that.account ', that.account);
                callback(null, data)
            })
            .error(function (err) {
                console.log('END:Account Service with ERROR');
                callback(err, null);
            });
        }
    };
}]);