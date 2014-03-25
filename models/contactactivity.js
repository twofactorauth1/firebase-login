/**
 * COPYRIGHT CMConsulting LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact christopher.mina@gmail.com for approval or questions.
 */

require('./model.base');

var contactActivity = $$.m.ModelBase.extend({

    defaults: function() {
        return {
            _id: null,

            contactId: 0,
            activityType:0,
            note: "",
            detail:"",
            duration:null,
            start:null, //datestamp
            end:null,   //datestamp
            v:0.1
        }
    },


    initialize: function(options) {

    }

}, {
    db: {
        storage: "mongo",
        table: "contactactivities",
        idStrategy: "uuid"
    }
});

$$.m.ContactActivity = contactActivity;

module.exports = contactActivity;
