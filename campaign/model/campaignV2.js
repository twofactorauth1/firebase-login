/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../models/base.model.js');

var campaignV2 = $$.m.ModelBase.extend({

    defaults: function() {
        return {
            _id: null,
            accountId: 0,
            name: "",
            contacts:[],
            contactTags: [],
            searchTags: {
              operation: 'set',
              tags: []
            },

            statistics: {
                emailsBounced:0,
                emailsSent: 0,
                emailsOpened: 0,
                emailsClicked: 0,
                participants: 0
            },

            status: "DRAFT",//DRAFT, RUNNING, COMPLETED, CANCELLED
            type: "onetime", //onetime | autoresponder
            emailSettings: {
                emailId:'',
                fromName:'',
                fromEmail:'',
                bcc:'',
                replyTo:'',
                subject:'',
                sendAt:{

                }
            },
            "created": {
                "date": new Date(),
                "by": null
            },
            "modified": {
                "date": null,
                "by": null
            },
            "_v": "0.2" // VERSION 2!
        }
    },


    initialize: function(options) {

    }

}, {
    db: {
        storage: "mongo",
        table: "campaigns",
        idStrategy: "uuid"
    },
    status: {
        DRAFT:'DRAFT',
        RUNNING:'RUNNING',
        COMPLETED:'COMPLETED',
        CANCELLED:'CANCELLED'
    }
});

$$.m.CampaignV2 = campaignV2;

module.exports = campaignV2;
