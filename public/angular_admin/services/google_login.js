define(['app'], function(app) {
    app.register.service('googleLogin', ['$http', '$rootScope', '$q', function($http, $rootScope, $q) {
        var clientId = '1026246177215-tqpcc51fjk3vm0mgjef2jg7jagcmtuba.apps.googleusercontent.com',
            apiKey = 'AIzaSyAVrtKPAAD24y1t9eC-VMVoGtoocuSHHxg',
            scopes = 'https://www.googleapis.com/auth/analytics.readonly',
            domain = 'http://main.indigenous.local:3000',
            userEmail,
            deferred = $q.defer();

            // this.handleClientLoad = function () {
            //     gapi.auth.authorize({ client_id: clientId, scope: scopes, immediate: true }, this.handleAuthResult );
            //     gapi.auth.setToken('ya29.tgCp1olKmlv6W1n7KNYQTKeYzIb1zyyIaVmfOJ4qxN4ydtSevauz8e6Kxk5zSqZ7nUwY-9n9GdiwLg');
            //     return deferred.promise;
            // };

            this.handleClientLoad = function () {
              gapi.client.setApiKey(apiKey);
              window.setTimeout(checkAuth,1);
            };

            this.checkAuth = function () {
              gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: true}, this.handleAuthResult);
            };

            this.handleAuthResult = function(authResult) {
              if (authResult) {
                // The user has authorized access
                // Load the Analytics Client. This function is defined in the next section.
                this.loadAnalyticsClient();
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
