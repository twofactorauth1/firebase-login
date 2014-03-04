var appConfig =  require('./app.config');

var clientId = process.env.TWITTER_CLIENT_ID || 'n8xIukBuQ1GIpmDmCYiqkw';
var clientSecret = process.env.TWITTER_CLIENT_SECRET || '1w2GyxTw0qFbVuW5V9dhGV1CchLmSZDI8Jd2ENx82YE';

module.exports = {
    CLIENT_ID: clientId,
    CLIENT_SECRET: clientSecret,
    CALLBACK_URL_SIGNUP: appConfig.server_url + "/signup/twitter/callback",
    CALLBACK_URL_LOGIN: appConfig.server_url + "/login/twitter/callback",


    getDynamicCallbackUrlSignup: function(subdomain) {
        if (subdomain == null) {
            return appConfig.server_url + "/signup/twitter/callback";
        }
        var url = appConfig.getServerUrl(subdomain) + "/signup/twitter/callback";
        return url;
    },


    getDynamicCallbackUrlLogin: function(subdomain) {
        if (subdomain == null) {
            return appConfig.server_url + "/login/twitter/callback";
        }
        var url = appConfig.getServerUrl(subdomain) + "/login/twitter/callback";
        return url;
    }
};

