var appConfig =  require('./app.config');

//user: christopher.mina@gmail.com
var clientId = process.env.GOOGLE_CLIENT_ID || '800949752961.apps.googleusercontent.com';
var clientSecret = process.env.GOOGLE_CLIENT_SECRET || 'AzTB-YSe4f8dXZxczQ0ISEIX';

module.exports = {
    CLIENT_ID: clientId,
    CLIENT_SECRET: clientSecret,
    CALLBACK_URL_LOGIN: appConfig.server_url + "/oauth2/callback",


    getScope: function() {
        return "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.google.com/m8/feeds";
    }
};

