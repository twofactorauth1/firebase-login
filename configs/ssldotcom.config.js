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
    SSLDOTCOM_SERVER_SOFTWARE: '39', //constant for Amazon LB
    /*
     * Registration configuration
     */
    REG_ORGANIZATION:'Indigenous Software, Inc',
    REG_ORGANIZATION_UNIT:'',
    REG_PO_BOX:'',
    REG_STREET_ADDRESS_1:'5580 La Jolla Blvd.',
    REG_STREET_ADDRESS_2:'#471',
    REG_STREET_ADDRESS_3:'',
    REG_LOCALITY:'La Jolla',
    REG_STATE:'California',
    REG_POSTAL_CODE:'92037',
    REG_COUNTRY:'US',

    /*
     * Contact configuration
     */
    CONTACT_FNAME:'Kyle',
    CONTACT_LNAME:'Miller',
    CONTACT_EMAIL:'admin@indigenous.io',
    CONTACT_PHONE:'402-517-6094',
    CONTACT_COUNTRY:'US'

}
