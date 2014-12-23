/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */


var urlbox_template = process.env.URLBOX_URLTEMPLATE || 'https://api.urlbox.io/v1/%s/%s/png?%s';
var urlbox_key = process.env.URLBOX_KEY || 'de7626dc-ee09-4700-999a-96c3ebcf187a';
var urlbox_secret = process.env.URLBOX_SECRET || 'e08df86a-1852-4db2-ae3e-e8596c601155';

module.exports = {

    URLBOX_URLTEMPLATE: urlbox_template,
    URLBOX_KEY: urlbox_key,
    URLBOX_SECRET: urlbox_secret
}
