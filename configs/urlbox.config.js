/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */


var urlbox_template = process.env.URLBOX_URLTEMPLATE || 'https://api.urlbox.io/v1/%s/%s/png?%s';
var urlbox_key = process.env.URLBOX_KEY || '16fb9a22-8f4c-4218-92ad-fc04697100d3';
var urlbox_secret = process.env.URLBOX_SECRET || 'b670c331-70c6-47c1-ba2d-87204ece2511';

module.exports = {

    URLBOX_URLTEMPLATE: urlbox_template,
    URLBOX_KEY: urlbox_key,
    URLBOX_SECRET: urlbox_secret
}
