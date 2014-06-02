/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@INDIGENOUS SOFTWARE, INC. for approval or questions.
 */

module.exports = {
    /**
     * This value is the OAuth 2.0 client ID for our application
     */
    CLIENT_ID: '38ab9a0d0aca417bb109f1d33b118b25',

    /**
     * This value is the OAuth 2.0 shared secret for our application
     */
    CLIENT_SECRET: '3edcd77cb8f24a3699703c974649ac0f',

    /**
     * This is the URL to which our application should redirect the user in order to authorize access to his or her
     * RunKeeper account
     */
    AUTHORIZATION_URL: 'https://runkeeper.com/apps/authorize',

    /**
     * This is the URL at which our application can convert an authorization code to an access token
     */
    ACCESS_TOKEN_URL: "https://runkeeper.com/apps/token",

    /**
     * This is the URL at which your application can disconnect itself from the user's account
     */
    DEAUTHORIZATION_URL: "https://runkeeper.com/apps/de-authorize",

    /**
     * RunKeeper's API endpoint
     */
    API_BASE_URL: "https://api.runkeeper.com",

    /**
     * The page on our Indigenous site where the Health Graph API should redirect the user after accepting or denying
     * the access request
     */
    REDIRECT_URL: 'http://localhost:3000/api/1.0/runkeeperadapter/subscription'
}
