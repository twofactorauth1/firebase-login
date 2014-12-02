define(['app'], function(app) {
    app.register.service('keenService', ['$http', function($http) {
        var baseUrl = 'https://api.keen.io/3.0/projects/';
        var readKey = 'bc102d9d256d3110db7ccc89a2c7efeb6ac37f1ff07b0a1f421516162522a972443b3b58ff6120ea6bd4d9dd469acc83b1a7d8a51cbb82caa89e590492e0579c8b7c65853ec1c6d6ce6f76535480f8c2f17fcb66dca14e699486efb02b83084744c68859b89f71f37ad846f7088ff96b';
        var writeKey = "c36124b0ccbbfd0a5e50e6d8c7e80a870472af9bf6e74bd11685d30323096486a19961ebf98d57ee642d4b83e33bd3929c77540fa479f46e68a0cdd0ab57747a96bff23c4d558b3424ea58019066869fd98d04b2df4c8de473d0eb66cc6164f03530f8ab7459be65d3bf2e8e8a21c34a";
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

        this.keenClient = function(fn) {
            Keen.ready(function() {

                var client = new Keen({
                    projectId: projectId,
                    writeKey: writeKey,
                    readKey: readKey,
                    protocol: "https",
                    host: "api.keen.io/3.0",
                    requestType: "jsonp"
                });

                fn(client);

            });
        };

    }]);
});
