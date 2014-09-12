/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var authenticationApi = require('./1.0/authentication.api');
var accountApi = require('./1.0/account.api');
var userApi = require('./1.0/user.api');
var contactApi = require('./1.0/contact.api');
var courseApi = require('./1.0/course.api');
var uploadApi = require('./1.0/upload.api');
var geoApi = require('./1.0/geo.api');
var emailDataApi = require('./1.0/emaildata.api');

//CME
var cmsApi = require('./1.0/cms.api');

//Integrations
var awsApi = require('./1.0/integrations/aws.api');
var paymentsApi = require('./1.0/integrations/payments.api');

//Social
var facebookApi = require('./1.0/social/facebook.api');
var googleApi = require('./1.0/social/google.api');
var linkedInApi = require('./1.0/social/linkedin.api');

//Biometrics
var biometricsPlatform = require('./1.0/biometricsplatform.api');
var twonetAdapterApi = require('./1.0/twonetadapter.api');
var runkeeperApi = require('./1.0/runkeeperadapter.api');

// Campaigns
var campaignManager = require('./1.0/campaignmanager.api');

// Products
var productsApi = require('./1.0/product.api');

// Analytics
var analyticsApi = require('./1.0/analytics.api');

//Assets
var assetsApi = require('./1.0/assets.api');

module.exports = {

};
