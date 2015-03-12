/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2015
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */


var prerenderToken = process.env.PRERENDER_TOKEN || 'zGq6CesNtm0s9kUTJXhG';
var recacheURL = process.env.PRERENDER_RECACHE_URL || 'http://api.prerender.io/recache';

module.exports = {
    PRERENDER_TOKEN: prerenderToken,
    RECACHE_URL: recacheURL
}
