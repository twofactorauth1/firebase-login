/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

define([], function() {

    var model = Backbone.Model.extend({

        idAttribute: "_id",

        defaults: function() {
            return {
                _id: null,
                username:"",
                email: "",
                first:"",
                last:"",
                created: {
                    date: "",        //Date created
                    strategy: "",    // lo|fb|tw|li|etc.  See $$.constants.user.credential_types
                    by: null,        //this is a nullable ID value, if created by an existing user, this will be populated.
                    isNew: false     //If this is a brand new user, mark this as true, the application code will modify it later as necessary
                },
                profilePhotos: [],
                accounts: [],
                credentials: [],
                welcome_alert: {
                    editwebsite: true,
                    commerce: true,
                    contact: true,
                    dashboard: true,
                    marketing: true,
                    marketingsingle: true
                }
            }
        },


        getUserAccount: function(accountId) {

        },

        getOrCreatePhone: function(phoneId) {
            var details = this.get("details");
            if (details == null) {
                details = [];
                this.set({details:details});
            }

            for (var i = 0; i < details.length; i++) {
                var detail = details[i];
                if (detail.phones != null) {
                    var phone = _.find(detail.phones, function(phone) { return phone._id === phoneId });
                    if (phone != null) {
                        return phone;
                    }
                }
            }

            //Phone = null;
            detail = this.getOrCreateLocalDetails();
            var phone = {
                _id: $$.u.idutils.generateUniqueAlphaNumericShort(),
                type: $$.constants.user.phone_types.MOBILE,
                number:"",
                default:false
            };

            detail.phones.push(phone);
            return phone;
        },

        getOrCreateLocalDetails: function() {
            var details = this.get("details");
            if (details == null) {
                details = [];
                this.set({details:details});
            }

            var detail = _.find(details, function(_detail) { return _detail.type === $$.constants.user.detail_types.LOCAL });
            if (detail == null) {
                detail = {
                    _id: $$.u.idutils.generateUniqueAlphaNumericShort(),
                    type: $$.constants.user.detail_types.LOCAL,
                    emails:[],
                    photo:"",
                    phones: [],
                    address: null
                };

                details.push(detail);
            }

            return detail;
        },

        getOrCreateAddress: function(addressId) {
            var details = this.get("details");
            if (details == null) {
                details = [];
                this.set({details:details});
            }

            for (var i = 0; i < details.length; i++) {
                var detail = details[i];
                if (detail.addresses != null) {
                    var address = _.find(detail.addresses, function(address) { return address._id === addressId });
                    if (address != null) {
                        return address;
                    }
                }
            }

            //Phone = null;
            detail = this.getOrCreateLocalDetails();
            var address = {
                _id: $$.u.idutils.generateUniqueAlphaNumericShort(),
                address:null,
                address2:null,
                state:null,
                zip:null,
                country:null,
                defaultShipping:false,
                defaultBilling:false
            };

            detail.addresses = detail.addresses || [];
            detail.addresses.push(address);
            return address;
        },
        updateAddressDisplayName: function(addressId) {
            var address = this.getOrCreateAddress(addressId);

            var displayName = "";
            if (!String.isNullOrEmpty(address.address)) { displayName += address.address; }
            if (!String.isNullOrEmpty(address.address2)) { displayName += ", " + address.address2; }
            if (!String.isNullOrEmpty(address.city)) {
                if (!String.isNullOrEmpty(displayName)) {
                    displayName += ", ";
                }
                displayName += address.city;
            }
            if (!String.isNullOrEmpty(address.state)) {
                if (!String.isNullOrEmpty(displayName)) {
                    if (!String.isNullOrEmpty(address.city)) {
                        displayName += ", "
                    } else {
                        displayName += " ";
                    }
                }
                displayName += address.state
            }
            if (!String.isNullOrEmpty(address.zip)) {
                if (!String.isNullOrEmpty(displayName)) {
                    displayName += ", ";
                }
                displayName += address.zip;
            }

            address.displayName = displayName;
        },


        url: function(method) {
            switch(method) {
                case "GET":
                    return $$.api.getApiUrl("user", this.id);
                    break;
                case "PUT":
                    return $$.api.getApiUrl("user", this.id);
                    break;
                case "POST":
                    break;
                case "DELETE":
                    break;
            }
        }

    });

    $$.m.User = model;

    return model;
});
