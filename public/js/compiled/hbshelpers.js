
    Handlebars.registerHelper("eachLetter", function (options) {
        var charCode = "A".charCodeAt();
        var str = "";
        for (var i = 0; i < 26; i++) {
            this.letter = String.fromCharCode(charCode);
            str += options.fn(this);
            charCode++;
        }
        return str;
    });


    Handlebars.registerHelper("contactTypeLabel", function (contact) {
        if (contact == null) {
            contact = this;
        }
        var contactTypes = $$.constants.contact.contact_types.dp;
        var type = _.find(contactTypes, function (type) {
            return type.data === contact.type
        });
        return type == null ? "" : type.label;
    });


    Handlebars.registerHelper("phoneTypeLabel", function (phone) {
        if (phone == null) {
            phone = this;
        }
        var phoneType = phone.hasOwnProperty("type") ? phone.type : phone;

        var phoneTypes = $$.constants.contact.phone_types.dp;
        var type = _.find(phoneTypes, function (type) {
            return type.data === phoneType
        });
        return type == null ? "mobile" : type.label;
    });


    Handlebars.registerHelper("contactTypeOptions", function (options) {
        var contactTypes = $$.constants.contact.contact_types.dp;

        var str = "";
        for (var i = 0, l = contactTypes.length; i < l; i++) {
            str += options.fn(contactTypes[i]);
        }
        return str;
    });


    Handlebars.registerHelper("phoneTypeOptions", function (options) {
        var phoneTypes = $$.constants.contact.phone_types.dp;

        var str = "";
        for (var i = 0, l = phoneTypes.length; i < l; i++) {
            str += options.fn(phoneTypes[i]);
        }
        return str;
    });


    Handlebars.registerHelper("canEditContactDetails", function (contactDetails, options) {
        if (contactDetails.type == $$.constants.contact.detail_types.LOCAL) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    });


    Handlebars.registerHelper("unlessHasLocalPhone", function (contact, options) {
        if (contact && contact.details != null) {
            var localDetails = _.find(contact.details, function (details) {
                return details.type === $$.constants.contact.detail_types.LOCAL
            });
            if (localDetails != null && localDetails.phones != null && localDetails.phones.length > 0) {
                return options.inverse(this);
            }
        }
        return options.fn(this);
    });


    Handlebars.registerHelper("unlessAddressIsEmpty", function (address, options) {
        if (address) {
            if (String.isNullOrEmpty(address.address) && String.isNullOrEmpty(address.address2) && String.isNullOrEmpty(address.city)
                    && String.isNullOrEmpty(address.state) && String.isNullOrEmpty(address.zip) && String.isNullOrEmpty(address.country)) {
                return options.inverse(this);
            } else {
                return options.inverse(this);
            }
        } else {
            return options.inverse(this);
        }
    });


    Handlebars.registerHelper("getBestEmail", function(contact, options) {
        if (contact.details != null && contact.details.length > 0) {
            //see if we have a google contact, that's the best source of email
            var details = _.findWhere(contact.details, { type: $$.constants.social.types.GOOGLE });
            if (details != null && details.emails != null && details.emails.length > 0) {
                this.$email = details.emails[0];
                return options.fn(this);
            }

            for(var i = 0; i < contact.details.length; i++) {
                var details = contact.details[0];
                if (details != null && details.emails != null && details.emails.length > 0) {
                    this.$email = details.emails[0];
                    return options.fn(this);
                }
            }
            return options.inverse(this);
        }
    });


    Handlebars.registerHelper("getFacebookId", function(contact, options) {
        if (contact.details != null && contact.details.length > 0) {
            //see if we have a google contact, that's the best source of email
            var details = _.findWhere(contact.details, { type: $$.constants.social.types.FACEBOOK });
            if (details != null) {
                this.$facebookId = details.socialId;
                return options.fn(this);
            }

            return options.inverse(this);
        }
    });


    Handlebars.registerHelper("getTwitterId", function(contact, options) {
        if (contact.details != null && contact.details.length > 0) {
            //see if we have a google contact, that's the best source of email
            var details = _.findWhere(contact.details, { type: $$.constants.social.types.TWITTER });
            if (details != null) {
                this.$twitterId = details.socialId;
                return options.fn(this);
            }

            return options.inverse(this);
        }
    });


    Handlebars.registerHelper("getLinkedInId", function(contact, options) {
        if (contact.details != null && contact.details.length > 0) {
            //see if we have a google contact, that's the best source of email
            var details = _.findWhere(contact.details, { type: $$.constants.social.types.LINKEDIN });
            if (details != null) {
                if (details.websites != null && details.websites.length > 0) {
                    for (var i = 0; i < details.websites.length; i++) {
                        if (details.websites[i] != null) {
                            this.$linkedInUrl = details.websites[i];
                            return options.fn(this);
                        }
                    }
                }
                this.$linkedInId = details.socialId;
                return options.fn(this);
            }

            return options.inverse(this);
        }
    });


    Handlebars.registerHelper("getAddress", function(contact, options) {
        var _address = null;
        if (contact.details != null && contact.details.length > 0) {
            for (var i = 0; i < contact.details.length; i++) {
                var details = contact.details[i];
                if (details.addresses != null && details.addresses.length > 0) {
                    for (var j = 0; j < details.addresses.length; j++) {
                        var address = details.addresses[j];
                        if (address) {
                            if (address.displayName != null) {
                                this.$address = encodeURIComponent(address.displayName);
                                return options.fn(this);
                            } else {
                                if (_address == null) {
                                    _address = address;
                                } else {
                                    if (address.address != null && address.city != null) {
                                        _address = address;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        if (_address != null) {
            var addressStr = "";
            if (String.isNullOrEmpty(_address.address)) {
                addressStr += _address.address;
            }

            if (String.isNullOrEmpty(_address.city)) {
                addressStr += ", " + address.city;
            }

            if (String.isNullOrEmpty(_address.state)) {
                addressStr += ", " + address.state;
            }

            if (String.isNullOrEmpty(_address.zip)) {
                addressStr += ", " + _address.zip;
            }

            this.$address = encodeURIComponent(addressStr);
            return options.fn(this);
        }

        return options.inverse(this);
    });


    Handlebars.registerHelper("contactSources", function(contact, options) {

    });

    Handlebars.registerHelper("isGoogleImage", function (photo, options) {
        if (String.isNullOrEmpty(photo) == false && photo.indexOf("www.google.com/m8") > -1) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    });

    Handlebars.registerHelper("eachLetter", function (options) {
        var charCode = "A".charCodeAt();
        var str = "";
        for (var i = 0; i < 26; i++) {
            this.letter = String.fromCharCode(charCode);
            str += options.fn(this);
            charCode++;
        }
        return str;
    });


    Handlebars.registerHelper("contactTypeLabel", function (contact) {
        if (contact == null) {
            contact = this;
        }
        var contactTypes = $$.constants.contact.contact_types.dp;
        var type = _.find(contactTypes, function (type) {
            return type.data === contact.type
        });
        return type == null ? "" : type.label;
    });


    Handlebars.registerHelper("phoneTypeLabel", function (phone) {
        if (phone == null) {
            phone = this;
        }
        var phoneType = phone.hasOwnProperty("type") ? phone.type : phone;

        var phoneTypes = $$.constants.contact.phone_types.dp;
        var type = _.find(phoneTypes, function (type) {
            return type.data === phoneType
        });
        return type == null ? "mobile" : type.label;
    });


    Handlebars.registerHelper("contactTypeOptions", function (options) {
        var contactTypes = $$.constants.contact.contact_types.dp;

        var str = "";
        for (var i = 0, l = contactTypes.length; i < l; i++) {
            str += options.fn(contactTypes[i]);
        }
        return str;
    });


    Handlebars.registerHelper("phoneTypeOptions", function (options) {
        var phoneTypes = $$.constants.contact.phone_types.dp;

        var str = "";
        for (var i = 0, l = phoneTypes.length; i < l; i++) {
            str += options.fn(phoneTypes[i]);
        }
        return str;
    });


    Handlebars.registerHelper("canEditContactDetails", function (contactDetails, options) {
        if (contactDetails.type == $$.constants.contact.detail_types.LOCAL) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    });


    Handlebars.registerHelper("unlessHasLocalPhone", function (contact, options) {
        if (contact && contact.details != null) {
            var localDetails = _.find(contact.details, function (details) {
                return details.type === $$.constants.contact.detail_types.LOCAL
            });
            if (localDetails != null && localDetails.phones != null && localDetails.phones.length > 0) {
                return options.inverse(this);
            }
        }
        return options.fn(this);
    });


    Handlebars.registerHelper("unlessAddressIsEmpty", function (address, options) {
        if (address) {
            if (String.isNullOrEmpty(address.address) && String.isNullOrEmpty(address.address2) && String.isNullOrEmpty(address.city)
                    && String.isNullOrEmpty(address.state) && String.isNullOrEmpty(address.zip) && String.isNullOrEmpty(address.country)) {
                return options.inverse(this);
            } else {
                return options.inverse(this);
            }
        } else {
            return options.inverse(this);
        }
    });


    Handlebars.registerHelper("getBestEmail", function(contact, options) {
        if (contact.details != null && contact.details.length > 0) {
            //see if we have a google contact, that's the best source of email
            var details = _.findWhere(contact.details, { type: $$.constants.social.types.GOOGLE });
            if (details != null && details.emails != null && details.emails.length > 0) {
                this.$email = details.emails[0];
                return options.fn(this);
            }

            for(var i = 0; i < contact.details.length; i++) {
                var details = contact.details[0];
                if (details != null && details.emails != null && details.emails.length > 0) {
                    this.$email = details.emails[0];
                    return options.fn(this);
                }
            }
            return options.inverse(this);
        }
    });


    Handlebars.registerHelper("getFacebookId", function(contact, options) {
        if (contact.details != null && contact.details.length > 0) {
            //see if we have a google contact, that's the best source of email
            var details = _.findWhere(contact.details, { type: $$.constants.social.types.FACEBOOK });
            if (details != null) {
                this.$facebookId = details.socialId;
                return options.fn(this);
            }

            return options.inverse(this);
        }
    });


    Handlebars.registerHelper("getTwitterId", function(contact, options) {
        if (contact.details != null && contact.details.length > 0) {
            //see if we have a google contact, that's the best source of email
            var details = _.findWhere(contact.details, { type: $$.constants.social.types.TWITTER });
            if (details != null) {
                this.$twitterId = details.socialId;
                return options.fn(this);
            }

            return options.inverse(this);
        }
    });


    Handlebars.registerHelper("getLinkedInId", function(contact, options) {
        if (contact.details != null && contact.details.length > 0) {
            //see if we have a google contact, that's the best source of email
            var details = _.findWhere(contact.details, { type: $$.constants.social.types.LINKEDIN });
            if (details != null) {
                if (details.websites != null && details.websites.length > 0) {
                    for (var i = 0; i < details.websites.length; i++) {
                        if (details.websites[i] != null) {
                            this.$linkedInUrl = details.websites[i];
                            return options.fn(this);
                        }
                    }
                }
                this.$linkedInId = details.socialId;
                return options.fn(this);
            }

            return options.inverse(this);
        }
    });


    Handlebars.registerHelper("getAddress", function(contact, options) {
        var _address = null;
        if (contact.details != null && contact.details.length > 0) {
            for (var i = 0; i < contact.details.length; i++) {
                var details = contact.details[i];
                if (details.addresses != null && details.addresses.length > 0) {
                    for (var j = 0; j < details.addresses.length; j++) {
                        var address = details.addresses[j];
                        if (address) {
                            if (address.displayName != null) {
                                this.$address = encodeURIComponent(address.displayName);
                                return options.fn(this);
                            } else {
                                if (_address == null) {
                                    _address = address;
                                } else {
                                    if (address.address != null && address.city != null) {
                                        _address = address;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        if (_address != null) {
            var addressStr = "";
            if (String.isNullOrEmpty(_address.address)) {
                addressStr += _address.address;
            }

            if (String.isNullOrEmpty(_address.city)) {
                addressStr += ", " + address.city;
            }

            if (String.isNullOrEmpty(_address.state)) {
                addressStr += ", " + address.state;
            }

            if (String.isNullOrEmpty(_address.zip)) {
                addressStr += ", " + _address.zip;
            }

            this.$address = encodeURIComponent(addressStr);
            return options.fn(this);
        }

        return options.inverse(this);
    });


    Handlebars.registerHelper("contactSources", function(contact, options) {

    });

    Handlebars.registerHelper("isGoogleImage", function (photo, options) {
        if (String.isNullOrEmpty(photo) == false && photo.indexOf("www.google.com/m8") > -1) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    });
