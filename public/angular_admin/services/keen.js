define(['app'], function(app) {
    app.register.service('keenService', ['$http', function($http) {
        var baseUrl = 'https://api.keen.io/3.0/projects/';
        var readKey = '16348ac352e49c12881e5a32ee37fdd6167ead382071330af9788d9c9e6cae41a8b3fb663bc59bb19e0ec0968bf1c4bdd9f62f29d6545663863932805ff6eac7df34c9202db4f294c0d8cd70d9c9846a99ea00d85f973dfa41e6448e9d05e9ecad9f9ffcb7a7e146dba7de20642e892a';
        var writeKey = "98f22da64681d5b81e2abb7323493526d8d258f0d355e95f742335b4ff1b75af2709baa51d16b60f168158fe7cfd8d1de89d637ddf8a9ca721859b009c4b004d443728df52346307e456f0511b3e82be4a96efaa9f6dcb7f847053e97eee2b796fc3e2d1a57bb1a86fb07d2e00894966";
        var projectId = "547edcea46f9a776b6579e2c";

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
