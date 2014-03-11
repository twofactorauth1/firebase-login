var appConfig =  require('./app.config');

var facebookClientId = process.env.FACEBOOK_CLIENT_ID || '269704773200651';
var facebookClientSecret = process.env.FACEBOOK_CLIENT_SECRET || 'baf33c08a8c2cef97d7db1ad5c7451a8';

module.exports = {
    CLIENT_ID: facebookClientId,
    CLIENT_SECRET: facebookClientSecret,
    CALLBACK_URL_LOGIN: appConfig.server_url + "/oauth2/callback",


    getScope: function() {
        return '["basic_info", "email", "friends_website", "friends_birthday", "offline_access"]';
    }
};

