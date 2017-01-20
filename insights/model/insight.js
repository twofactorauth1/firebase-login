/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2016
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../models/base.model.js');

var insight = $$.m.ModelBase.extend({

    defaults: function() {
        return {
            "_id" : null,
            accountId:0,
            configuration:{
                startDate:null,
                endDate:null,
                scheduledDate:null,
                sendToAccountOwners:false
            },

            exclusions:[],
            expiredTrials:[],
            invalidSubscriptions:[],
            includedAccounts:[],
            processedAccounts:[],
            emailMessageIds:[],
            completedDate:null,
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
        table: "insights",
        idStrategy: "uuid"
    }
});

$$.m.Insight = insight;

module.exports = insight;
