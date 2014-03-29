/**
 * COPYRIGHT CMConsulting LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact christopher.mina@gmail.com for approval or questions.
 */

var appConfig =  require('./app.config');

//user:  cycleboy99
var clientId = process.env.FLICKR_CLIENT_ID || '4a3d0928798bef0296faeff98760e08c';
var clientSecret = process.env.TWITTER_CLIENT_SECRET || '808edf9a90e639e1';

module.exports = {
    CLIENT_ID: clientId,
    CLIENT_SECRET: clientSecret,
    CALLBACK_URL_LOGIN: appConfig.server_url + "/oauth2/callback",


    getScope: function() {
        return null;
    }
};

