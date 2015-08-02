/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2015
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var leadDynoKey = process.env.LEADDYNO_KEY || 'b2a1f6ba361b15f4ce8ad5c36758de951af61a50';
var leadDynoEnabled = process.env.ENABLE_LEADDYNO || 'false';


module.exports = {
    LEAD_DYNO_KEY : leadDynoKey,
    LEAD_DYNO_ENABLED : leadDynoEnabled
}
