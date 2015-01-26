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

        this.deleteAssetById = function (assets, fn) {
            assets.forEach(function (v, i){
                var apiUrl = baseUrl + ['assets', v._id].join('/');
                $http.delete(apiUrl)
                    .error(function (data, status, headers, config){
                        fn(v._id, data, status);
                    })
                    .success(function (data, status, headers, config) {
                        fn(data);
                    });
            })

        };
    });
});
