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
