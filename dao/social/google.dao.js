var baseDao = require('../base.dao');
var request = require('request');
var crypto = require('crypto');
var googleConfig = require('../../configs/google.config');
var paging = require('../../utils/paging');
var contactDao = require('../contact.dao');
var userDao = require('../user.dao');

var async = require('async');

var Contact = require('../../models/contact');

var dao = {

    options: {
        name:"social.google.dao",
        defaultModel:null
    },


    REFRESH_TOKEN_URL: "https://accounts.google.com/o/oauth2/token",
    PROFILE_API_URL: "https://www.googleapis.com/oauth2/v1/userinfo",
    CONTACT_API_URL: "https://www.google.com/m8/feeds/contacts/",

//region ACCESS TOKEN
    refreshAccessToken: function(user, fn) {
        var creds = user.getCredentials($$.constants.user.credential_types.GOOGLE);
        if (creds != null && creds.refreshToken != null && (creds.expires == null || creds.expires < new Date().getTime())) {

            request.post({
                url: this.REFRESH_TOKEN_URL,
                form: {
                    refresh_token: creds.refreshToken,
                    client_id:     googleConfig.CLIENT_ID,
                    client_secret: googleConfig.CLIENT_SECRET,
                    grant_type:    'refresh_token'
                }
            }, function (err, response, body) {
                if(err) { return fn(err); }

                var currentToken = JSON.parse(body);

                creds.expires = new Date().getTime() + (currentToken.expires_in * 1000);
                creds.accessToken = currentToken.access_token;

                userDao.saveOrUpdate(user, fn);
            });
        } else {
            fn("No refresh token found");
        }
    },


    checkAccessToken: function(user, fn) {
        var self = this;
        this.getProfileForUser(user, function(err, value) {
            if (err && err.error != null && err.error.code == "401") {
                self.refreshAccessToken(user, function(err2, value) {
                    if (err2) {
                        return fn(err, value);
                    } else {
                        return self.getProfileForUser(user, fn);
                    }
                });
            } else {
                return fn(err, value);
            }
        });
    },
//endregion


//region PROFILE
    getProfileForUser: function(user, fn) {
        var accessToken = this._getAccessToken(user);
        var socialId = this._getGoogleId(user);
        if (accessToken == null || socialId == null) {
            return fn("No Credentials Found", "No Google credentials found");
        }

        return this.getProfile(socialId, accessToken, fn);
    },


    getProfile: function(profileId, accessToken, fn) {
        var self = this;
        var url = this.PROFILE_API_URL;
        url += "?alt=json&access_token=" + accessToken;

        this._makeAuthenticatedRequest(url, fn);
    },


    refreshUserFromProfile: function(user, defaultPhoto, fn) {
        if (_.isFunction(defaultPhoto)) {
            fn = defaultPhoto;
            defaultPhoto = false;
        }

        this.getProfileForUser(user, function(err, value) {
            if (!err) {
                var obj = {
                    first:value.given_name,
                    last:value.family_name
                };

                var gender;
                if (value.gender == "male") {
                    gender = "m";
                } else if(value.gender == "female") {
                    gender = "f";
                }

                if (gender != null) {
                    obj.gender = gender;
                }

                user.set(obj);

                if (value.picture != null) {
                    user.addOrUpdatePhoto($$.constants.social.types.GOOGLE, value.picture, defaultPhoto);
                }

                fn(null, user);
            } else {
                fn(err, value);
            }
        });
    },
//endregion


//region CONTACTS
    getContactsForUser: function(user, lastUpdated, fn) {
        if (_.isFunction(lastUpdated)) {
            fn = lastUpdated;
            lastUpdated = null;
        }

        var socialId = this._getGoogleId(user);
        var accessToken = this._getAccessToken(user);

        if (socialId == null || accessToken == null) {
            return fn("User is not linked to Google", "User is not linked to Google");
        }

        var url = this.CONTACT_API_URL + "default/full?alt=json&max-results=100000000&access_token=" + accessToken;
        if (String.isNullOrEmpty(lastUpdated) === false) {
            url += "&updated-min=" + lastUpdated;
        }

        this._makeAuthenticatedRequest(url, function(err, value) {
            if (!err) {
                var list = value;
                var entries = list.feed.entry;
                var updated = list.feed.updated.$t;

                var processEntry = function(entry) {
                    var obj = {}, i, l, item, itemType;

                    obj.id = entry.id.$t;
                    obj.id = obj.id.replace("http://www.google.com/m8/feeds/contacts/","");
                    if (entry.gd$email != null) {
                        obj.emails = [];
                        for(i = 0, l = entry.gd$email.length; i < l; i++) {
                            item = entry.gd$email[i];

                            var o = {
                                email: item.address
                            };

                            if (item.primary == "true") {
                                o.primary = true;
                            }

                            obj.emails.push(o);
                        }
                    }

                    if (entry.link != null) {
                        for(i = 0, l = entry.link.length; i < l; i++) {
                            if (entry.link[i].type == "image/*" &&
                                (entry.link[i].rel == "http://schemas.google.com/contacts/2008/rel#photo")) {
                                obj.photos = obj.photos || [];
                                obj.photos.push(entry.link[i].href);
                                break;
                            }
                        }
                    }

                    if (entry.title != null) {
                        obj.name = entry.title.$t;
                        var nameParts = $$.u.stringutils.splitFullname(obj.name);
                        obj.first = nameParts[0];
                        obj.middle = nameParts[1];
                        obj.last = nameParts[2];
                    }

                    if (entry.gd$phoneNumber != null) {
                        obj.phones = [];
                        for(i = 0, l = entry.gd$phoneNumber.length; i < l; i++) {
                            item = entry.gd$phoneNumber[i];
                            itemType = "o";
                            if (item.rel != null) {
                                if (item.rel.indexOf("work")) {
                                    itemType = "w";
                                } else if(item.rel.indexOf("mobile")) {
                                    itemType = "m";
                                } else if(item.rel.indexOf("home")) {
                                    itemType = "h";
                                } else {
                                    itemType = "o";
                                }
                            }

                            obj.phones.push({
                                type: itemType,
                                number: item.$t,
                                primary: item.primary === "true"
                            });
                        }
                    }

                    if (entry.gd$postalAddress != null) {
                        obj.addresses = [];
                        for(i = 0, l = entry.gd$postalAddress.length; i < l; i++) {
                            item = entry.gd$postalAddress[i];
                            itemType = "o";

                            if (item.rel != null) {
                                if (item.rel.indexOf("work")) {
                                    itemType = "w";
                                } else if(item.rel.indexOf("home")) {
                                    itemType = "h";
                                } else {
                                    itemType = "o";
                                }
                            }
                        }

                        obj.addresses.push({
                            type:itemType,
                            address:item.$t,
                            primary: item.primary == "true"
                        });
                    }

                    return obj;
                };

                var result = [];
                var count = 0;
                async.each(entries, function(entry, cb) {
                    result.push(processEntry(entry));
                    cb();
                }, function(err) {
                    fn(err, result, {updated: updated});
                });
            } else {
                return fn(err, value);
            }
        });

        return null;
    },


    importContactsForUser: function(accountId, user, fn) {
        var self = this;
        var totalImported = 0;

        var googleBaggage = user.getUserAccountBaggage(accountId, "google");
        googleBaggage.contacts = googleBaggage.contacts || {};
        var updated = googleBaggage.contacts.updated;

        this.getContactsForUser(user, updated, function(err, value, params) {
            if (err) {
                return fn(err, value);
            }

            googleBaggage.contacts.updated = params.updated;
            userDao.saveOrUpdate(user);


            var googleId = self._getGoogleId(user);
            var _contacts = value;

            var updateContactFromContactObj = function(contact, contactObj) {
                var photo = (contactObj.photos != null && contactObj.photos.length > 0) ? contactObj.photos[0] : null;
                var emails = contactObj.emails;
                if (emails != null) {
                    emails = _.pluck(emails, "email");
                }
                contact.updateContactInfo(contactObj.first, contactObj.middle, contactObj.last, photo, photo, null);

                //Update contact details
                contact.createOrUpdateDetails($$.constants.social.types.GOOGLE, googleId, contactObj.id, photo, photo, null, emails, null);

                //Update addresses
                if (contactObj.addresses != null && contactObj.addresses.length > 0) {
                    contactObj.addresses.forEach(function(address) {
                        contact.createAddress($$.constants.social.types.GOOGLE, address.type, null, null, null, null, null, null, null, address.address, null, null, false, false);
                    });
                }

                //update phones
                if (contactObj.phones != null && contactObj.phones.length > 0) {
                    contactObj.phones.forEach(function(phone) {
                        contact.createOrUpdatePhone($$.constants.social.types.GOOGLE, phone.type, phone.number, phone.primary);
                    });
                }
            };


            (function importContacts(contacts, page) {
                if (contacts != null) {
                    var numPerPage = 50, socialType = $$.constants.social.types.GOOGLE;

                    var pagingInfo = paging.getPagingInfo(contacts.length, numPerPage, page);

                    var items = paging.getItemsForCurrentPage(contacts, page, numPerPage);
                    var socialIds = _.pluck(items, "id");

                    contactDao.getContactsBySocialIds(accountId, socialType, socialIds, function(err, value) {
                        if (err) {
                            return fn(err, value);
                        }

                        var contactValues = value;
                        async.series([
                            function(callback) {
                                if (contactValues != null && contactValues.length > 0) {
                                    async.each(contactValues, function(contact, cb) {

                                        //Get reference to current Google Contact
                                        var googleContact = _.findWhere(items, {id:contact.getSocialId(socialType)});

                                        //remove the contact from the items array so we don't process again
                                        items = _.without(items, googleContact);

                                        updateContactFromContactObj(contact, googleContact);

                                        contactDao.saveOrUpdate(contact, function(err, value) {
                                            if (err) {
                                                self.log.error("An error occurred updating contact during Google import", err);
                                            }
                                            totalImported++;
                                            cb();
                                        });

                                    }, function(err) {
                                        callback(err);
                                    });
                                } else {
                                    callback(null);
                                }
                            },

                            function(callback) {
                                //Iterate through remaining items
                                if (items != null && items.length > 0) {
                                    async.each(items, function(googleContact, cb) {

                                        var contact = new Contact({
                                            accountId: accountId,
                                            type: $$.constants.contact.contact_types.OTHER
                                        });

                                        contact.createdBy(user.id(), socialType, googleId);
                                        updateContactFromContactObj(contact, googleContact);
                                        contactDao.saveOrMerge(contact, function(err, value) {
                                            if (err) {
                                                self.log.error("An error occurred saving contact during Google import", err);
                                            }
                                            totalImported++;
                                            cb();
                                        });

                                    }, function(err) {
                                        callback(err);
                                    });
                                } else {
                                    callback(null);
                                }
                            }

                        ], function(err, results) {
                            if (pagingInfo.nextPage > page) {
                                process.nextTick(function() {
                                    importContacts(contacts, pagingInfo.nextPage);
                                });
                            } else {
                                self.log.info("Google Contact Import Succeeded. " + totalImported + " imports");
                                fn(null);
                            }
                        });
                    });
                }
            })(_contacts, 1);
        });
    },
//---------------------------------------------------------
//endregion
//---------------------------------------------------------


//---------------------------------------------------------
//region PRIVATE
//---------------------------------------------------------
    _getAccessToken: function(user) {
        var credentials = user.getCredentials($$.constants.user.credential_types.GOOGLE);
        if (credentials == null) {
            return null;
        }
        return credentials.accessToken;
    },


    _getGoogleId: function(user) {
        var credentials = user.getCredentials($$.constants.user.credential_types.GOOGLE);
        if (credentials == null) {
            return null;
        }
        return credentials.socialId;
    },


    _makeAuthenticatedRequest: function(url, fn) {
        var self = this;
        request(url, function(err, resp, body) {
            var profile;
            if (!err) {
                try {
                    profile = JSON.parse(body);
                } catch(exception) {
                    profile = body;
                }
                return self._isAuthenticationError(profile, fn);

            } else {
                fn(err, resp);
            }
        });
    }
//endregion
};

dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.social = $$.dao.social || {};
$$.dao.social.GoogleDao = dao;

module.exports = dao;

