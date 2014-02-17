define([], function() {

    var services = {

        usernameExists: function(username, fn) {
            var url = $$.api.getApiUrl("user", "exists/username=" + username);

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

    $$.services = $$.services || {};
    $$.services.UserService = services;

    return services;
});
