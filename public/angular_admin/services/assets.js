define(['app'], function (app) {
    app.register.service('AssetsService', function ($http) {
        var baseUrl = '/api/1.0/';
        this.getAssetsByAccount = function (fn) {
            var apiUrl = baseUrl + ['assets'].join('/');
            $http.get(apiUrl)
                .success(function (data, status, headers, config) {
                    fn(data);
                });
        };

        this.deleteAssets = function (assets, fn) {
            assets.forEach(function (v, i) {
                this.deleteAssetById( v._id, fn );
            }, this);
        };

        this.deleteAssetById = function(assetId, fn) {
            var apiUrl = baseUrl + ['assets', assetId].join('/');
            $http.delete(apiUrl)
                .error(function (data, status, headers, config) {
                    fn(data, status);
                })
                .success(function (data, status, headers, config) {
                    fn(data, status);
                });
        };
    });
});
