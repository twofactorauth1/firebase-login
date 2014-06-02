/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@INDIGENOUS SOFTWARE, INC. for approval or questions.
 */

define([], function () {

    var authenticationService = {

        getAuthenticatedUrl: function (accountId, path) {
            var url = $$.api.getApiUrl("authentication", "account/" + accountId + "/url?path=" + path);

            var deferred = $.Deferred();
            $.getJSON(url, null, function (result, status) {
                deferred.resolve(result.url);
            });

            return deferred;
        },


        checkSocialAccess: function (socialType) {
            var api = "social/";
            var deferred = $.Deferred();
            switch(socialType) {
                case $$.constants.social.types.FACEBOOK:
                    api += "facebook";
                    break;
                case $$.constants.social.types.GOOGLE:
                    api += "google";
                    break;
                case $$.constants.social.types.LINKEDIN:
                    api += "linkedin";
                    break;
                case $$.constants.social.types.TWITTER:
                    deferred.reject("Twitter API not available");
                    return deferred;
            }
            var url = $$.api.getApiUrl(api, "checkaccess");

            var deferred = $.Deferred();
            $.getJSON(url)
                .done(function(resp, data) {
                    if (resp.code != null && parseInt(resp.code) > 299) {
                        deferred.resolve(false);
                    } else {
                        deferred.resolve(true);
                    }
                })
                .fail(function(resp) {
                    deferred.resolve(false);
                });

            return deferred;
        },


        authenticateSocial: function(socialType, state, detail) {
            var url = "/inapplogin/";
            switch(socialType) {
                case $$.constants.social.types.FACEBOOK:
                    url += "facebook";
                    break;
                case $$.constants.social.types.GOOGLE:
                    url += "google";
                    break;
                case $$.constants.social.types.LINKEDIN:
                    url += "linkedin";
                    break;
                case $$.constants.social.types.TWITTER:
                    url += "twitter";
            }

            url += "?state=" + state + "&detail=" + detail;

            window.location.href = url;
        },


        getGoogleAccessToken: function () {
            var url = $$.api.getApiUrl("social/google", "accesstoken");

            var deferred = $.Deferred();
            $.getJSON(url, null, function (result, data) {
                deferred.resolve(result.data);
            });

            return deferred;
        }
    };

    $$.svc.AuthenticationService = authenticationService;

    return authenticationService;
});
