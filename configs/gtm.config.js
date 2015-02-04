/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var appConfig =  require('./app.config');



var gtmClientId = process.env.GTM_CLIENT_ID || 'WbtIpA8CGGxGSwaRSqckXLw8jbrWoeHX';
var gtmClientSecret = process.env.GTM_CLIENT_SECRET || 'Qq6imGsqG0OvKYpM';

//we can set these for the main account for now:
var organizerId = process.env.GTM_ORGANIZER_ID || '3769601213311530245';
var accessToken = process.env.GTM_ACCESS_TOKEN || 'rGbgknavGoHhvFt6rU9KseXQTXK8';


module.exports = {
    CLIENT_ID: gtmClientId,
    CLIENT_SECRET: gtmClientSecret,
    CALLBACK_URL_LOGIN: appConfig.server_url + "/oauth2/callback",

    organizerId: organizerId,
    accessToken: accessToken,


    getScope: function(additions) {
        return "";
    }
};

