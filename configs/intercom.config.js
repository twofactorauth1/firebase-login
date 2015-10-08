/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */


var appConfig =  require('./app.config');

var intercomApiKey = process.env.INTERCOM_API_KEY || '7eabdca2faff0115dcf9cf316078617cf707b0ad';
var intercomAppId = process.env.INTERCOM_APP_ID || 'b3st2skm';
var intercomUsersLink = "https://app.intercom.io/a/apps/"+intercomAppId+"/users/";

module.exports = {
    INTERSOM_API_KEY: intercomApiKey,
    INTERSOM_APP_ID: intercomAppId,
    INTERCOM_USERS_LINK: intercomUsersLink
}
