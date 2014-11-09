/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var appConfig =  require('./app.config');


var clientId = process.env.GOOGLE_CLIENT_ID || '277102651227-koaeib7b05jjc355thcq3bqtkbuv1o5r.apps.googleusercontent.com';
var clientSecret = process.env.GOOGLE_CLIENT_SECRET || 'lg41TWgRgRfZQ22Y9Qd902pH';

//TEST Environment Credentials (*.test.indigenous.io)
//var clientId = '277102651227-koaeib7b05jjc355thcq3bqtkbuv1o5r.apps.googleusercontent.com';
//var clientSecret = 'lg41TWgRgRfZQ22Y9Qd902pH';


//TEST Environment Credentials (*.test.indigenous.io)
//var clientId = '277102651227-koaeib7b05jjc355thcq3bqtkbuv1o5r.apps.googleusercontent.com';
//var clientSecret = 'lg41TWgRgRfZQ22Y9Qd902pH';

module.exports = {
    CLIENT_ID: clientId,
    CLIENT_SECRET: clientSecret,
    CALLBACK_URL_LOGIN: appConfig.server_url + "/oauth2/callback",


    getScope: function() {
        return "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.google.com/m8/feeds";
    }
};

