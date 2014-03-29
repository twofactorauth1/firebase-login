/**
 * COPYRIGHT CMConsulting LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact christopher.mina@gmail.com for approval or questions.
 */

define([], function() {

    var cmsServices = {

        getThemeConfigForAccount: function(accountId) {
            var url = $$.api.getApiUrl("account", accountId + "/cms/theme");
            return $.getJSON(url);
        }
    };

    $$.svc.CmsService = cmsServices;

    return cmsServices;
});
