'use strict';
/**
 * service for keen
 */
(function(angular) {
    app.service('KeenService', ['$http','ENV', function($http,ENV) {
        var baseUrl = 'https://api.keen.io/3.0/projects/';
        console.log('ENV ', ENV);
        var readKey = ENV.keenReadKey;
        var writeKey = ENV.keenWriteKey;
        var projectId = ENV.keenProjectId;

        this.multiAnalysis = function(params, fn) {
            var apiUrl = baseUrl + [projectId, 'queries', 'multi_analysis'].join('/') + '?api_key='+readKey;
            params.filters = JSON.stringify(params.filters);
            $http.get( apiUrl,{
                params: params
            })
            .success(function(data, status, headers, config) {
              fn(data);
            });
        };

        //https://api.keen.io/3.0/projects/<project_id>/queries/extraction?api_key=<read_key>&event_collection=<event_collection>
        this.singleExtraction = function(params, fn) {
            var apiUrl = baseUrl + [projectId, 'queries', 'extraction'].join('/') + '?api_key='+readKey;
            params.filters = JSON.stringify(params.filters);
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
})(angular);
