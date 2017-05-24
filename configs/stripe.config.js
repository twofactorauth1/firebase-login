/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */


var appConfig =  require('./app.config');

var stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_iXKiJJ80BnXlAXnOqCX4FxjQ';
//var stripeSecretKey = 'sk_live_dtI4g8wdtGIpjtBVzNgiP3gT';
var stripePublishableKey = process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_EuZhZHVourE3RaRxELJaYEya';
var stripeClientId = process.env.STRIPE_CLIENT_ID || 'ca_4BwvfmpoZxIz6vzaDgezIj9kWSKRn9Gh';
var rvlvrStripeSecretKey = process.env.RVLVR_STRIPE_SECRET_KEY || 'sk_test_cU10NcwS2g4ojaaokcYuldkl';
var rvlvrStripePublishableKey = process.env.RVLVR_STRIPE_PUBLISHABLE_KEY || 'pk_test_t1GG6sNCkdjsza72g7NiPs60';

module.exports = {
    STRIPE_SECRET_KEY: stripeSecretKey,
    STRIPE_PUBLISHABLE_KEY: stripePublishableKey,
    STRIPE_CLIENT_ID: stripeClientId,
    CALLBACK_URL_LOGIN: appConfig.www_url + "/stripe/connect/callback",
    //adding test key just to ensure its there if we need it.
    STRIPE_TEST_SECRET_KEY: 'sk_test_iXKiJJ80BnXlAXnOqCX4FxjQ',
    RVLVR: {
        STRIPE_SECRET_KEY: rvlvrStripeSecretKey,
        STRIPE_PUBLISHABLE_KEY: rvlvrStripePublishableKey
    }
};
