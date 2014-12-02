define(['app'], function(app) {
    app.register.service('keenService', ['$http', function($http) {
        var baseUrl = 'https://api.keen.io/3.0/projects/';
        var readKey = 'bc102d9d256d3110db7ccc89a2c7efeb6ac37f1ff07b0a1f421516162522a972443b3b58ff6120ea6bd4d9dd469acc83b1a7d8a51cbb82caa89e590492e0579c8b7c65853ec1c6d6ce6f76535480f8c2f17fcb66dca14e699486efb02b83084744c68859b89f71f37ad846f7088ff96b';
        var projectId = "54528c1380a7bd6a92e17d29";
        this.multiAnalysis = function(params, fn) {
            var apiUrl = baseUrl + [projectId, 'queries', 'multi_analysis'].join('/') + '?api_key='+readKey;
            $http.get( apiUrl,{
                params: params
            })
            .success(function(data, status, headers, config) {
              fn(data);
            });
        };

    }]);
});
