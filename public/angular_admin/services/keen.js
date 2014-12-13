define(['app'], function(app) {
    app.register.service('keenService', ['$http','ENV', function($http,ENV) {
        var baseUrl = 'https://api.keen.io/3.0/projects/';
        var readKey = ENV.keenReadKey;
        var writeKey = ENV.keenWriteKey;
        var projectId = ENV.keenProjectId;

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

                console.log('readKey >>> ', readKey);
                console.log('writeKey >>> ', writeKey);
                console.log('projectId >>> ', projectId);

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
