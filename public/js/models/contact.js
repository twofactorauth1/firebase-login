define([], function() {

    var model = Backbone.Model.extend({

        idAttribute: "_id",

        defaults: {
            _id: null,
            accountId: 0,   //int
            first:"",       //string,
            middle:"",      //string,
            last:"",        //string,
            type:"",        //contact_types
            photo:"",       //string
            cDate:null,     //Created Date
            cBy:null,       //Created By
            mDate:null,     //ModifiedDate
            mBy:null,       //Modified By
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
                    email:"",
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

            detail.addresses.push(address);
            return address;
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