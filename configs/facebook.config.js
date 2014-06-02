/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@INDIGENOUS SOFTWARE, INC. for approval or questions.
 */

var appConfig =  require('./app.config');


var facebookClientId = process.env.FACEBOOK_CLIENT_ID || '622171824473460';
var facebookClientSecret = process.env.FACEBOOK_CLIENT_SECRET || 'bb266b72037221722c2fb0be3bd480f7';

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

