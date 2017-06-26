/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2017
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../models/base.model.js');

var shipment = $$.m.ModelBase.extend({

    defaults: function() {
        return {
            _id: null,
            cardCode: null,
            companyName: null,
            customer: null,
            promotionId: null,
            attachment: null,
            products: null,
            shipDate: null,
            configDate: null,
            deployDate: null,
            endDate: null,
            status: null,
            accountId: null,
            userId : null,
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
        table: "shipments",
        idStrategy: "uuid"
    }
});

$$.m.Shipment = shipment;

module.exports = shipment;
