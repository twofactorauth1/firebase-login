/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../models/base.model.js');


var stripeEvent = $$.m.ModelBase.extend({


    defaults: function() {
        return {
            _id: null,
            eventId: null,
            type: '',
            liveMode: false,
            created: 0,
            entered: Date.now(),
            request: '',
            body: null,
            state: 'NEW',
            accountId: 0,
            _v:"0.1"
        }
    },

    initialize: function(options) {

    },

    transients: {

    },

    serializers:  {

    }

}, {
    db: {
        storage: "mongo",
        table: "events",
        idStrategy: "uuid"
    }
});

$$.m.StripeEvent = stripeEvent;

module.exports = stripeEvent;
