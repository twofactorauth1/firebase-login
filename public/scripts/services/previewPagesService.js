'use strict';
/*global mainApp*/
mainApp.factory('previewPagesService', ['$http', '$location', '$cacheFactory', function ($http, $location, $cacheFactory) {
    var apiURL = '/api/2.0/cms/';

    return function (websiteId, callback) {
        var path = $location.$$path.toLowerCase().replace('/preview/', '');

        if (path.indexOf('/') === 0) {
            path = path.replace('/', '');
        }

        // /api/2.0/cms/pages/4c4b8f81-0241-4312-a75d-b26bcf42194b
        return $http.get(apiURL + 'pages/' + path, {
            cache: true
        }).success(function (page) {
            callback(null, page);
        }).error(function (err) {
            callback(err);
        });
    };
}]);
