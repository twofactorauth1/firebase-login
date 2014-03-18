var baseDao = require('../base.dao');
var request = require('request');
var crypto = require('crypto');
var facebookConfig = require('../../configs/facebook.config');
var paging = require('../../utils/paging');
var contactDao = require('../contact.dao');
var userDao = require('../user.dao');
var Contact = require('../../models/contact');
var async = require('async');
var querystring = require('querystring');

var dao = {

    options: {
        name:"social.facebook.dao",
        defaultModel:null
    },


    GRAPH_API_URL: "https://graph.facebook.com/",


    //region ACCESS TOKEN
    getAppSecretProof: function(accessToken) {
        var proof = crypto.createHmac('sha256', facebookConfig.CLIENT_SECRET).update(accessToken).digest('hex');
        return "app_secret=" + proof;
    },


    refreshAccessToken: function(user, fn) {
        var creds = user.getCredentials($$.constants.user.credential_types.FACEBOOK);
        if (creds != null) {
            if (creds.expires != null && creds.expires < new Date().getTime()) {
                //We are already expired!
                return fn($$.u.errors._401_INVALID_CREDENTIALS, "Invalid Credentials");
            }
            else if (creds.expires == null || (creds.expires - new Date().getTime()) < ($$.u.dateutils.DAY * 30)) {
                //lets try to refresh the token

                var url = this.GRAPH_API_URL + "oauth/access_token?" +
                    "grant_type=fb_exchange_token&" +
                    "client_id=" + facebookConfig.CLIENT_ID + "&" +
                    "client_secret=" + facebookConfig.CLIENT_SECRET + "&" +
                    "fb_exchange_token=" + creds.accessToken;

                request(url, function(err, resp, body) {
                    if (err) {
                        var error = _.clone($$.u.errors._401_INVALID_CREDENTIALS);
                        error.raw = err;
                        return fn(error, "Invalid Credentials")
                    }

                    body = querystring.parse(body);
                    var accessToken = body.access_token;
                    var expires = body.expires;

                    if (accessToken != null) {
                        creds.accessToken = accessToken;
                    }

                    if (expires != null) {
                        creds.expires = new Date().getTime() + (expires * 1000);
                    }

                    userDao.saveOrUpdate(user, fn);
                });
            } else {
                return fn(null, null);
            }
        } else {
            return fn($$.u.errors._401_INVALID_CREDENTIALS, "No Facebook credentials found");
        }
    },


    checkAccessToken: function(user, fn) {
        var self = this;
        this.refreshAccessToken(user, function(err, value) {
            if (err) {
                return fn(err, value);
            }

            return self.getProfileForUser(user, fn);
        });
    },
    //endregion


    //region PERMISSIONS
    getPermissions: function(user, fn) {
        var accessToken = this._getAccessToken(user);
        var socialId = this._getFacebookId(user);
        if (accessToken == null || socialId == null) {
            return fn($$.u.errors._401_INVALID_CREDENTIALS, "No Facebook credentials found");
        }

        var path = socialId + "/permissions";
        var url = this._generateUrl(path, accessToken);
        this._makeRequest(url, fn);
    },
    //endregion


    //region PROFILE
    getProfileForUser: function(user, fn) {
        var accessToken = this._getAccessToken(user);
        var socialId = this._getFacebookId(user);
        if (accessToken == null || socialId == null) {
            return fn($$.u.errors._401_INVALID_CREDENTIALS, "No Facebook credentials found");
        }

        return this.getProfile(socialId, accessToken, fn);
    },


    getProfile: function(profileId, accessToken, fn) {
        var self = this;
        var fields = "email,picture,first_name,last_name,middle_name,name,username";

        var path = profileId + "?fields=" + fields;
        var url = this._generateUrl(path, accessToken);
        this._makeRequest(url, fn);
    },


    refreshUserFromProfile: function(user, defaultPhoto, fn) {
        if (_.isFunction(defaultPhoto)) {
            fn = defaultPhoto;
            defaultPhoto = false;
        }

        this.getProfileForUser(user, function(err, value) {
            if (!err) {
                var obj = {
                    first:value.first_name,
                    last:value.last_name,
                    middle:value.middle_name
                };

                user.set(obj);

                if (value.picture != null && value.picture.data != null) {
                    user.addOrUpdatePhoto($$.constants.social.types.FACEBOOK, value.picture.data.url, defaultPhoto);
                }

                fn(null, user);
            } else {
                fn(err, value);
            }
        });
    },
    //endregion


    //region FRIENDS & IMPORT
    getFriendsForUser: function(user, fn) {
        var socialId = this._getFacebookId(user);
        var accessToken = this._getAccessToken(user);

        if (socialId == null || accessToken == null) {
            return fn($$.u.errors._401_INVALID_CREDENTIALS, "User is not linked to facebook");
        }

        //var path = socialId + "/friends";
        var query = "SELECT uid, name, first_name, last_name, email, pic, pic_big, pic_square, website, birthday FROM user WHERE uid IN (SELECT uid2 FROM friend WHERE uid1 = " + socialId + ") ORDER BY name";
        var path = "fql?q=" + query;
        var url = this._generateUrl(path, accessToken);
        this._makeRequest(url, fn);
    },


    importFriendsAsContactsForUser: function(accountId, user, fn) {
        var self = this, totalImported = 0;

        this.getFriendsForUser(user, function(err, value) {
            if (err) {
                return fn(err, value);
            }

            var facebookId = self._getFacebookId(user);
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
                                    async.eachSeries(contactValues, function(contact, cb) {

                                        //Get reference to current friend
                                        var facebookFriend = _.findWhere(items, {uid:contact.getSocialId(socialType)});

                                        if (facebookFriend == null) {
                                            console.log("facebook friend is null");
                                        }

                                        //remove the contact from the items array so we don't process again
                                        items = _.without(items, facebookFriend);

                                        updateContactFromFacebookFriend(contact, facebookFriend);

                                        contactDao.saveOrUpdate(contact, function(err, value) {
                                            if (err) {
                                                self.log.error("An error occurred updating contact during Facebook import", err);;
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
                                    async.eachSeries(items, function(facebookFriend, cb) {

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
                                            totalImported++;
                                            cb();
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
                                self.log.info("Facebook friend import succeed. " + totalImported + " imports");
                                fn(null);
                            }
                        });
                    });
                }
            })(_friends, 1);
        });
    },
    //endregion


    //region STREAM
    getUserStream: function(user, socialId, fn) {
        var key = "feed";
        return this._getStreamPart(user, socialId, key, fn);
    },


    getUserPosts: function(user, socialId, fn) {
        var key = "posts";
        return this._getStreamPart(user, socialId, key, fn);
    },


    getUserStatuses: function(user, socialId, fn) {
        var key = "statuses";
        return this._getStreamPart(user, socialId, key, fn);
    },


    getUserTagged: function(user, socialId, fn) {
        var key = "tagged";
        return this._getStreamPart(user, socialId, key, fn);
    },


    _getStreamPart: function(user, socialId, key, fn) {
        var self = this;
        var accessToken = this._getAccessToken(user);

        if (accessToken == null) {
            return fn($$.u.errors._401_INVALID_CREDENTIALS, "User is not linked to facebook");
        }

        var path = socialId + "/" + key + "?limit=500";
        var url = this._generateUrl(path, accessToken);

        return this._makeRequest(url, function(err, value) {
            if (err) {
                return fn(err, value);
            }

            return fn(null, value.data);
        });
    },


    getMessagesWithFriend: function(user, socialId, fn) {
        var self = this;
        var myFacebookId = this._getFacebookId(user);
        var accessToken = this._getAccessToken(user);

        if (accessToken == null) {
            return fn($$.u.errors._401_INVALID_CREDENTIALS, "User is not linked to facebook");
        }

        var query1 = "SELECT author_id, thread_id, body, created_time FROM message WHERE thread_id IN (SELECT thread_id FROM thread WHERE folder_id = 1 AND (" + socialId + " IN (recipients) OR originator = " + socialId + ")) ORDER BY created_time DESC";
        var query2 = "SELECT first_name, middle_name, last_name, uid from user where uid in (select author_id from message where thread_id IN (SELECT thread_id FROM thread WHERE folder_id = 1 AND (" + socialId + " IN (recipients) OR originator = " + socialId + ")))";

        var path1 = "fql?q=" + query1;
        var path2 = "fql?q=" + query2;

        var url1 = this._generateUrl(path1, accessToken);
        var url2 = this._generateUrl(path2, accessToken);

        var async = require("async");

        async.parallel([
            function(cb) {
                self._makeRequest(url1, function(err, value) {
                    cb(err, value);
                });
            },

            function(cb) {
                self._makeRequest(url2, function(err, value) {
                   cb(err, value);
                });
            }
        ], function(err, results) {
            if (err) {
                return fn(err);
            }

            var messages = results[0].data;
            var userNames = results[1].data;

            var getName = function(uid) {
                var obj = _.findWhere(userNames, {uid:uid});
                if (obj != null) {
                    return obj.first_name + " " + obj.last_name;
                }
                return "";
            };

            messages.forEach(function(message) {
               message.name = getName(message.author_id);
            });

            fn(null, messages);
        });
    },
    //region


    //region PRIVATE
    _getAccessToken: function(user) {
        var credentials = user.getCredentials($$.constants.user.credential_types.FACEBOOK);
        if (credentials == null) {
            return null;
        }
        return credentials.accessToken;
    },


    _getFacebookId: function(user) {
        var credentials = user.getCredentials($$.constants.user.credential_types.FACEBOOK);
        if (credentials == null) {
            return null;
        }
        return credentials.socialId;
    },


    _generateUrl: function(path, accessToken) {
        var url = this.GRAPH_API_URL + path;
        if (url.indexOf("?") > -1) {
            url += "&";
        } else {
            url += "?";
        }

        url += "access_token=" + accessToken;
        return url;
    },


    _makeRequest: function(url, fn) {
        var self = this;
        request(url, function(err, resp, body){
            if (!err) {
                var result = JSON.parse(body);
                self._isAuthenticationError(result, fn);
            } else {
                fn(err, resp);
            }
        });
    }
    //endregion
};

dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.social = $$.dao.social || {};
$$.dao.social.FacebookDao = dao;

module.exports = dao;

