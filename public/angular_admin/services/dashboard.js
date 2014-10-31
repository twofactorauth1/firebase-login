define(['app'], function (app) {
    app.register.service('AssetsService', function ($http) {
        var baseUrl = '/api/1.0/';
        this.getAssetsByAccount = function (fn) {
            var apiUrl = baseUrl + ['assets', $$.server.acountId].join('/');
            $http.get(apiUrl)
                .success(function (data, status, headers, config) {
                    fn(data);
                });
        };

        this.deleteAssetById = function (fn, assetId) {
            var apiUrl = baseUrl + ['assets', assetId].join('/');
            $http.delete(apiUrl)
                .error(function (data, status, headers, config){
                    fn(data, status);
                })
                .finally(function () {
                });
        };
    });
});
