/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2016
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var paypalClientID = process.env.PAYPAL_CLIENT_ID || 'Adai01SoHe9BcFr9GkfTNzys2bqUdqdpSphHVzouKPKQxxDRe1eBRKGaKNNETr5tYNf02OfG-e-YzOnO';
var paypalClientSecret = process.env.PAYPAL_CLIENT_SECRET || 'EMLp1mnLTtXX6PSgZBqnS2U6Cp4-KSUPvUxg1lpDgKEv4fHX3DUo5Ux980Qhu90Aat4fwQSZMlOZJcV5';
var paypalAPIUsername = process.env.PAYPAL_API_USERNAME || 'kyle_api1.indigenous.io';
var paypalAPIPassword = process.env.PAYPAL_API_PASSWORD || '7RHC3SGTNEULVR6Y';
var paypalAPISignature = process.env.PAYPAL_API_SIGNATURE || 'AFcWxV21C7fd0v3bYYYRCpSSRl31Alk0IwKAI2V3IGQrs1zhM9AVfiEB';

module.exports = {

    PAYPAL_CLIENT_ID : paypalClientID,
    PAYPAL_CLIENT_SECRET : paypalClientSecret,
    PAYPAL_API_USERNAME : paypalAPIUsername,
    PAYPAL_API_PASSWORD : paypalAPIPassword,
    PAYPAL_API_SIGNATURE : paypalAPISignature

}
