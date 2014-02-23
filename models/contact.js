require('./model.base');


var contact = $$.m.ModelBase.extend({

    defaults: function() {
        return {
            _id: null,

            accountId: 0,   //int
            first:"",       //string,
            middle:"",      //string,
            last:"",        //string,
            photo:"",       //string,
            type:"c",       //contact_types
            cDate:null,     //Created Date
            cBy:null,       //Created By
            mDate:null,     //ModifiedDate
            mBy:null,       //Modified By
            _v:"0.1",

            /**
             * Array of site activity objects of the form:
             *
             * [{
             *  LastActive:null, //days
             *  Purchased:true|false
             *  EmailStats: {
             *      EmailsSent:0,
             *      EmailsOpened:0,
             *      LastEmail:null //datestamp
             *  },
             *  CallStats: {
             *      CallsMade:0,
             *      CallsAnswered:0,
             *      LastPickup:null //datestamp
             *  }
             * }]
             */
            siteActivity: [],

            /**
             * @notes
             *
             * Stores an array of notes object in the following form:
             * [{
             *   date:"",
             *   enteredBy:0,
             *   note:""
             * }]
             */
            notes: [],

            /**
             * @details
             *
             * stores an array of information collected from different sources,
             * either local or social.
             * [{
             *   type:int
             *   email:string
             *   photo:string
             *   phones: [{
             *       type: string "m|w|h" //mobile, work, home
             *       number: string
             *   }],
             *   address: {
             *       address:string
             *       address2:string
             *       city:string
             *       state:string
             *       zip:string
             *       country:string
             *   }
             * }]
             */
            details: []
        }
    },


    initialize: function(options) {

    },


    transients: {
        public: ["_first","_last","_full"]
    },


    serializers:  {
        db: function(json) {
            json._first = this.get("first") ? this.get("first").toLowerCase() : null;
            json._last = this.get("last") ? this.get("last").toLowerCase() : null;
            json._full = json._first + " " + json._last;
        }
    },


    addNote: function(enteredBy, note) {
        var note = {
            enteredBy: enteredBy,
            note: note,
            date: new Date().getTime()
        }

        this.notes = this.notes || [];
        this.notes.push(note);
    }

}, {
    db: {
        storage: "mongo",
        table: "contacts",
        idStrategy: "increment"
    }
});

$$.m.Contact = contact;

module.exports = contact;
