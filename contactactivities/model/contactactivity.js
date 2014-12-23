/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('./../../models/base.model.js');

var contactActivity = $$.m.ModelBase.extend({




    defaults: function() {
        return {
            _id: null,
            accountId: 0,
            contactId: 0,
            activityType:'',
            note: "",
            detail:"",
            duration:null,
            start:null, //datestamp
            end:null,   //datestamp
            v:0.1,
            extraFields:null
        }
    },


    initialize: function(options) {

    }

}, {
    db: {
        storage: "mongo",
        table: "contactactivities",
        idStrategy: "uuid"
    },
    types: {
        PAGE_VIEW: 'PAGE_VIEW',
        SUBSCRIBE: 'SUBSCRIBE',
        COURSE_SUBSCRIBE: 'COURSE_SUBSCRIBE',
        CONTACT_CREATED: 'CONTACT_CREATED',
        EMAIL: 'EMAIL',
        PHONECALL: 'PHONECALL',
        FACEBOOK_LIKE: 'FACEBOOK_LIKE',
        TWEET: 'TWEET',
        FORM_SUBMISSION: 'FORM_SUBMISSION',
        EMAIL_DELIVERED: 'EMAIL_DELIVERED',
        EMAIL_OPENED: 'EMAIL_OPENED',
        EMAIL_CLICKED: 'EMAIL_CLICKED',
        EMAIL_UNSUB: 'EMAIL_UNSUB',
        SUBSCRIPTION_PAID: 'SUBSCRIPTION_PAID',
        SUBSCRIBE_CANCEL: 'SUBSCRIBE_CANCEL'
    }
});

$$.m.ContactActivity = contactActivity;

module.exports = contactActivity;
