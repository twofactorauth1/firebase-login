/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../models/base.model.js');
/**
 * There is one subscriptionPrivilege record per subscription.
 *
 */
var subscriptionPrivilege = $$.m.ModelBase.extend({


    defaults: function() {
        return {
            _id: null,
            accountId: 0,
            subscriptionName: '',
            subscriptionId: null,
            //when the subscription is active, these privileges are granted
            activePrivs: [],
            //when the subscription has expired, these privileges are granted
            expiredPrivs: [],

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
        table: "subscription_privileges",
        idStrategy: "uuid",
        cache: true
    }
});

$$.m.SubscriptionPrivilege = subscriptionPrivilege;

module.exports = subscriptionPrivilege;
