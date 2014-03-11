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


    refreshAccessToken: function(user, fn) {
        var creds = user.getCredentials($$.constants.user.credential_types.GOOGLE);
        if (creds != null && creds.refreshToken != null) {

            request.post({
                url: this.REFRESH_TOKEN_URL,
                form: {
                    refresh_token: creds.refreshToken,
                    client_id:     googleConfig.CLIENT_ID,
                    client_secret: googleConfig.CLIENT_SECRET,
                    grant_type:    'refresh_token'
                }
            }, function (err, response, body) {
                if(err) return fn(err);

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
                    gender = "m"
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


    getContactsForUser: function(user, properties, fn) {
        if (_.isFunction(properties)) {
            fn = properties;
            properties = "full";
        }

        var socialId = this._getGoogleId(user);
        var accessToken = this._getAccessToken(user);

        if (socialId == null || accessToken == null) {
            return fn("User is not linked to Google", "User is not linked to Google");
        }

        var url = this.CONTACT_API_URL + "default/" + properties + "?alt=json&max-results=1000000&access_token=" + accessToken;

        this._makeAuthenticatedRequest(url, function(err, value) {
            if (!err) {
                var list = value;
                var entries = list.feed.entry;
                var updated = list.feed.updated.$t;

                var processEntry = function(entry) {
                    var obj = {}, i, l, item, itemType;

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
                            if (entry.link[i].type == "image/*" && entry.link[i].rel == "http://schemas.google.com/contacts/2008/rel#edit-photo") {
                                obj.photos = obj.photos || [];
                                obj.photos.push(entry.link[i].href);
                                break;
                            }
                        }
                    }

                    if (entry.title != null) {
                        obj.name = entry.title.$t;
                    }

                    if (entry.gd$phoneNumber != null) {
                        obj.phones = [];
                        for(i = 0, l = entry.gd$phoneNumber.length; i < l; i++) {
                            item = entry.gd$phoneNumber[i];
                            itemType = null;
                            if (item.rel.indexOf("work")) {
                                itemType = "work";
                            } else if(item.rel.indexOf("mobile")) {
                                itemType = "mobile";
                            } else if(item.rel.indexOf("home")) {
                                itemType = "home";
                            } else {
                                itemType = "other";
                            }

                            obj.phones.push({
                                type: itemType,
                                number: item.$t,
                                primary: item.primary == "true"
                            })
                        }
                    }

                    if (entry.gd$postalAddress != null) {
                        obj.addresses = [];
                        for(i = 0, l = entry.gd$postalAddress.length; i < l; i++) {
                            item = entry.gd$postalAddress[i];
                            if (item.rel.indexOf("work")) {
                                itemType = "work";
                            } else if(item.rel.indexOf("home")) {
                                itemType = "home";
                            } else {
                                itemType = "other";
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
                async.each(entries, function(entry) {
                    result.push(processEntry(entry));
                }, function(err) {
                    fn(err, result);
                });
            } else {
                return fn(err, value);
            }
        });

        return null;
    },


    importContactsForUser: function(accountId, user, fn) {
        var self = this;
        this.getContactsForUser(user, function(err, value) {
            if (err) {
                return fn(err, value);
            }

            /*
            var googleId = self._getGoogleId(user);
            var _friends = value.data;

            var updateContactFromFacebookFriend = function(contact, facebookFriend) {
                contact.updateContactInfo(facebookFriend.first_name, null, facebookFriend.last_name, facebookFriend.pic_big || facebookFriend.pic, facebookFriend.pic_square, facebookFriend.birthday);

                var websites;
                if (!String.isNullOrEmpty(facebookFriend.website)) {
                    websites = facebookFriend.website.replace(" ", "").split(",");
                }
                //Update contact details
                contact.createOrUpdateDetails($$.constants.social.types.FACEBOOK, facebookId, facebookFriend.uid, facebookFriend.pic, facebookFriend.pic_big, facebookFriend.pic_square, facebookFriend.email, websites);
            };


            (function importFriends(friends, page) {
                if (friends != null) {
                    var numPerPage = 50, socialType = $$.constants.social.types.FACEBOOK;

                    var pagingInfo = paging.getPagingInfo(friends.length, numPerPage, page);

                    var items = paging.getItemsForCurrentPage(friends, page, numPerPage);
                    var socialIds = _.pluck(items, "uid");

                    contactDao.getContactsBySocialIds(accountId, socialType, socialIds, function(err, value) {
                        if (err) {
                            return fn(err, value);
                        }

                        var contactValues = value;
                        async.series([
                            function(callback) {
                                if (contactValues != null && contactValues.length > 0) {
                                    async.each(contactValues, function(contact) {

                                        //Get reference to current friend
                                        var facebookFriend = _.findWhere(items, {uid:contact.getSocialId(socialType)});

                                        //remove the contact from the items array so we don't process again
                                        items = _.without(items, facebookFriend);

                                        updateContactFromFacebookFriend(contact, facebookFriend);

                                        contactDao.saveOrUpdate(contact, function(err, value) {
                                            if (err) {
                                                self.log.error("An error occurred updating contact during Facebook import", err);;
                                            }
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
                                    async.each(items, function(facebookFriend) {

                                        var contact = new Contact({
                                            accountId: accountId,
                                            type: $$.constants.contact.contact_types.FRIEND
                                        });

                                        contact.createdBy(user.id(), socialType, facebookId);
                                        updateContactFromFacebookFriend(contact, facebookFriend);
                                        contactDao.saveOrMerge(contact, function(err, value) {
                                            if (err) {
                                                self.log.error("An error occurred saving contact during Facebook import", err);
                                            }
                                        });

                                    }, function(err) {
                                        callback(err);
                                    })
                                } else {
                                    callback(null);
                                }
                            }

                        ], function(err, results) {
                            if (pagingInfo.nextPage > page) {
                                process.nextTick(function() {
                                    importFriends(friends, pagingInfo.nextPage);
                                });
                            } else {
                                fn(null);
                            }
                        });
                    });
                }
            })(_friends, 1);
            */
        });
    },


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
            if (!err) {
                try {
                    var profile = JSON.parse(body);
                    return self._isAuthenticationError(profile, fn);
                }catch(exception) {
                    return self._isAuthenticationError(body, fn);
                }
            } else {
                fn(err, resp);
            }
        });
    }
};

dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.social = $$.dao.social || {};
$$.dao.social.GoogleDao = dao;

module.exports = dao;

