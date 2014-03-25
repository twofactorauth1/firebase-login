/**
 * COPYRIGHT CMConsulting LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact christopher.mina@gmail.com for approval or questions.
 */

define([], function() {

    var userServices = {

        usernameExists: function(username, fn) {
            var url = $$.api.getApiUrl("user", "exists/" + username);

            var deferred = $.Deferred();
            $.getJSON(url, null, function(data, status) {
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
