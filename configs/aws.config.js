
var appConfig = require('./app.config.js');

var serverUrl = appConfig.server_url;

//TODO - CAM -- Add Indigenous Credentials here, these are my personal credentials
module.exports = {
    S3_ACCESS_KEY: "AKIAJ4G5SJJASTPBJPFA",
    S3_SECRET_KEY: "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",
    POST_TTL: 7200000, //2 hours
    GET_TTL: 300000,
    DEFAULT_REDIRECT_URL: serverUrl,
    BUCKETS: {
        INIGENOUS_CONTACT_PHOTOS: "sell-rate-decks"//"contact-photos";
    },
    "accessKeyId":"AKIAJ4G5SJJASTPBJPFA",
    "secretAccessKey":"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",
    "apiVersions": {
        s3: '2006-03-01'
    }
};