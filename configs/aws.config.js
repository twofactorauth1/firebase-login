var appConfig = require('./app.config.js');

var serverUrl = appConfig.server_url;

//user: christopher.mina@gmail.com
var AWS_ACCESS_KEY = "AKIAJ4G5SJJASTPBJPFA";
var AWS_SECRET_ACCESS_KEY ="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";
var AWS_REGION = "us-east-1";  //US Standard
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
        CONTACT_PHOTOS: "indigenous-test1-contact-photos"
    },
    "accessKeyId":AWS_ACCESS_KEY,
    "secretAccessKey":AWS_SECRET_ACCESS_KEY,
    "apiVersions": {
        s3: AWS_S3_API
    }
};