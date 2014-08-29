/*
 * Getting Theam Data From Front End
 *
 * */

'use strict';

mainApp.factory('themeService', ['accountService', '$http', function (accountService, $http) {

    var that = this;
    that.theme = null;

    return function (callback) {
        console.log('START:Theme Service');
        if (that.theme) {
            console.log('GET:Theme Service Cached Data');
            callback(that.theme);
        } else {
            accountService(function (err, data) {
                if (err) {
                    console.log('Method:themeService Error: ' + err);
                } else {
                    console.log('Method:themeService Success: ', data);
                    console.log('GET:Theme Service Database Data');
                    // API URL: http://dad.indigenous.local:3000/api/1.0/cms/theme/yourThemeId
                    $http.get('/api/1.0/cms/theme/' + data.website.themeId)
                        .success(function (data) {
                            that.theme = data;
                            console.log('END:Theme Service with SUCCESS');
                            callback(null, data)
                        })
                        .error(function (err) {
                            console.log('END:Theme Service with ERROR');
                            callback(err, null);
                        });
                }

            });
        }
    };

}]);