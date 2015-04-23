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
        DELETE_ACCOUNT: 'DELETE_ACCOUNT',
        CREATE_ASSET: 'CREATE_ASSET',
        UPDATE_ASSET: 'UPDATE_ASSET',
        DELETE_ASSET: 'DELETE_ASSET',
        CREATE_CAMPAIGN: 'CREATE_CAMPAIGN',
        UPDATE_CAMPAIGN: 'UPDATE_CAMPAIGN',
        CANCEL_CAMPAIGN: 'CANCEL_CAMPAIGN',
        UPDATE_WEBSITE_SETTINGS: 'UPDATE_WEBSITE_SETTINGS',
        DELETE_PAGE_VERSION: 'DELETE_PAGE_VERSION',
        REVERT_PAGE: 'REVERT_PAGE',
        CREATE_PAGE: 'CREATE_PAGE',
        UPDATE_PAGE: 'UPDATE_PAGE',
        DELETE_PAGE: 'DELETE_PAGE',
        CREATE_BLOGPOST: 'CREATE_BLOGPOST',
        UPDATE_BLOGPOST: 'UPDATE_BLOGPOST',
        DELETE_BLOGPOST: 'DELETE_BLOGPOST',
        CREATE_CONTACT: 'CREATE_CONTACT',
        UPDATE_CONTACT: 'UPDATE_CONTACT',
        DELETE_CONTACT: 'DELETE_CONTACT',
        CREATE_USER: 'CREATE_USER',
        MERGE_CONTACTS: 'MERGE_CONTACTS',
        CREATE_ACTIVITY: 'CREATE_ACTIVITY',
        MARK_ACTIVITY_READ: 'MARK_ACTIVITY_READ',
        CREATE_ORDER: 'CREATE_ORDER',
        COMPLETE_ORDER: 'COMPLETE_ORDER',
        CANCEL_ORDER: 'CANCEL_ORDER',
        REFUND_ORDER: 'REFUND_ORDER',
        HOLD_ORDER: 'HOLD_ORDER',
        ADD_ORDER_NOTE: 'ADD_ORDER_NOTE'

    }
});

$$.m.UserActivity = userActivity;

module.exports = userActivity;
