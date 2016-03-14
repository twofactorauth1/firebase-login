/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2016
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var paypalClientID = process.env.PAYPAL_CLIENT_ID || 'Adai01SoHe9BcFr9GkfTNzys2bqUdqdpSphHVzouKPKQxxDRe1eBRKGaKNNETr5tYNf02OfG-e-YzOnO';
var paypalClientSecret = process.env.PAYPAL_CLIENT_SECRET || 'EMLp1mnLTtXX6PSgZBqnS2U6Cp4-KSUPvUxg1lpDgKEv4fHX3DUo5Ux980Qhu90Aat4fwQSZMlOZJcV5';
var paypalAPIUsername = process.env.PAYPAL_API_USERNAME || 'kyle-facilitator_api1.indigenous.io';
var paypalAPIPassword = process.env.PAYPAL_API_PASSWORD || '9UQNLK8V9ZNHFSBM';
var paypalAPISignature = process.env.PAYPAL_API_SIGNATURE || 'AFcWxV21C7fd0v3bYYYRCpSSRl31AUrCEslod6r62qh4l6zrsCME.JV-';
var paypalCheckoutURL = process.env.PAYPAL_CHECKOUT_URL || 'https://www.sandbox.paypal.com/webapps/adaptivepayment/flow/pay';
var paypalIsSandbox = process.env.PAYPAL_SANDBOX || true;
var paypalApplicationID = process.env.PAYPAL_APP_ID || 'APP-80W284485P519543T';

//The real deal:
//kyle_api1.indigenous.io
//L5VSWK2GJ8ZXFPDS
//AFcWxV21C7fd0v3bYYYRCpSSRl31ARIjICnFMYduIfRqDGmPXFSW1Wus
//App ID: APP-4WL47068WP184600P

var realUserName = 'kyle_api1.indigenous.io';
var realPassword = 'L5VSWK2GJ8ZXFPDS';
var realSig = 'AFcWxV21C7fd0v3bYYYRCpSSRl31ARIjICnFMYduIfRqDGmPXFSW1Wus';
var realUrl = 'https://www.paypal.com/webapps/adaptivepayment/flow/pay';
var realApplicationID = 'APP-4WL47068WP184600P';

module.exports = {

    PAYPAL_CLIENT_ID : paypalClientID,
    PAYPAL_CLIENT_SECRET : paypalClientSecret,
    PAYPAL_API_USERNAME : paypalAPIUsername,
    PAYPAL_API_PASSWORD : paypalAPIPassword,
    PAYPAL_API_SIGNATURE : paypalAPISignature,
    PAYPAL_CHECKOUT_URL : paypalCheckoutURL,
    PAYPAL_SANDBOX : paypalIsSandbox,
    PAYPAL_APP_ID : paypalApplicationID


}
