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
            photoSquare:"",          //string,
            birthday:null,          //string
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
             *   _id:"",
             *   socialId:"",  //The social Id from where these details came
             *   type:int
             *   source: //  This will be the source of the contact.  For instance, if the contact was created from a Facebook import,
             *               the source is the Facebook ID of the user who's import originally created this contact
             *   emails: []
             *   photos: {
             *      square: ""
             *      small: ""
             *      medium: ""
             *      large: ""
             *   }
             *   websites:[]
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


    getSocialId: function(socialType) {
        var details = this.getDetails(socialType);
        if (details != null) {
            return details.socialId;
        }
        return null;
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


    updateContactInfo: function(first, middle, last, photo, photoSquare, birthday) {
        var o = {};

        if (first != null) o.first = first;
        if (middle != null) o.middle = middle;
        if (last != null) o.last = last;
        if (photo != null) o.photo = photo;
        if (photoSquare != null) o.photoSquare = photoSquare;
        if (birthday != null) o.birthday = birthday;

        this.set(o);
    },


    getDetails: function(type) {
        var details = this.get("details");
        if (details == null) {
            details = [];
            this.set({details:details});
        }

        return _.find(details, function(_detail) { return _detail.type === type });
    },


    getOrCreateDetails: function(type) {
        var details = this.get("details");
        if (details == null) {
            details = [];
            this.set({details:details});
        }

        var detail = _.find(details, function(_detail) { return _detail.type === type });
        if (detail == null) {
            detail = {
                _id: $$.u.idutils.generateUniqueAlphaNumericShort(),
                type: type,
                email:"",
                photo:"",
                phones: [],
                address: null
            };

            details.push(detail);
        }

        return detail;
    },


    createOrUpdateDetails: function(type, source, socialId, photoSmall, photoMedium, photoLarge, photoSquare, emails, websites) {
        var details = this.getOrCreateDetails(type);

        if (source != null) {
            details.source = source;
        }

        if (socialId != null) {
            details.socialId = socialId;
        }

        var photos = details.photos;
        if (photos == null) {
            photos = {};
            details.photos = photos;
        }

        if (photoSmall != null) { photos.photoSmall = photoSmall; }
        if (photoMedium != null) { photos.photoMedium = photoMedium; }
        if (photoLarge != null) { photos.photoLarge = photoLarge; }
        if (photoSquare != null) { photos.photoSquare = photoSquare; }


        if (emails != null) {
            details.emails = details.emails || [];
            if (_.isString(emails)) {
                if (details.emails.indexOf(emails) == -1) {
                    details.emails.push(emails);
                }
            } else {
                for (var i = 0; i < emails.length; i++) {
                    if (details.emails.indexOf(emails[i]) == -1) { details.emails.push(emails[i]); }
                }
            }
        }


        if (websites != null) {
            details.websites = details.websites || [];
            if (_.isString(websites)) {
                if (details.websites.indexOf(websites) == -1) {
                    details.websites.push(websites);
                }
            } else {
                for (var i = 0; i < websites.length; i++) {
                    if (details.websites.indexOf(websites[i]) == -1) { details.websites.push(websites[i]); }
                }
            }
        }
    },


    createOrUpdatePhone: function(detailsType, phoneType, phoneNumber, isDefault) {
        var details = this.getOrCreateDetails(detailsType);

        var phones = details.phones || [];

        var phone = _.findWhere(phones, {type:phoneType, number:phone});
        if (phone == null) {
            phone = {
                _id: $$.u.idutils.generateUniqueAlphaNumericShort(),
                type: phoneType,
                number: phoneNumber,
                default: isDefault
            };
            phones.push(phone);
        } else {
            phone.default = isDefault;
        }


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
