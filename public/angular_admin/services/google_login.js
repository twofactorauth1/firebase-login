define(['app'], function(app) {
    app.register.service('googleLogin', ['$http', '$rootScope', '$q','ENV' function($http, $rootScope, $q, ENV) {
        var clientId = ENV.googleClientId,
            apiKey = ENV.googleServerKey,
            token = "",
            code = "",
            refreshToken = "",
            scopes = 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/analytics.readonly',
            domain = 'http://main.indigenous.local:3000',
            userEmail,
            deferred = $q.defer();

        this.login = function() {
            if (!token) {
                gapi.auth.init(function() {});
                gapi.auth.setToken({
                    access_token: token
                });
                gapi.auth.authorize({
                    client_id: clientId,
                    scope: scopes,
                    approval_prompt: 'auto'
                }, this.handleAuthResult);
                return deferred.promise;
            } else {
                this.codeForToken();

            }
        };

        this.codeForToken = function(fn) {
             $http({
                url: 'https://accounts.google.com/o/oauth2/auth',
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                data: {
                    client_id: clientId,
                    response_type: 'code',
                    redirect_uri: 'https://localhost/oauth2callback',
                    access_type: 'offline',
                    scope: scopes,
                    approval_prompt: 'auto'
                }
              })
              .success(function(data, status, headers, config) {
                console.log('data >>> ', data);
              });
        };

        this.getRefreshToken = function(fn) {
             $http({
                url: 'https://accounts.google.com/o/oauth2/token',
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                data: {
                    code: code,
                    client_id: clientId,
                    client_secret: 'diUOvrPQf-u3tG8Vr0yyfTEp',
                    redirect_uri: 'https://localhost/oauth2callback',
                    grant_type: 'authorization_code'
                }
              })
              .success(function(data, status, headers, config) {
                fn(data);
              });
        };

        this.handleClientLoad = function() {
            gapi.client.setApiKey(apiKey);
            window.setTimeout(this.checkAuth, 1);
            return deferred.promise;
        };

        this.checkAuth = function() {
            console.log('checking auth');
            gapi.auth.authorize({
                client_id: clientId,
                scope: scopes,
                immediate: true
            }, this.handleAuthResult);
        };

        this.handleAuthResult = function(authResult) {
            if (authResult) {
                token = authResult.access_token;
                // The user has authorized access
                console.log('authResult >>> ', authResult);
                this.loadAnalyticsClient;
                deferred.resolve(authResult);
            } else {
                // User has not Authenticated and Authorized
                this.handleUnAuthorized();
            }
        };

        this.loadAnalyticsClient = function() {
            // Load the Analytics client and set handleAuthorized as the callback function
            gapi.client.load('analytics', 'v3', handleAuthorized);
        };

        // Authorized user
        this.handleAuthorized = function() {
            console.log('authorized');
        };

        // Unauthorized user
        this.handleUnAuthorized = function() {
            console.log('Unauthorized');
        };

    }]);
});
