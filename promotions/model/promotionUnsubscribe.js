/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2017
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../models/base.model.js');

var promotionUnsubscribe = $$.m.ModelBase.extend({

    defaults: function() {
        return {
            _id: null,
            accountId:null,
            email: null,
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
        table: "promotion_unsubscribes",
        idStrategy: "uuid"
    }
});

$$.m.promotionUnsubscribe = promotionUnsubscribe;

module.exports = promotionUnsubscribe;
