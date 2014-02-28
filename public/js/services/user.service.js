define([], function() {

    var userServices = {

        usernameExists: function(username, fn) {
            var url = $$.api.getApiUrl("user", "exists/" + username);

            var deferred = $.Deferred();
            $.getJSON(url, function(data, status) {
                if (data === true) {
                    return deferred.resolve(true);
                }
                return deferred.resolve(false);
            });

            return deferred;
        }
    };

    $$.svc.UserService = userServices;

    return userServices;
});
