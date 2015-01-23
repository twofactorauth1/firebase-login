/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../models/base.model.js');

var campaign_flow = $$.m.ModelBase.extend({

    defaults: function() {
        return {
            _id: null,
            campaignId: null,
            accountId: 0,
            contactId: 0,
            startDate: null,
            lastStep: 0,
            steps: [],

            "created": {
                "date": new Date(),
                "by": null
            },
            "modified": {
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
        table: "campaign_flow",
        idStrategy: "uuid"
    }
});

$$.m.CampaignFlow = campaign_flow;

module.exports = campaign_flow;
