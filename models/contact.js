require('./model.base');


var contact = $$.m.ModelBase.extend({

    defaults: function() {
        return {
            _id: null,

            accountId: 0, //int
            first:"", //string,
            last:"",  //string,
            date:"",  //
            createdBy:"",

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
