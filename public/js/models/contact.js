/**
 * COPYRIGHT INDIGENOUS.IO, LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

define([], function() {

    var model = Backbone.Model.extend({

        idAttribute: "_id",

        defaults: {
            _id: null,

            accountId: 0,           //int
            first:null,             //string,
            middle:null,            //string,
            last:null,              //string,
            photo:"",               //string,
            photoSquare:"",          //string,
            birthday:null,          //string,
            starred:false,          //true|false
            type:"c",               //contact_types
            _v:"0.1",

            created: {
                date: "",           //Date created
                by: null,           //this is a nullable ID value, if created by an existing user, this will be populated.
                strategy: "",       // lo|fb|tw|li|etc.  See $$.constants.user.credential_types
                socialId: null      //The socialId of the source of this contact, if applicable
            },

            /*
            {
                deviceTypeId: '2net_scale',
                serialNumber: '0000000000',
                showActivity: true
            }
            */

            devices: [],

            siteActivity: [],

            notes: [],

            details: []
        },


        getOrCreateLocalDetails: function() {
            var details = this.get("details");
            if (details == null) {
                details = [];
                this.set({details:details});
            }

            var detail = _.find(details, function(_detail) { return _detail.type === $$.constants.contact.detail_types.LOCAL });
            if (detail == null) {
                detail = {
                    _id: $$.u.idutils.generateUniqueAlphaNumericShort(),
                    type: $$.constants.contact.detail_types.LOCAL,
                    emails:[],
                    photo:"",
                    phones: [],
                    address: null
                };

                details.push(detail);
            }

            return detail;
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
                type: $$.constants.contact.phone_types.MOBILE,
                number:"",
                default:false
            };

            detail.phones.push(phone);
            return phone;
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


        setDefaultBilling: function(addressId) {
            this._setDefaultBillingOrShipping(addressId, "defaultBilling");
        },


        setDefaultShipping: function(addressId) {
            this._setDefaultBillingOrShipping(addressId, "defaultShipping");
        },


        _setDefaultBillingOrShipping: function(addressId, key) {
            var details = this.get("details");
            if (details == null) {
                details = [];
                this.set({details:details});
            }

            _.each(details, function(detail) {
                if (detail.addresses != null) {
                    _.each(detail.addresses, function(address) {
                        address[key] = address._id == addressId;
                    });
                }
            });
        },


        removePhone: function(phoneId) {
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
                        var index = detail.phones.indexOf(phone);
                        detail.phones.splice(index, 1);
                    }
                }
            }
        },

        subscribetwoNetUser: function(userId) {
            var data = {
                "contactId": userId
            }
            // twonetadapter/subscription

            var url = $$.api.getApiUrl("twonetadapter/subscription", userId);
            return this.saveCustomUrl(url);
        },

        getContactReadings: function(userId) {
            // var self = this;
            //  var url = $$.api.getApiUrl("biometrics", "readings?contactId="+userId);
            //  $.getJSON(url)
            //     .done(function(result) {
            //         console.log('Success: '+JSON.stringify(result));
            //         return result;
            //     })
            //     .fail(function(resp) {
            //         console.log('Fail: '+JSON.stringify(result));
            //     });
        },

        getOrCreateDevice: function(type, serialNumber) {
            console.log('adding new device '+type+' '+serialNumber);
             var devices = this.get("devices");
             console.log('Devices: '+JSON.stringify(devices));
            if (devices === null) {
                devices = [];
                this.set({devices:devices});
            }

            for (var i = 0; i < devices.length; i++) {
                var device = devices[i];
                if (device != null) {
                    var deviceId = device.serialNumber;
                    console.log('Device ID: '+deviceId);
                    if (deviceId === serialNumber) {
                        return device;
                    }
                }
            }

            //Device = null;
            var device = {
                deviceTypeId: type,
                serialNumber:serialNumber,
                showActivity:true
            };


            devices.push(device);
            return device;
        },


        url: function(method) {
            switch(method) {
                case "GET":
                    return $$.api.getApiUrl("contact", this.id);
                case "PUT":
                case "POST":
                    return $$.api.getApiUrl("contact", "");
                case "DELETE":
                    break;
            }
        }
    });

    $$.m.Contact = model;

    return model;
});