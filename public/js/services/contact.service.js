/**
 * COPYRIGHT INDIGENOUS.IO, LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

define([], function() {

    var contactServices = {

        importContacts: function(socialType, fn) {
            var api = "social/";
            var path = "";

            var deferred = $.Deferred();
            switch(socialType) {
                case $$.constants.social.types.FACEBOOK:
                    api += "facebook";
                    path = "friends/import"
                    break;
                case $$.constants.social.types.GOOGLE:
                    api += "google";
                    path = "contacts/import";
                    break;
                case $$.constants.social.types.LINKEDIN:
                    api += "linkedin";
                    path = "connections/import";
                    break;
                case $$.constants.social.types.TWITTER:
                    deferred.reject("Twitter API not available");
                    return deferred;
            }
            var url = $$.api.getApiUrl(api, path);

            $.getJSON(url)
                .done(function(result) {
                    deferred.resolve(result);
                })
                .fail(function(resp) {
                    var json = resp.respJSON;
                    deferred.reject(json);
                });

            return deferred;
        }
    };

    $$.svc.ContactService = contactServices;

    return contactServices;
});
