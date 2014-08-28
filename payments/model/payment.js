/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../models/base.model.js');


var payment = $$.m.ModelBase.extend({


    defaults: function() {
        return {
            _id: null,
            chargeId: null,
            amount: null,
            isCaptured: true,
            cardId: false,
            fingerprint: null,
            last4: null,
            cvc_check: null,
            created: 0,
            paid: false,
            refunded: false,
            amount_refunded: 0,
            balance_transaction: null,
            customerId: null,
            contactId: null,
            userId: null,
            failure_code: null,
            failure_message: null,
            invoiceId: null,
            capture_date: 0,
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
        table: "payments",
        idStrategy: "uuid"
    }
});

$$.m.Payment = payment;

module.exports = payment;
