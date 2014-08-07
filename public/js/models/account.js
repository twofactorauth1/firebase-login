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
                company: {
                    name:"",
                    type:0,
                    size:0
                },
                subdomain:"",
                website: {
                    websiteId: null,
                    themeId: null
                },
                domain:"",
                token:"",
                updateType:"",
                "business" : {
                    "logo" : '',
                    "name" : '',
                    "description" : '',
                    "category" : '',
                    "size" : '',
                    "phones" : [],
                    "addresses" : [],
                    "type" :''
                }
            };
        },



        getTmpAccount: function() {
            var url = $$.api.getApiUrl("account", "tmp");
            return this.fetchCustomUrl(url);
        },


        saveOrUpdateTmpAccount: function() {
            var url = $$.api.getApiUrl("account", "tmp");
            return this.saveCustomUrl(url);
        },

        getOrCreatePhone: function(phoneId) {
            var business = this.get("business");
            if (business == null) {
                business = {};
                this.set({business:business});
            }

            if (business.phones != null) {
                var phone = _.find(business.phones, function(phone) { return phone._id === phoneId });
                if (phone != null) {
                    return phone;
                }
            }

            business = this.getOrCreateLocalDetails();
            var phone = {
                _id: $$.u.idutils.generateUniqueAlphaNumericShort(),
                number:"",
                default:false
            };

            business.phones.push(phone);
            return phone;
        },

        getOrCreateLocalDetails: function() {
            var business = this.get("business");
            if (business == null) {
                business = {
                    logo : "",
                    name : "",
                    description : "",
                    category : "",
                    phones : [],
                    "addresses" : []
                };
                this.set({business:business});
            }
            return business;
        },

        removePhone: function(phoneId) {
            var business = this.get("business");
            if (business == null) {
                business = {};
                this.set({business:business});
            }

            if (business.phones != null) {
                var phone = _.find(business.phones, function(phone) { return phone._id === phoneId });
                if (phone != null) {
                    var index = business.phones.indexOf(phone);
                    business.phones.splice(index, 1);
                }
            }

        },
        getOrCreateAddress: function(addressId) {
            var business = this.get("business");
            if (business == null) {
                business = {};
                this.set({business:business});
            }




                if (business.addresses != null) {
                    var address = _.find(business.addresses, function(address) { return address._id === addressId });
                    if (address != null) {
                        return address;
                    }
                }


            //Phone = null;
            business = this.getOrCreateLocalDetails();
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

            business.addresses = business.addresses || [];
            business.addresses.push(address);
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
                    if (this.id == null) {
                        return $$.api.getApiUrl("account", "");
                    } else {
                        return $$.api.getApiUrl("account", this.id);
                    }
                    break;
                case "PUT":
                    if(this.get("updateType")==null) {
                        return $$.api.getApiUrl("account", this.id);
                    }
                    else if(this.get("updateType")=="website") {
                        return $$.api.getApiUrl("account", this.id+"/website");
                    }
                    else if(this.get("updateType")=="setting") {
                        return $$.api.getApiUrl("account", this.id+"/setting");
                    }
                    else if(this.get("updateType")=="displaysetting") {
                        return $$.api.getApiUrl("account", this.id+"/displaysetting");
                    }
                    else {
                        return $$.api.getApiUrl("account", this.id);
                    }
                    break;
                case "POST":
                    return $$.api.getApiUrl("account", "");
                    break;
                case "DELETE":
                    break;
            }

        }
    });

    $$.m.Account = model;

    return model;
});
