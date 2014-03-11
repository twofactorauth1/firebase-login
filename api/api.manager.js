var authenticationApi = require('./1.0/authentication.api');
var accountApi = require('./1.0/account.api');
var userApi = require('./1.0/user.api');
var contactApi = require('./1.0/contact.api');
var awsApi = require('./1.0/aws.api');
var uploadApi = require('./1.0/upload.api');
var geoApi = require('./1.0/geo.api');
var facebookApi = require('./1.0/social/facebook.api');
var googleApi = require('./1.0/social/google.api');

module.exports = {
    authenticationApi: authenticationApi,
    accountApi: accountApi,
    userApi: userApi,
    contactApi: contactApi,
    awsApi:awsApi,
    uploadApi:uploadApi,
    geoApi:geoApi,
    facebookApi: facebookApi,
    googleApi: googleApi
};
