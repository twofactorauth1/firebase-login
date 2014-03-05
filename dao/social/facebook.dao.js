var baseDao = require('../base.dao');
var request = require('request');
var crypto = require('crypto');
var facebookConfig = require('../../configs/facebook.config');
var paging = require('../../utils/paging');
var contactDao = require('../contact.dao');
var Contact = require('../../models/contact');

var dao = {

    options: {
        name:"social.facebook.dao",
        defaultModel:null
    },


    GRAPH_API_URL: "https://graph.facebook.com/",


    getAppSecretProof: function(accessToken) {
        var proof = crypto.createHmac('sha256', facebookConfig.CLIENT_SECRET).update(accessToken).digest('hex');
        return "app_secret=" + proof;
    },


    generateUrl: function(path, accessToken) {
        var url = this.GRAPH_API_URL + path;
        if (url.indexOf("?") > -1) {
            url += "&";
        } else {
            url += "?";
        }

        url += "access_token=" + accessToken;
        return url;
    },


    getProfileForUser: function(user, fn) {
        var accessToken = this._getAccessToken(user);
        var socialId = this._getFacebookId(user);
        if (accessToken == null || socialId == null) {
            return fn("No Credentials Found", "No Facebook credentials found");
        }

        return this.getProfile(socialId, accessToken, fn);
    },


    getProfile: function(profileId, accessToken, fn) {
        var fields = "email,picture,first_name,last_name,middle_name,name,username";

        var path = profileId + "?fields=" + fields;
        var url = this.generateUrl(path, accessToken);

        request(url, function(err, resp, body) {
            if (!err) {
                var profile = JSON.parse(body);
                fn(null, profile);
            } else {
                fn(err, resp);
            }
        });
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


    getFriendsForUser: function(user, fn) {
        var socialId = this._getFacebookId(user);
        var accessToken = this._getAccessToken(user);

        if (socialId == null || accessToken == null) {
            return fn("User is not linked to facebook", "User is not linked to facebook");
        }

        //var path = socialId + "/friends";
        var query = "SELECT uid, name, first_name, last_name, email, pic, pic_big, pic_square, website, birthday FROM user WHERE uid IN (SELECT uid2 FROM friend WHERE uid1 = " + socialId + ") ORDER BY name";
        var path = "fql?q=" + query;
        var url = this.generateUrl(path, accessToken);

        request(url, function(err, resp, body) {
            if (!err) {
                var list = JSON.parse(body);
                return fn(null, list);
            } else {
                return fn(err, resp);
            }
        });
    },


    importFriendsAsContactsForUser: function(accountId, user, fn) {
        var self = this;
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

                        if (value != null && value.length > 0) {
                            value.forEach(function(contact) {
                                //Get reference to current friend
                                var facebookFriend = _.findWhere(items, {uid:contact.getSocialId(socialType)});

                                //remove the contact from the items array so we don't process again
                                items = _.without(items, facebookFriend);

                                updateContactFromFacebookFriend(contact, facebookFriend);
                                contactDao.saveOrUpdate(contact, function() {});
                            });
                        }

                        //Iterate through remaining items
                        items.forEach(function(facebookFriend) {

                            var contact = new Contact({
                                accountId: accountId,
                                type: $$.constants.contact.contact_types.FRIEND
                            });

                            contact.createdBy(user.id(), socialType, facebookId);
                            updateContactFromFacebookFriend(contact, facebookFriend);
                            contactDao.saveOrUpdate(contact, function() {});
                        });

                        if (pagingInfo.nextPage > page) {
                            importFriends(friends, pagingInfo.nextPage);
                        } else {
                            fn(null);
                        }
                    });
                }
            })(_friends, 1);
        });
    },


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
    }
};

dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.social = $$.dao.social || {};
$$.dao.social.FacebookDao = dao;

module.exports = dao;

