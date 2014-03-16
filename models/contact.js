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
             *   location: ""  //Location string
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
             *       type: string "m|w|h|o" //mobile, work, home, other
             *       number: string,
             *       default: false
             *   }],
             *   addresses: [{
             *       _id:""
             *       type: string "w|h|o"
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


    getEmails: function() {
        var details = this.get("details")
            , emails = [];

        if (details == null || details.length == 0) {
            return emails;
        }

        details.forEach(function(detail) {
            if (detail && detail.emails != null) {
                detail.emails.forEach(function(email) {
                    if (emails.indexOf(email) == -1) {
                        emails.push(email);
                    }
                });
            }
        });

        return emails;
    },


    getPhones: function() {
        var details = this.get("details")
            , phones = [];

        if (details == null || details.length == 0) {
            return phones;
        }

        details.forEach(function(detail) {
            if (detail && detail.phones != null) {
                detail.phones.forEach(function(phone) {
                    if (phones.indexOf(phone.number) == -1) {
                        phones.push(phone.number);
                    }
                });
            }
        });

        return phones;
    },


    getZipCodes: function() {
        var details = this.get("details"),
            zipCodes = [];

        if (details == null || details.length == 0) {
            return zipCodes;
        }

        details.forEach(function(detail) {
            if (detail && detail.addresses != null) {
                detail.addresses.forEach(function(address) {
                    if (address.zip != null && zipCodes.indexOf(address.zip) == -1) {
                        zipCodes.push(address.zip);
                    }
                });
            }
        });

        return zipCodes;
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


    updateContactInfo: function(first, middle, last, photo, photoSquare, birthday, location) {
        var o = {};

        if (first != null) o.first = first;
        if (middle != null) o.middle = middle;
        if (last != null) o.last = last;
        if (photo != null) o.photo = photo;
        if (photoSquare != null) o.photoSquare = photoSquare;
        if (birthday != null) o.birthday = birthday;
        if (location != null) o.location = location;

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
        var detail = this.getDetails(type);

        if (detail == null) {
            detail = {
                _id: $$.u.idutils.generateUniqueAlphaNumericShort(),
                type: type,
                emails:[],
                photos:{},
                phones: [],
                addresses: []
            };

            this.get("details").push(detail);
        }

        return detail;
    },


    createOrUpdateDetails: function(type, source, socialId, photoMedium, photoLarge, photoSquare, emails, websites) {
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


    createOrUpdatePhone: function(type, phoneType, phoneNumber, isDefault) {
        var details = this.getOrCreateDetails(type);

        details.phones = details.phones || [];
        var phones = details.phones;

        if (isDefault == true) {
            phones.forEach(function(phone) {
                phone.default = false;
            })
        }

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


    createAddress: function(type, addressType, address, address2, city, state, zip, country, countryCode, displayName, lat, lon, defaultShipping, defaultBilling) {
        var obj = {
            _id: $$.u.idutils.generateUniqueAlphaNumericShort(),
            type: addressType || "o",
            address:address,
            address2:address2,
            city:city,
            state:state,
            zip:zip,
            country:country,
            countryCode:countryCode,
            displayName:displayName,
            lat:lat,
            lon:lon,
            defaultShipping:defaultShipping,
            defaultBilling:defaultBilling
        };

        var details = this.getOrCreateDetails(type);
        details.addresses = details.addresses || [];

        details.addresses.push(obj);
    },


    createOrUpdateAddress: function(type, addressType, address, address2, city, state, zip, country, countryCode, displayName, lat, lon, defaultShipping, defaultBilling) {
        var existing = null;

        var details = this.getOrCreateDetails(type);

        details.addresses = details.addresses || [];

        //first check displayName, as that may be all we have
        existing = _.findWhere(details.addresses, {displayName: displayName });

        if (existing != null || !String.isNullOrEmpty(address)) {
            if (existing == null) {
                existing = _.findWhere(details.addresses, { address: address });
            }

            if (existing != null) {
                //We already have it, lets try to merge in remainder of details only if current address is empty
                existing.type = existing.type || "o";
                existing.address2 = String.isNullOrEmpty(existing.address2) ? address2 : existing.address2;
                existing.city = String.isNullOrEmpty(existing.city) ? city : existing.city;
                existing.state = String.isNullOrEmpty(existing.state) ? state : existing.state;
                existing.country = String.isNullOrEmpty(existing.country) ? country : existing.country;
                existing.countryCode = String.isNullOrEmpty(existing.countryCode) ? countryCode : existing.countryCode;
                existing.displayName = String.isNullOrEmpty(existing.displayName) ? displayName : existing.displayName;
                existing.lat = String.isNullOrEmpty(existing.lat) ? lat : existing.lat;
                existing.lon = String.isNullOrEmpty(existing.lon) ? lat : existing.lon;
            }
        }

        if (existing == null) {
            existing = _.findWhere(details.addresses, { zip: zip });

            //We have matched on zip code, if we have no existing address, lets try to fill it in.
            if (existing != null && String.isNullOrEmpty(existing.address)) {
                existing.type = existing.type || "o";
                existing.address = address;
                existing.address2 = String.isNullOrEmpty(address2) ? existing.address2 : address2;
                existing.city = String.isNullOrEmpty(city) ? existing.city : city;
                existing.state = String.isNullOrEmpty(state) ? existing.state : state;
                existing.country = String.isNullOrEmpty(country) ? existing.country : country;
                existing.countryCode = String.isNullOrEmpty(countryCode) ? existing.countryCode : countryCode;
                existing.displayName = String.isNullOrEmpty(displayName) ? existing.displayName : displayName;
                existing.lat = String.isNullOrEmpty(lat) ? existing.lat : lat;
                existing.lon = String.isNullOrEmpty(lon) ? existing.lat : lon;
                if (defaultShipping) existing.defaultShipping = true;
                if (defaultBilling) existing.defaultBilling = true;
            }
        }

        if (existing == null) {
            //we haven't found a matching address, lets add it
            var addressObj = {};
            addressObj.type = addressType || "o";
            addressObj.address = address;
            addressObj.address2 = address2;
            addressObj.city = city;
            addressObj.state = state;
            addressObj.country = country;
            addressObj.countryCode = countryCode;
            addressObj.displayName = displayName;
            addressObj.lat = lat;
            addressObj.lon = lon;
            addressObj.defaultShipping = defaultShipping;
            addressObj.defaultBilling = defaultBilling;

            details.addresses.push(addressObj);
        }
    },


    mergeContact: function(contact) {
        var self = this;
        contact = contact.toJSON();

        this.updateContactInfo(contact.first, contact.middle, contact.last, contact.photo, contact.photoSquare, contact.birthday);
        var details = contact.details;
        if (details != null && details.length > 0) {
            details.forEach(function(detail) {
                var oDetails = self.getDetails(detail.type);
                if (oDetails == null) {
                    self.get("details").push(detail);
                } else {
                    detail.photos = detail.photos || {};
                    self.createOrUpdateDetails(detail.type, detail.source, detail.socialId, detail.photoMedium,
                        detail.photoLarge, detail.photoSquare, detail.emails, detail.websites);

                    if (detail.phones != null && detail.phones.length > 0) {
                        detail.phones.forEach(function(phone) {
                            self.createOrUpdatePhone(detail.type, phone.type, phone.number, phone.isDefault);
                        })
                    }

                    if (detail.addresses != null && detail.addresses.length > 0) {
                        if (oDetails.addresses == null || oDetails.addresses.length == 0) {
                            oDetails.addresses = detail.addresses;
                        } else {
                            detail.addresses.forEach(function(address) {
                                self.createOrUpdateAddress(detail.type, address.type, address.address, address.address2,
                                    address.city, address.state, address.zip, address.country, address.countryCode,
                                    address.displayName, address.lat, address.lon, address.defaultShipping,
                                    address.defaultBilling);
                            });
                        }
                    }
                }
            });
        }
    },


    setPossibleDuplicate: function(contact) {
        var dups = this.get("dups");
        if (dups == null) {
            dups = [];
            this.set({dups:dups});
        }

        var self = this;
        if (_.isArray(contact)) {
            contact.forEach(function(duplicateContact) {
                if(dups.indexOf(duplicateContact.id()) == -1){
                    dups.push(duplicateContact.id());
                }
            });
        } else {
            var id = contact.id();
            if (dups.indexOf(id) == -1) {
                dups.push(id);
            }
        }

        return contact;
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
