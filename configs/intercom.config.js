/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */


var appConfig =  require('./app.config');

var intercomApiKey = process.env.INTERCOM_API_KEY || '929ed7c4f84ffed44546f2259cdf29140f926f35';
var intercomAppId = process.env.INTERCOM_APP_ID || 'ozyfh8ff';
var intercomSecretKey = process.env.INTERCOM_SECRET_KEY || 'E14RezgzYhQ6N9Pc5ivK15YT8vWnx51fisXxKfTB';


/*
 * Test Creds:
 * App ID: ozyfh8ff
 * API Key: 929ed7c4f84ffed44546f2259cdf29140f926f35
 *
 * Prod Creds:
 * App ID: b3st2skm
 * API Key: 7eabdca2faff0115dcf9cf316078617cf707b0ad
 *
 */

module.exports = {
    INTERCOM_API_KEY: intercomApiKey,
    INTERCOM_APP_ID: intercomAppId,
    INTERCOM_SECRET_KEY: intercomSecretKey,
    INTERCOM_USERS_LINK: "https://app.intercom.io/a/apps/" + intercomAppId + "/users/"

    //Production
    //INTERCOM_PROD_API_KEY: '7eabdca2faff0115dcf9cf316078617cf707b0ad',
    //INTERCOM_PROD_APP_ID: 'b3st2skm',
    //INTERCOM_PROD_USERS_LINK: "https://app.intercom.io/a/apps/b3st2skm/users/",
    //INTERCOM_PROD_SECRET_KEY: 'vZ7kG_bS_S-jnsNq4M2Vxjsa5mZCxOCJM9nezRUQ'
}
