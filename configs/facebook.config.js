/**
 * COPYRIGHT INDIGENOUS.IO, LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var appConfig =  require('./app.config');

//user:  christopher.mina@gmail.com
var facebookClientId = process.env.FACEBOOK_CLIENT_ID || '269704773200651';
var facebookClientSecret = process.env.FACEBOOK_CLIENT_SECRET || 'baf33c08a8c2cef97d7db1ad5c7451a8';

module.exports = {
    CLIENT_ID: facebookClientId,
    CLIENT_SECRET: facebookClientSecret,
    CALLBACK_URL_LOGIN: appConfig.server_url + "/oauth2/callback",


    SCOPE_STREAM: "read_stream",
    SCOPE_MAILBOX: "read_mailbox",

    getScope: function(additions) {
        var arr = ["basic_info", "email", "friends_website", "friends_birthday", "offline_access"]; //read_mailbox, read_stream
        if (additions != null) {
            arr = arr.concat(additions);
        }
        return JSON.stringify(arr);
    }
};

