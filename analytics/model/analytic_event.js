/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../models/base.model.js');

var analyticsEvent = $$.m.ModelBase.extend({

    defaults: function() {
        return {
            _id: null,
            type: null,
            source: null,
            accountId: null,
            timestamp: null,
            body: null,
            _v:"0.1"
        }
    },


    initialize: function(options) {

    }

}, {
    db: {
        storage: "mongo",
        table: "analytics_event",
        idStrategy: "uuid"
    }
});

$$.m.AnalyticsEvent = analyticsEvent;

module.exports = analyticsEvent;
