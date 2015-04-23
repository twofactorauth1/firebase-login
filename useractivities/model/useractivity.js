/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('./../../models/base.model.js');

var userActivity = $$.m.ModelBase.extend({




    defaults: function() {
        return {
            _id: null,
            accountId: 0,
            userId: 0,
            activityType:'',
            note: '',
            detail:'',
            start:new Date(), //datestamp
            v:0.1
        }
    },


    initialize: function(options) {

    }

}, {
    db: {
        storage: "mongo",
        table: "useractivities",
        idStrategy: "uuid"
    },
    types: {
        LOGIN: 'LOGIN',
        LOGOUT: 'LOGOUT',
        REAUTH: 'REAUTH',
        MODIFY_ACCOUNT_BILLING: 'MODIFY_ACCOUNT_BILLING',
        MODIFY_ACCOUNT: 'MODIFY_ACCOUNT',
        DELETE_ACCOUNT: 'DELETE_ACCOUNT'

    }
});

$$.m.UserActivity = userActivity;

module.exports = userActivity;
