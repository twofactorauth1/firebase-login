/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var appConfig =  require('./app.config');

//user:  cycleboy99
var clientId = process.env.TWITTER_CLIENT_ID || 'wYCvZVUB0Qm24oxnVkCTZNsOm';
var clientSecret = process.env.TWITTER_CLIENT_SECRET || 'BqkHN5QDxMbX2Z4BeT505eQhBhbBPOayulDXebh0bubfCAg0Dd';

/*
 Consumer Key (API Key)	wYCvZVUB0Qm24oxnVkCTZNsOm
 Consumer Secret (API Secret)	BqkHN5QDxMbX2Z4BeT505eQhBhbBPOayulDXebh0bubfCAg0Dd
 Access Level	Read, write, and direct messages (modify app permissions)
 Owner	indigenous_io
 Owner ID	2346197179

 Access Token	2346197179-pPvrs8hfCEK8Ks442qa0MacKnyRCrWttzVndYyc
 Access Token Secret	V8ZpyaX8lJc6X1qm6PFyYaZs2Fg8eDBWQXK8lE9ZnV46Y
 Access Level	Read, write, and direct messages
 Owner	indigenous_io
 Owner ID	2346197179
 */

module.exports = {
    CLIENT_ID: clientId,
    CLIENT_SECRET: clientSecret,
    CALLBACK_URL_LOGIN: appConfig.server_url + "/oauth2/callback",


    getScope: function() {
        return null;
    }
};

