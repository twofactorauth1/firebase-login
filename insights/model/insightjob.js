/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2016
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../models/base.model.js');

var insightJob = $$.m.ModelBase.extend({

    defaults: function() {
        return {
            "_id" : null,
            accountId:0,
            sendToAccountOwners:false,
            scheduledTime:{
                dayOfWeek:'',//0-6
                timeOfDay:''//0-23
            },
            jobId:'',
            created: {
                date: new Date(),
                by: null
            },
            modified: {
                date: null,
                by: null
            },
            _v:"0.1"
        }
    },


    initialize: function(options) {

    }

}, {
    db: {
        storage: "mongo",
        table: "insightjobs",
        idStrategy: "uuid"
    }
});

$$.m.InsightJob = insightJob;

module.exports = insightJob;
