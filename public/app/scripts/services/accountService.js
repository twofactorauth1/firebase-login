/*
 * Verifying Account According to Subdomain
 * */

'use strict';

mainApp.factory('accountService', ['$location', '$http', function ($location, $http) {

    var that = this;
    that.account = null;

    return function (callback) {
        console.log('START:Account Service');
        if (that.account) {
            console.log('GET:Account Service Cached Data');
            callback(null,that.account);
        } else {
            console.log('GET:Account Service Database Data');
            callback(null,{status:"ok"} );
            // API URL: http://yoursubdomain.indigenous.local/api/1.0/account
            /*$http.get('/api/1.0/account')
                .success(function (data) {
                    that.account = data;
                    console.log('END:Account Service with SUCCESS');
                    callback(null, data)
                })
                .error(function (err) {
                    console.log('END:Account Service with ERROR');
                    callback(err, null);
                });*/
        }
    };
}]);