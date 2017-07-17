/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2017
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../models/base.model.js');

var quoteCartItem = $$.m.ModelBase.extend({

    defaults: function() {
        return {
            _id: null,
            accountId: null,
            userId : null,
            items:[],
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
        table: "quote_cart_items",
        idStrategy: "uuid"
    }
});

$$.m.QuoteCartItem = quoteCartItem;

module.exports = quoteCartItem;
