/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2016
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../models/base.model.js');

var unsubscription = $$.m.ModelBase.extend({

    defaults: function() {
        return {
            _id: null,
            emailAddress:null,
            event:null,
            resubscribed: false,

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
        table: "unsubscriptions",
        idStrategy: "uuid"
    }
});

$$.m.Unsubscription = unsubscription;

module.exports = unsubscription;
