/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */


var appConfig =  require('./app.config');

var stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_iXKiJJ80BnXlAXnOqCX4FxjQ';
var stripePublishableKey = process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_EuZhZHVourE3RaRxELJaYEya';
var stripeClientId = process.env.STRIPE_CLIENT_ID || 'ca_4BwvfmpoZxIz6vzaDgezIj9kWSKRn9Gh';

module.exports = {
    STRIPE_SECRET_KEY: stripeSecretKey,
    STRIPE_PUBLISHABLE_KEY: stripePublishableKey,
    STRIPE_CLIENT_ID: stripeClientId,
    CALLBACK_URL_LOGIN: appConfig.server_url + "/stripe/connect/callback"
}
