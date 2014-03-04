var appConfig =  require('./app.config');

var facebookClientId = process.env.FACEBOOK_CLIENT_ID || '269704773200651';
var facebookClientSecret = process.env.FACEBOOK_CLIENT_SECRET || 'baf33c08a8c2cef97d7db1ad5c7451a8';

module.exports = {
    CLIENT_ID: facebookClientId,
    CLIENT_SECRET: facebookClientSecret,
    CALLBACK_URL_SIGNUP: appConfig.server_url + "/signup/facebook/callback",
    CALLBACK_URL_LOGIN: appConfig.server_url + "/login/facebook/callback",


    getDynamicCallbackUrlSignup: function(subdomain) {
        if (subdomain == null) {
            return appConfig.server_url + "/signup/facebook/callback";
        }
        var url = appConfig.getServerUrl(subdomain) + "/signup/facebook/callback";
        return url;
    },


    getDynamicCallbackUrlLogin: function(subdomain) {
        if (subdomain == null) {
            return appConfig.server_url + "/login/facebook/callback";
        }
        var url = appConfig.getServerUrl(subdomain) + "/login/facebook/callback";
        return url;
    }
};

