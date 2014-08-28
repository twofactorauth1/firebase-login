/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../models/base.model.js');


var customerLink = $$.m.ModelBase.extend({


    defaults: function() {
        return {
            _id: null,
            accountId: null,
            contactId: null,
            userId: null,
            customerId: null,
            created: 0,
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
        table: "customer_link",
        idStrategy: "increment"
    }
});

$$.m.CustomerLink = customerLink;

module.exports = customerLink;
