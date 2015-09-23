/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2015
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var ssldotcomAccountKey = process.env.SSLDOTCOM_ACCOUNT_KEY || '68caf7c6f8ba';
var ssldotcomSecretKey = process.env.SSLDOTCOM_SECRET_KEY || '3+c2RaonM03XcQ==';

var ssldotcomTestEndpoint = 'https://sws-test.sslpki.com';
var ssldotcomMockEndpoint = 'https://private-anon-365f22217-sslcomapi.apiary-mock.com';

module.exports = {

    SSLDOTCOM_ACCOUNT_KEY: ssldotcomAccountKey,
    SSLDOTCOM_SECRET_KEY: ssldotcomSecretKey,
    SSLDOTCOM_TEST_ENDPOINT: ssldotcomTestEndpoint,
    SSLDOTCOM_MOCK_ENDPOINT: ssldotcomMockEndpoint,
    SSLDOTCOM_CSR: '',
    SSLDOTCOM_SERVER_SOFTWARE: 39 //constant for Amazon LB
}
