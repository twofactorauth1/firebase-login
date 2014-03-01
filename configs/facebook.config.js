var appConfig =  require('./app.config');

module.exports = {
    FACEBOOK_CLIENT_ID: '269704773200651',
    FACEBOOK_CLIENT_SECRET: 'baf33c08a8c2cef97d7db1ad5c7451a8',
    FACEBOOK_CALLBACK_URL_SIGNUP: appConfig.server_url + "/signup/facebook/callback",
    FACEBOOK_CALLBACK_URL_LOGIN: appConfig.server_url + "/login/facebook/callback",

    getDynamicCallbackUrlSignup: function(subdomain) {
        if (subdomain == null) {
            return appConfig.server_url + "/signup/facebook/callback";
        }
        return appConfig.getServerUrl(subdomain) + "/signup/facebook/callback";
    },


    getDynamicCallbackUrlLogin: function(subdomain) {
        if (subdomain == null) {
            return appConfig.server_url + "/login/facebook/callback";
        }
        return appConfig.getServerUrl(subdomain) + "/login/facebook/callback";
    }
};

