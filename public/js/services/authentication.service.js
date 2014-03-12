define([], function() {

    var authenticationService = {

        getAuthenticatedUrl: function(accountId, path) {
            var url = $$.api.getApiUrl("authentication", "account/" + accountId + "/url?path=" + path);

            var deferred = $.Deferred();
            $.getJSON(url, null, function(result, status) {
                deferred.resolve(result.url);
            });

            return deferred;
        },

        getGoogleAccessToken: function() {
            var url = $$.api.getApiUrl("social/google", "accesstoken");

            var deferred = $.Deferred();
            $.getJSON(url, null, function(result, data) {
                deferred.resolve(result.data);
            });

            return deferred;
        }
    };

    $$.svc.AuthenticationService = authenticationService;

    return authenticationService;
});
