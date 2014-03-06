define([], function() {

    var authenticationService = {

        getAuthenticatedUrl: function(accountId, path) {
            var url = $$.api.getApiUrl("authentication", "account/" + accountId + "/url?path=" + path);

            var deferred = $.Deferred();
            $.getJSON(url, null, function(result, status) {
                deferred.resolve(result.url);
            });

            return deferred;
        }
    };

    $$.svc.AuthenticationService = authenticationService;

    return authenticationService;
});
