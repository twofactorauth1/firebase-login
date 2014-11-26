/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var analyticsJobMS = process.env.ANALYTICS_JOB_MS || 20000;
var secondsSinceLastPingThreshold = process.env.ANALYTICS_LAST_PING_SECONDS || 120;
var runJob = false || process.env.ANALYTICS_RUN_JOB;

var collater = require('../analytics/analytics_collater');

module.exports = {

    ANALYTICS_JOB_MS: analyticsJobMS,
    ANALYTICS_LAST_PING_SECONDS: secondsSinceLastPingThreshold,

    intervalObj : null,


    startJob: function() {
        var self = this;
        if(runJob =='true') {
            self.intervalObj = setInterval(collater.findCheckGroupAndSend, analyticsJobMS);
        } else {
            console.log('Skipping analytics job');
        }

    },

    stopJob: function() {
        var self = this;

        if (self.intervalObj != null) {
            clearInterval(self.intervalObj);
        }
        self.intervalObj = null;

    }
}