/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var analyticsJobMS = process.env.ANALYTICS_JOB_MS || 1000 * 60 * 60;//1 hour
var secondsSinceLastPingThreshold = process.env.ANALYTICS_LAST_PING_SECONDS || 60*1;//30 minutes
var runJob = 'false';
if(process.env.ANALYTICS_RUN_JOB){
    runJob = process.env.ANALYTICS_RUN_JOB;
};
var child_process = require('child_process');
var collater = require('../analytics/analytics_collater');

module.exports = {

    ANALYTICS_JOB_MS: analyticsJobMS,
    ANALYTICS_LAST_PING_SECONDS: secondsSinceLastPingThreshold,

    intervalObj : null,


    startJob: function() {
        var self = this;
        if(runJob =='true') {
            self.intervalObj = setInterval(function(){
                console.log('calling fork');
                var child = child_process.fork('collater_runner.js', null, {silent:true});
                console.log('called fork');
            }, analyticsJobMS);


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