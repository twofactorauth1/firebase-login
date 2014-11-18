define(['app'], function (app) {
    app.register.service('dashboardService', function ($http, $rootScope, $q) {
        var clientId = '1026246177215-tqpcc51fjk3vm0mgjef2jg7jagcmtuba.apps.googleusercontent.com',
            apiKey = 'AIzaSyCAkloYlXlZx_---WXevaNHv03ReYpnvLs',
            token = "",
            code = "",
            refreshToken = "",
            scopes = 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/analytics.readonly',
            domain = 'http://main.indigenous.local:3000',
            userEmail,
            deferred = $q.defer();

        this.queryGoogleAnalytics = function (params, fn) {
            params.access_token = token;
            $http({
                url: 'https://www.googleapis.com/analytics/v3/data/ga?'+this.encodeData(params),
                method: 'GET'
              })
              .success(function(data, status, headers, config) {
                fn(data);
              });
        };

        this.checkToken = function(fn) {
            // this.login(fn);
            if (!token) {
                 this.getAccessToken(fn, function(data) {
                    if (data) {fn(data);};
                 });
            } else {
                fn(false);
            }
        };

        this.encodeData = function(data) {
            return Object.keys(data).map(function(key) {
                return [key, data[key]].map(encodeURIComponent).join("=");
            }).join("&");
        };

        this.getAccessToken = function (fn) {
            var self = this;
            var apiUrl = '/api/1.0/' + ['social', 'google', 'accesstoken'].join('/');
            $http({
                url: apiUrl,
                method: 'GET'
              })
              .success(function(data, status, headers, config) {
                if (data != 'error') {
                    console.log('access data >>> ', data);
                    fn(data);
                    token = data.data;
                } else {
                    console.log('error');
                }
              });
        };

        this.login = function() {
            gapi.auth.init(function() {});
            gapi.auth.authorize({
                client_id: clientId,
                scope: scopes,
                immediate: true,
                approval_prompt: 'auto'
            }, this.handleAuthResult());
            return deferred.promise;
        };

        this.handleClientLoad = function() {
            gapi.client.setApiKey(apiKey);
            window.setTimeout(this.checkAuth, 1);
            return deferred.promise;
        };

        this.checkAuth = function() {
            gapi.auth.authorize({
                client_id: clientId,
                scope: scopes,
                immediate: true
            }, this.handleAuthResult);
        };

        this.handleAuthResult = function(authResult, fn) {
            if (authResult) {
                token = authResult.access_token;
                // The user has authorized access
                this.loadAnalyticsClient;
                // fn(authResult);
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
    });
});
