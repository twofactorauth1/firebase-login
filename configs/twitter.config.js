/**
 * COPYRIGHT INDIGENOUS.IO, LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var appConfig =  require('./app.config');

//user:  cycleboy99
var clientId = process.env.TWITTER_CLIENT_ID || 'n8xIukBuQ1GIpmDmCYiqkw';
var clientSecret = process.env.TWITTER_CLIENT_SECRET || '1w2GyxTw0qFbVuW5V9dhGV1CchLmSZDI8Jd2ENx82YE';

module.exports = {
    CLIENT_ID: clientId,
    CLIENT_SECRET: clientSecret,
    CALLBACK_URL_LOGIN: appConfig.server_url + "/oauth2/callback",


    getScope: function() {
        return null;
    }
};

