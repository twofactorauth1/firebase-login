/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@INDIGENOUS SOFTWARE, INC. for approval or questions.
 */

var appConfig =  require('./app.config');

//user: christopher.mina@gmail.com
var clientId = process.env.LINKEDIN_CLIENT_ID || '77a3p9aub0j6by';
var clientSecret = process.env.LINKEDIN_CLIENT_SECRET || 'B5Akbohq6q9L8a2G';

module.exports = {
    CLIENT_ID: clientId,
    CLIENT_SECRET: clientSecret,
    CALLBACK_URL_LOGIN: appConfig.server_url + "/oauth2/callback",


    SCOPE_MAILBOX: "w_messages",

    getScope: function(additions) {
        var arr = ['r_emailaddress', 'r_basicprofile', 'r_network', 'r_contactinfo'];

        if (additions != null) {
            arr = arr.concat(additions);
        }
        return arr;
    }
};

