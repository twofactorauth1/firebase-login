define(['app'], function(app) {
    app.register.service('googleLogin', ['$http', '$rootScope', '$q', function($http, $rootScope, $q) {
        var clientId = '1026246177215-tqpcc51fjk3vm0mgjef2jg7jagcmtuba.apps.googleusercontent.com',
            apiKey = 'AIzaSyAVrtKPAAD24y1t9eC-VMVoGtoocuSHHxg',
            scopes = 'https://www.googleapis.com/auth/analytics.readonly',
            domain = 'http://main.indigenous.local:3000',
            userEmail,
            deferred = $q.defer();

            this.handleClientLoad = function () {
                gapi.auth.authorize({ client_id: clientId, scope: scopes, immediate: true }, this.handleAuthResult );
                gapi.auth.setToken('ya29.tgBO9IrJ-fbFy00GztwD5qhjdHeZrvOHm9KnPi0Rm7iPpeMYJUX45_LmGrb3k27vb8Cv29xTTP4YjA');
                return deferred.promise;
            };

            this.handleAuthResult = function(authResult) {
                if (authResult && !authResult.error) {
                    gapi.client.setApiKey(apiKey);
                    gapi.client.load('analytics', 'v3');
                    deferred.resolve(authResult)
                } else {
                    deferred.reject('error');
                }
            };

    }]);
});
