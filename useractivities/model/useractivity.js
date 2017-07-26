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

    },

    getFormattedDate: function(dateField, offset){
        var dateString = "";
        if(offset){
            offset = parseInt(offset);
            dateString = moment.utc(this.get("start")).utcOffset(offset).format("MM/DD/YYYY HH:mm a");
        }
        else{
            dateString = this.get(dateField) ? moment(this.get(dateField)).format("MM/DD/YYYY HH:mm A") : '';
        }
        return dateString;
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
        CREATE_ACCOUNT: 'CREATE_ACCOUNT',
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
        ADD_ORDER_NOTE: 'ADD_ORDER_NOTE',
        CREATE_PRODUCT: 'CREATE_PRODUCT',
        UPDATE_PRODUCT: 'UPDATE_PRODUCT',
        DELETE_PRODUCT: 'DELETE_PRODUCT',
        UPLOAD_CONTACT_PHOTO: 'UPLOAD_CONTACT_PHOTO',
        REMOVE_SOCIAL_CREDENTIALS: 'REMOVE_SOCIAL_CREDENTIALS',
        MODIFY_PREFERENCES: 'MODIFY_PREFERENCES',
        RESET_PASSWORD: 'RESET_PASSWORD',
        UPDATE_USER: 'UPDATE_USER',
        DELETE_USER: 'DELETE_USER',
        CREATE_STRIPE_CUSTOMER: 'CREATE_STRIPE_CUSTOMER',
        UPDATE_STRIPE_CUSTOMER: 'UPDATE_STRIPE_CUSTOMER',
        DELETE_STRIPE_CUSTOMER: 'DELETE_STRIPE_CUSTOMER',
        CREATE_STRIPE_PLAN: 'CREATE_STRIPE_PLAN',
        UPDATE_STRIPE_PLAN: 'UPDATE_STRIPE_PLAN',
        DELETE_STRIPE_PLAN: 'DELETE_STRIPE_PLAN',
        CREATE_STRIPE_SUB: 'CREATE_STRIPE_SUB',
        UPDATE_STRIPE_SUB: 'UPDATE_STRIPE_SUB',
        CANCEL_STRIPE_SUB: 'CANCEL_STRIPE_SUB',
        CREATE_STRIPE_CARD: 'CREATE_STRIPE_CARD',
        UPDATE_STRIPE_CARD: 'UPDATE_STRIPE_CARD',
        DELETE_STRIPE_CARD: 'DELETE_STRIPE_CARD',
        CREATE_STRIPE_CHARGE: 'CREATE_STRIPE_CHARGE',
        UPDATE_STRIPE_CHARGE: 'UPDATE_STRIPE_CHARGE',
        CAPTURE_STRIPE_CHARGE: 'CAPTURE_STRIPE_CHARGE',
        CREATE_STRIPE_INVOICEITEM: 'CREATE_STRIPE_INVOICEITEM',
        UPDATE_STRIPE_INVOICEITEM: 'UPDATE_STRIPE_INVOICEITEM',
        DELETE_STRIPE_INVOICEITEM: 'DELETE_STRIPE_INVOICEITEM',
        CREATE_STRIPE_INVOICE: 'CREATE_STRIPE_INVOICE',
        UPDATE_STRIPE_INVOICE: 'UPDATE_STRIPE_INVOICE',
        PAY_STRIPE_INVOICE: 'PAY_STRIPE_INVOICE',
        CREATE_STRIPE_TOKEN: 'CREATE_STRIPE_TOKEN',
        CONNECT_STRIPE_ACCOUNT: 'CONNECT_STRIPE_ACCOUNT',
        SOCIAL_LOGIN: 'SOCIAL_LOGIN',
        RESET_PASSWORD: 'RESET_PASSWORD',
        ADD_SOCIAL_ACCOUNT: 'ADD_SOCIAL_ACCOUNT',
        UPDATE_SOCIAL_CONFIG: 'UPDATE_SOCIAL_CONFIG',
        REMOVE_SOCIAL_ACCOUNT: 'REMOVE_SOCIAL_ACCOUNT',
        CREATE_FACEBOOK_POST: 'CREATE_FACEBOOK_POST',
        SHARE_FACEBOOK_LINK: 'SHARE_FACEBOOK_LINK',
        DELETE_FACEBOOK_POST: 'DELETE_FACEBOOK_POST',
        ADD_FACEBOOK_COMMENT: 'ADD_FACEBOOK_COMMENT',
        ADD_FACEBOOK_LIKE: 'ADD_FACEBOOK_LIKE',
        DELETE_FACEBOOK_LIKE: 'DELETE_FACEBOOK_LIKE',
        ADD_TWITTER_POST: 'ADD_TWITTER_POST',
        ADD_TWITTER_REPLY: 'ADD_TWITTER_REPLY',
        ADD_TWITTER_RETWEET: 'ADD_TWITTER_RETWEET',
        ADD_TWITTER_DM: 'ADD_TWITTER_DM',
        DELETE_TWITTER_POST: 'DELETE_TWITTER_POST',
        IMPORT_GOOGLE_CONTACTS: 'IMPORT_GOOGLE_CONTACTS',
        IMPORT_LINKEDIN_CONTACTS: 'IMPORT_LINKEDIN_CONTACTS',
        ADD_LINKEDING_POST: 'ADD_LINKEDIN_POST',
        ADD_USER_TO_ACCOUNT_OK: 'ADD_USER_TO_ACCOUNT_OK',
        ADD_USER_TO_ACCOUNT_NOK: 'ADD_USER_TO_ACCOUNT_NOK',
        UNLOCK_WORKSTREAM: 'UNLOCK_WORKSTREAM',
        MARK_WORKSTREAM_COMPLETE: 'MARK_WORKSTREAM_COMPLETE',
        MARK_BLOCK_COMPLETE: 'MARK_BLOCK_COMPLETE'
    }
});

$$.m.UserActivity = userActivity;

module.exports = userActivity;
