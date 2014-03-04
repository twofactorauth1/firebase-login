require('./model.base');


var contact = $$.m.ModelBase.extend({

    defaults: function() {
        return {
            _id: null,

            accountId: 0,           //int
            first:null,             //string,
            middle:null,            //string,
            last:null,              //string,
            photo:"",               //string,
            type:"c",               //contact_types
            _v:"0.1",

            created: {
                date: "",           //Date created
                by: null,           //this is a nullable ID value, if created by an existing user, this will be populated.
                strategy: "",       // lo|fb|tw|li|etc.  See $$.constants.user.credential_types
                socialId: null      //The socialId of the source of this contact, if applicable
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
             *   emails: []
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
             *       country:string,
             *       countryCode:string
             *       displayName:string,
             *       lat:"",
             *       lon:"",
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

            //Clean out addresses
            if (json.details != null && json.details.length > 0) {
                json.details.forEach(function(details) {
                    if (details.addresses != null && details.addresses.length > 0) {
                        for (var i = details.addresses.length; i > 0; i--) {
                            //check to see if address is empty, if so, remove it.
                            var add = details.addresses[i];
                            if (add != null) {
                                if (String.isNullOrEmpty(add.address) && String.isNullOrEmpty(add.address2) &&
                                    String.isNullOrEmpty(add.city) && String.isNullOrEmpty(add.state) && String.isNullOrEmpty(add.zip) &&
                                    String.isNullOrEmpty(add.lat)) {

                                    details.addresses.splice(i,1);
                                }
                            }
                        }
                    }
                });
            }
        }
    },


    createdBy: function(userId, socialType, socialId) {
        var created = {
            date: new Date().getTime(),
            by: userId,
            strategy: socialType,
            socialId: socialId
        };

        this.set({created:created});
    },


    addNote: function(enteredBy, note) {
        var _note = {
            enteredBy: enteredBy,
            note: note,
            date: new Date().getTime()
        };

        var notes = this.get("notes");
        if (notes == null) {
            notes = [];
            this.set({notes:notes});
        }
        notes.push(_note);
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
