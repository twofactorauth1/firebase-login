/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var appConfig =  require('./app.config');

//user:  indigenous_io
var clientId = process.env.TWITTER_CLIENT_ID || '6pHsghek08Z4GwEsO5kTcL7mA';
var clientSecret = process.env.TWITTER_CLIENT_SECRET || 'XTq17FWMpyLpfQjcct5MsaLg2dO6XjTMNJJQpQlhzIRsXEwaVd';

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


/*
 Application Settings
 Keep the "Consumer Secret" a secret. This key should never be human-readable in your application.
 Consumer Key (API Key)	6pHsghek08Z4GwEsO5kTcL7mA
 Consumer Secret (API Secret)	XTq17FWMpyLpfQjcct5MsaLg2dO6XjTMNJJQpQlhzIRsXEwaVd
 Access Level	Read, write, and direct messages (modify app permissions)
 Owner	indigenous_io
 Owner ID	2346197179
 */

module.exports = {
    CLIENT_ID: clientId,
    CLIENT_SECRET: clientSecret,
    CALLBACK_URL_LOGIN: appConfig.www_url + "/oauth2/callback",


    getScope: function() {
        return null;
    }
};

