/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2015
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var leadDynoKey = process.env.LEADDYNO_KEY || 'b2a1f6ba361b15f4ce8ad5c36758de951af61a50';
var leadDynoPrivateKey = process.env.LEADDYNO_PRIVATE_KEY || '42746bce02cfd7653decdef94dbbc1df1927bec5';
var leadDynoEnabled = process.env.ENABLE_LEADDYNO || 'false';
var leadDynoDefaultPlan = process.env.LEADDYNO_DEFAULT_PLAN || 'default';
var leadDynoAPIURL = process.env.LEADDYNO_API_URL || 'https://api.leaddyno.com/v1';

module.exports = {
    LEAD_DYNO_KEY : leadDynoKey,
    LEAD_DYNO_PRIVATE_KEY : leadDynoPrivateKey,
    LEAD_DYNO_ENABLED : leadDynoEnabled,
    LEAD_DYNO_DEFAULT_PLAN : leadDynoDefaultPlan,
    LEAD_DYNO_API_URL: leadDynoAPIURL
}
