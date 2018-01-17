//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
/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2016
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

//var apiKey = process.env.SENDGRID_API_KEY || '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';
//var apiKey = process.env.SENDGRID_API_KEY || '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';
//var apiKey = process.env.SENDGRID_API_KEY || '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';
var apiKey = process.env.SENDGRID_API_KEY || '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';
var testUnSubscribeUrl = process.env.TEST_UN_SUBSCRIBE_URL || "http://smaticsdemo.test.indigenous.io/promotion/remove/";
var prodUnSubscribeUrl = process.env.PROD_UN_SUBSCRIBE_URL || "https://app.securematics.com/promotion/remove/";
//api_key_id:k2cM1VS7SCiAvrgayH_9SQ

module.exports = {
    API_KEY : apiKey,
    TEST_UN_SUBSCRIBE_URL : testUnSubscribeUrl,
    PROD_UN_SUBSCRIBE_URL : prodUnSubscribeUrl
};