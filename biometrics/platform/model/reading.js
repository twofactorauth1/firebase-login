/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@INDIGENOUS SOFTWARE, INC. for approval or questions.
 */

require('./../../../models/base.model.js');

var reading = $$.m.ModelBase.extend({

    defaults: function() {
        /**
         * time: seconds since epoch
         */
        return {
            _id: null,
            deviceId: null,
            contactId: null,
            externalId: null,
            readingTypeId: null,
            time: null,
            endTime: null,
            values: null,
            _v:"0.1"
        }
    },

    initialize: function(options) {

    }

}, {
    db: {
        storage: "mongo",
        table: "readings",
        idStrategy: "uuid"
    }
});

$$.m.Reading = reading;

module.exports = reading;
