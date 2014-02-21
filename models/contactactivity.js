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
            end:null   //datestamp
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
