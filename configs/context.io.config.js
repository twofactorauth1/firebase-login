/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var appConfig =  require('./app.config');

var contextioClientId = process.env.CONTEXTIO_CLIENT_ID || 'wqge49n8';
var contextioClientSecret = process.env.CONTEXTIO_CLIENT_SECRET || 'mtYWablC9Yd3uv5V';

module.exports = {
    CLIENT_ID: contextioClientId,
    CLIENT_SECRET: contextioClientSecret,
    CALLBACK_URL_LOGIN: appConfig.server_url + "/oauth2/callback", //Unused for now, as we're using 2-legged oauth

    keys: {
        key: contextioClientId,
        secret: contextioClientSecret
    },

    getScope: function() {
        return null;
    }
};

