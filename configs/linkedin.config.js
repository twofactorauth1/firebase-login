/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var appConfig =  require('./app.config');

//78blriy70xyzo2
//E1UX5CVDTF1nQOBS

/*
 * Old application
 * var clientId = process.env.LINKEDIN_CLIENT_ID || '75yguynstm9v3i';
 * var clientSecret = process.env.LINKEDIN_CLIENT_SECRET || 'IMYsFv9qrnPeng0J';
 */
var clientId = process.env.LINKEDIN_CLIENT_ID || '78blriy70xyzo2';
var clientSecret = process.env.LINKEDIN_CLIENT_SECRET || 'E1UX5CVDTF1nQOBS';

//var clientId = '774w328y41vuu2';
//var clientSecret = '9leiTjDCqsEhmjpu';



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

