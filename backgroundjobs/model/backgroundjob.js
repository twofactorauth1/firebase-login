/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2017
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../models/base.model.js');

var backgroundJob = $$.m.ModelBase.extend({

    defaults: function() {
        return {
            _id: null,
            accountId: 0,
            name: "",
            restartAble:false,
            restartCode:null,
            progressPct:0,
            itemsCompleted:0,
            itemsTotal:0,
            startTime:null,
            endTime:null,
            estimatedRemaining:null,
            status:'PENDING',
            created: {
                "date": new Date(),
                "by": null
            },
            modified: {
                "date": null,
                "by": null
            },
            "_v": "0.1"
        }
    },


    initialize: function(options) {

    }

}, {
    db: {
        storage: "mongo",
        table: "backgroundjobs",
        idStrategy: "uuid"
    },
    status: {
        DRAFT:'PENDING',
        RUNNING:'RUNNING',
        COMPLETED:'COMPLETED',
        CANCELLED:'CANCELLED'
    }
});

$$.m.BackgroundJob = backgroundJob;

module.exports = backgroundJob;
