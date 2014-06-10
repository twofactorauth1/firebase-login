/**
 * COPYRIGHT INDIGENOUS.IO, LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../models/base.model.js');

var campaignMessage = $$.m.ModelBase.extend({

    defaults: function() {
        return {
            _id: null,
            campaignId: null,
            subject: null,
            fromEmail: null,
            fromName: null,
            contactId: null,
            contactName: null,
            contactEmail: null,
            sendAt: null, // YYYY-MM-DD HH:MM:SS
            mergeVarsArray: null,
            messageStatus: null,
            externalId: null,
            _v:"0.1"
        }
    },


    initialize: function(options) {

    }

}, {
    db: {
        storage: "mongo",
        table: "campaign_messages",
        idStrategy: "uuid"
    }
});

$$.m.CampaignMessage = campaignMessage;

module.exports = campaignMessage;
