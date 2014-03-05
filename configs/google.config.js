var appConfig =  require('./app.config');

var clientId = process.env.GOOGLE_CLIENT_ID || '800949752961.apps.googleusercontent.com';
var clientSecret = process.env.GOOGLE_CLIENT_SECRET || 'AzTB-YSe4f8dXZxczQ0ISEIX';

/*
var serverUrl = appConfig.server_url;
if (serverUrl.indexOf("localhost") > -1 || serverUrl.indexOf(".local") > -1) {
    serverUrl = "http://localhost:3000";
}*/
module.exports = {
    CLIENT_ID: clientId,
    CLIENT_SECRET: clientSecret,
    CALLBACK_URL_LOGIN: appConfig.server_url + "/login/google/callback",

    getDynamicCallbackUrlLogin: function(subdomain) {
        if (subdomain == null) {
            return appConfig.server_url + "/login/google/callback";
        }
        var url = appConfig.getServerUrl(subdomain) + "/login/google/callback";
        return url;
    },
    /*
    CALLBACK_URL_LOGIN: serverUrl + "/login/google/callback",


    getDynamicCallbackUrlLogin: function(subdomain) {
        return serverUrl + "/login/google/callback";
    },*/


    getScope: function() {
        return "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile";
    },


    getState: function(subdomain) {
        if (subdomain != null && subdomain !== true && _.isString(subdomain)) {
            var state = {subdomain:subdomain};
            return JSON.stringify(state);
        }
        return null;
    }
};

