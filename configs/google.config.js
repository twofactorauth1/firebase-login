var appConfig =  require('./app.config');

var clientId = process.env.GOOGLE_CLIENT_ID || '800949752961.apps.googleusercontent.com';
var clientSecret = process.env.GOOGLE_CLIENT_SECRET || 'AzTB-YSe4f8dXZxczQ0ISEIX';

module.exports = {
    CLIENT_ID: clientId,
    CLIENT_SECRET: clientSecret,
    CALLBACK_URL_SIGNUP: appConfig.server_url + "/signup/google/callback",
    CALLBACK_URL_LOGIN: appConfig.server_url + "/login/google/callback",


    getDynamicCallbackUrlSignup: function(subdomain) {
        if (subdomain == null) {
            return appConfig.server_url + "/signup/google/callback";
        }
        var url = appConfig.getServerUrl(subdomain) + "/signup/google/callback";
        return url;
    },


    getDynamicCallbackUrlLogin: function(subdomain) {
        if (subdomain == null) {
            return appConfig.server_url + "/login/google/callback";
        }
        var url = appConfig.getServerUrl(subdomain) + "/login/google/callback";
        return url;
    }
};

