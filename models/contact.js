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
            _v:"0.1",

            created: {
                date: "",        //Date created
                strategy: "",    // lo|fb|tw|li|etc.  See $$.constants.user.credential_types
                by: null,        //this is a nullable ID value, if created by an existing user, this will be populated.
            },


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
             *   _id:""
             *   type:int
             *   email:string
             *   photo:string
             *   phones: [{
             *       _id:"",
             *       type: string "m|w|h" //mobile, work, home
             *       number: string,
             *       default: false
             *   }],
             *   addresses: [{
             *       _id:""
             *       address:string
             *       address2:string
             *       city:string
             *       state:string
             *       zip:string
             *       country:string
             *       defaultShipping: false
             *       defaultBilling: false
             *   }]
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
