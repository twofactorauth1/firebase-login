/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var appConfig = require('./app.config.js');

var serverUrl = appConfig.server_url;

//user: christopher.mina@gmail.com
//var AWS_ACCESS_KEY = "AKIAI25ZEMOG232LK54A";
//var AWS_SECRET_ACCESS_KEY ="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";

//user: indig-application
var AWS_ACCESS_KEY = 'AKIAIF4QBTOMBZRWROGQ';
var AWS_SECRET_ACCESS_KEY = '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';

var AWS_REGION = "us-west-1";  //US Standard
var AWS_S3_API = '2006-03-01';

if (process.env.AWS_ACCESS_KEY == null) {
    process.env.AWS_ACCESS_KEY = AWS_ACCESS_KEY;
}

if (process.env.AWS_SECRET_ACCESS_KEY == null) {
    process.env.AWS_SECRET_ACCESS_KEY = AWS_SECRET_ACCESS_KEY;
}

if (process.env.AWS_REGION == null) {
    process.env.AWS_REGION = AWS_REGION;
}


//TODO - CAM -- Add Indigenous Credentials here, these are my personal credentials
module.exports = {
    AWS_ACCESS_KEY: AWS_ACCESS_KEY,
    AWS_SECRET_ACCESS_KEY: AWS_SECRET_ACCESS_KEY,
    AWS_REGION: AWS_REGION,
    POST_TTL: 7200000, //2 hours
    GET_TTL: 300000,
    DEFAULT_REDIRECT_URL: serverUrl,
    BUCKETS: {
        CONTACT_PHOTOS: "indigenous-contact-photos",
        THEMES: "indigenous-themes",
        ACCOUNT_WEBSITES: "indigenous-account-websites",
        ASSETS: 'indigenous-digital-assets'
    },
    "accessKeyId":AWS_ACCESS_KEY,
    "secretAccessKey":AWS_SECRET_ACCESS_KEY,
    "apiVersions": {
        s3: AWS_S3_API
    }
};