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

//CMS
var cmsApi = require('./1.0/cms.api');

//Integrations
var awsApi = require('./1.0/integrations/aws.api');
var paymentsApi = require('./1.0/integrations/payments.api');
var zedApi = require('./1.0/integrations/zedinterconnect.api');

//Social
var facebookApi = require('./1.0/social/facebook.api');
var googleApi = require('./1.0/social/google.api');
var linkedInApi = require('./1.0/social/linkedin.api');
var twitterApi = require('./1.0/social/twitter.api');
var socialConfigApi = require('./1.0/social/socialconfig.api');

// Campaigns
var campaignsAPI = require('./1.0/campaigns.api');

// Products
var productsApi = require('./1.0/product.api');

// Analytics
var analyticsApi = require('./1.0/analytics.api');

//Assets
var assetsApi = require('./1.0/assets.api');

//Dashboard
var dashboardApi = require('./1.0/dashboard.api');

//Order
var orderApi = require('./1.0/order.api');

//User Activities
var userActivityApi = require('./1.0/useractivity.api');

//Admin
var adminUserApi = require('./1.0/admin/user.api');
var adminAccountApi = require('./1.0/admin/account.api');
var adminJobsApi = require('./1.0/admin/jobs.api');

//2.0
var cms2Api = require('./2.0/cms.api');
var dashboard2Api = require('./2.0/dashboard.api');
var componentdata2Api = require('./2.0/componentdata.api');
var customers2Api = require('./2.0/customers.api');
var insights2Api = require('./2.0/insights.api');
var purchaseorders2Api = require('./2.0/purchaseorders.api');
var promotions2Api = require('./2.0/promotions.api');
var quotes2Api = require('./2.0/quotes.api');
var analytics2Api = require('./2.0/analytics.api');
var adminOrganizationApi = require('./2.0/organization.api');
var externalProductsApi = require('./2.0/externalproducts.api');

module.exports = {

};
