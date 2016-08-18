/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../models/base.model');

var customer = $$.m.ModelBase.extend({




    defaults: function() {
        return {
            _id: null,
            accountId: 0,

            created:{
                date:new Date(),
                by:0
            },
            modified:{
                date:new Date(),
                by:0
            },
            v:0.1
        }
    },


    initialize: function(options) {

    }

}, {
    db: {
        storage: "mongo",
        table: "customers",
        idStrategy: "uuid"
    }
});

$$.m.Customer = customer;

module.exports = customer;
