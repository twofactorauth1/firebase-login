/**
 * COPYRIGHT INDIGENOUS.IO, LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../models/base.model.js');

var campaign = $$.m.ModelBase.extend({

    defaults: function() {
        return {
            _id: null,
            name: null,
            description: null,
            templateName: null,
            subject: null,
            fromName: null,
            fromEmail: null,
            numberOfMessages: null,
            messageDeliveryFrequency: null,
            revision: null,
            type: null,
            _v:"0.1"
        }
    },


    initialize: function(options) {

    }

}, {
    db: {
        storage: "mongo",
        table: "campaigns",
        idStrategy: "uuid"
    }
});

$$.m.Campaign = campaign;

module.exports = campaign;
