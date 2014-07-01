/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../models/base.model.js');


var subscription = $$.m.ModelBase.extend({


    defaults: function() {
        return {
            _id: null,
            accountId: 0,               //int
            contactId:null,             //internal contact Id
            stripeCustomerId:null,      //stripe customerId
            stripeSubscriptionId:null,  //stripe subscription Id
            stripePlanId:null,          //stripe plan Id
            isActive:true,              //boolean
            _v:"0.1"
            /*
                Additional details can go here.  The idea is to use this object to cache
                high level data from Stripe.
             */

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
        table: "subscriptions",
        idStrategy: "increment"
    }
});

$$.m.Subscription = subscription;

module.exports = subscription;
