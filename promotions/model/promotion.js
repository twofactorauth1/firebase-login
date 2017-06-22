/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2017
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../models/base.model.js');

var promotion = $$.m.ModelBase.extend({

    defaults: function() {
        return {
            _id: null,
            title: null,
            description: null,
            accountId: null,
            userId : null,
            attachment: null,
            startDate: null,
            expirationDate: null,
            vendorName: null,
            promoImage: null,
            promoCode: null,
            products: null,
            report: null,
            type: null,
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
        table: "promotions",
        idStrategy: "uuid"
    }
});

$$.m.Promotion = promotion;

module.exports = promotion;
