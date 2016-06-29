/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2016
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var paypalClientID = process.env.PAYPAL_CLIENT_ID || 'Adai01SoHe9BcFr9GkfTNzys2bqUdqdpSphHVzouKPKQxxDRe1eBRKGaKNNETr5tYNf02OfG-e-YzOnO';
var paypalClientSecret = process.env.PAYPAL_CLIENT_SECRET || 'EMLp1mnLTtXX6PSgZBqnS2U6Cp4-KSUPvUxg1lpDgKEv4fHX3DUo5Ux980Qhu90Aat4fwQSZMlOZJcV5';

var paypalAPIUsername = process.env.PAYPAL_API_USERNAME || 'kyle+business1_api1.indigenous.io';//'paypal-facilitator_api1.indigenous.io';
var paypalAPIPassword = process.env.PAYPAL_API_PASSWORD || 'AXD2WJ292M5GYTB6';//'N3TBZGQMYEW66MTH';
var paypalAPISignature = process.env.PAYPAL_API_SIGNATURE || 'AkIU8rSQk.Oy5oGjp7-B9Oi15i8wASpz3NNY6GVHsDf4YnMxck0yqWrX';//'AFcWxV21C7fd0v3bYYYRCpSSRl31AHk7UU9Y3mtj6J5BdfSV61PJ2Mu';
var paypalCheckoutURL = process.env.PAYPAL_CHECKOUT_URL || 'https://www.sandbox.paypal.com/webapps/adaptivepayment/flow/pay';
var paypalIsSandbox = process.env.PAYPAL_SANDBOX;// || true;
var paypalApplicationID = process.env.PAYPAL_APP_ID || 'APP-80W284485P519543T';
if(!paypalIsSandbox) {
    paypalIsSandbox = true;
}
if(paypalIsSandbox === 'false') {
    paypalIsSandbox = false;
}

var realUserName = 'paypal_api1.indigenous.io';
var realPassword = '7ZQUHXA6AHBDZ4E5';
var realSig = 'A3B-XY1YH2mVmpxut0JgN3TxM.FrAEkGvbCO9E4HhaLzYxnG-h-3Z84L';
var realUrl = 'https://www.paypal.com/webapps/adaptivepayment/flow/pay';
var realApplicationID = 'APP-10L3791004814583C';

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
