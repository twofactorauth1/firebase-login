/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var appConfig =  require('./app.config');


var clientId = process.env.GOOGLE_CLIENT_ID || '277102651227-q4rq36pdioba0vomtmssv07ojqie046b.apps.googleusercontent.com';
var clientSecret = process.env.GOOGLE_CLIENT_SECRET || 'sKl01ZtMha3K4BnBygiSQ82g';
var serverKey = process.env.GOOGLE_SERVER_KEY || 'AIzaSyCAkloYlXlZx_---WXevaNHv03ReYpnvLs';
var analyticsId = process.env.GOOGLE_ANALYTICS_ID || 'ga:82461709';
var analyticsScope = process.env.GOOGLE_ANALYTICS_SCOPE || 'ga:pageviews,ga:timeOnPage,ga:exits,ga:avgTimeOnPage,ga:entranceRate,ga:entrances,ga:exitRate,ga:uniquePageviews';

/* TEST Environment Credentials (*.test.indigenous.io)
 Client ID - 277102651227-q4rq36pdioba0vomtmssv07ojqie046b.apps.googleusercontent.com
 Email address - 277102651227-q4rq36pdioba0vomtmssv07ojqie046b@developer.gserviceaccount.com
 Client secret - sKl01ZtMha3K4BnBygiSQ82g
 Redirect URIs - http://www.test.indigenous.io/oauth2/callback
 */

/* PROD Environment Credentials
 Client ID	    277102651227-r68qe8t01epg79kgfe9n5jke5ahb1gf4.apps.googleusercontent.com
 Email address	277102651227-r68qe8t01epg79kgfe9n5jke5ahb1gf4@developer.gserviceaccount.com
 Client secret	ct7uGq1d8QNmqYiLEico6j2W
 Redirect URIs	https://www.indigenous.io/oauth2/callback

 */


module.exports = {
    ANALYTICS_ID: analyticsId,
    ANALYTICS_SCOPE: analyticsScope,
    CLIENT_ID: clientId,
    CLIENT_SECRET: clientSecret,
    CALLBACK_URL_LOGIN: appConfig.www_url + "/oauth2/callback",
    SERVER_KEY: serverKey,

    PROD_CLIENT_ID: '277102651227-r68qe8t01epg79kgfe9n5jke5ahb1gf4.apps.googleusercontent.com',
    PROD_CLIENT_SECRET: 'ct7uGq1d8QNmqYiLEico6j2W',



    getScope: function() {
        return "email profile https://www.google.com/m8/feeds https://www.googleapis.com/auth/analytics.readonly https://www.googleapis.com/auth/plus.login";
    }
};
