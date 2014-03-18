var baseDao = require('../base.dao');
var request = require('request');
var crypto = require('crypto');
var twitterConfig = require('../../configs/twitter.config');
var paging = require('../../utils/paging');
var contactDao = require('../contact.dao');
var userDao = require('../user.dao');
var async = require('async');
var querystring = require('querystring');

var Contact = require('../../models/contact');
var OAuth = require('oauth').OAuth;

var dao = {

    options: {
        name:"social.twitter.dao",
        defaultModel:null
    },


    API_URL: "https://api.twitter.com/1.1/",


    checkAccessToken: function(user, fn) {
        var path = "account/verify_credentials.json";
        var url = this._generateUrl(path);

        this._makeRequest(url, user, function(err, value) {
            return fn(err, value);
        });
    },


    getProfileForUser: function(user, fn) {
        var path = "users/show.json";
        var params = {
            user_id:this._getTwitterId(user)
        };

        var url = this._generateUrl(path, params);

        console.log(url);
        this._makeRequest(url, user, function(err, value) {
            if (err) {
                return fn(err, value);
            }
            var profile = JSON.parse(value);
            return fn(err, profile);
        });
    },


    refreshUserFromProfile: function(user, defaultPhoto, fn) {
        if (_.isFunction(defaultPhoto)) {
            fn = defaultPhoto;
            defaultPhoto = false;
        }

        this.getProfileForUser(user, function(err, value) {
            if (!err) {
                user.updateProfileInformation(value.emailAddress, value.firstName, value.lastName, null, null, false);

                if (String.isNullOrEmpty(value.mainAddress) === false) {
                    user.createOrUpdateAddress($$.constants.social.types.LINKEDIN, "o", null, null, null, null, null, null, null, value.mainAddress, null, null, null, null);
                }

                if (String.isNullOrEmpty(value.pictureUrl) === false) {
                    user.addOrUpdatePhoto($$.constants.social.types.LINKEDIN, value.pictureUrl, defaultPhoto);
                }

                if (value.phoneNumbers != null && value.phoneNumbers.values != null && value.phoneNumbers.values.length > 0) {
                    value.phoneNumbers.values.forEach(function(phone) {
                        var phoneType;
                        if (phone.phoneType == "home") { phoneType == "h"; }
                        else if(phone.phoneType == "mobile") { phoneType == "m"; }
                        else if(phone.phoneType == "work") { phoneType == "w"; }
                        else { phoneType == "o"; }
                        user.createOrUpdatePhone($$.constants.social.types.LINKEDIN, phoneType, phone.phoneNumber, false);
                    });
                }

                if (value.twitterAccounts != null && value.twitterAccounts.values != null && value.twitterAccounts.values.length > 0) {
                    value.twitterAccounts.values.forEach(function(twitter) {
                        user.createOrUpdateSocialNetwork($$.constants.social.types.LINKEDIN, $$.constants.social.types.TWITTER, twitter.providerAccountId, twitter.providerAccountName);
                    });
                }

                if (value.imAccounts != null && value.imAccounts.values != null && value.imAccounts.values.length > 0) {
                    value.imAccounts.values.forEach(function(imAccount) {
                        user.createOrUpdateImAccount($$.constants.social.types.LINKEDIN, imAccount.imAccountType, imAccount.imAccountName);
                    });
                }

                fn(null, user);
            } else {
                fn(err, value);
            }
        });
    },


    getConnectionsForUser: function(user, updated, options, fn) {
        var self = this;

        if (_.isFunction(updated)) {
            fn = updated;
            updated = null;
            options = null;
        } else if (_.isFunction(options)) {
            fn = options;
            options = null;
        }

        var start = 0; //0
        var max = 500;   //500
        var retrieveAll = true;

        if (options) {
            if (options.start) {
                start = options.start;
            }
            if (options.max) {
                max = options.max;
            }
            if (options.retrieveAll) {
                retrieveAll = options.retrieveAll;
            }
        }

        var socialId = this._getLInkedInId(user);
        var accessToken = this._getAccessToken(user);

        if (socialId == null || accessToken == null) {
            return fn($$.u.errors._401_INVALID_CREDENTIALS, "User is not linked to LinkedIn");
        }

        var getContacts = function(start, max, updated, fxn) {
            var path = "~/connections:(id,first-name,last-name,headline,location:(name),summary,picture-url,site-standard-profile-request,public-profile-url)?";
            if (start != null) {
                path += "&start=" + start;
            }
            if (max != null) {
                path += "&count=" + max;
            }
            if (updated != null) {
                path += "&modified-since=" + updated;
            }

            var url = self._generateUrl(path, accessToken);

            request(url, function(err, resp, body) {
                if (!err) {
                    var list = JSON.parse(body);
                    return fxn(null, list);
                } else {
                    return fxn(err, resp);
                }
            });
        };

        var result = {
            _start:0,
            _count:0,
            _total:0,
            values: []
        };

        var recurseContacts = function(start, max, updated) {
            getContacts(start, max, updated, function(err, value) {
                if (err) {
                    return fn(err, value);
                }

                if (!retrieveAll) {
                    return fn(err, value);
                }

                if (value.hasOwnProperty("_count")) {
                    var _count = value._count;
                    var _start = value._start;
                    var _total = value._total;

                    var values = value.values;
                    result.values = result.values.concat(values);

                    if (_count + _start < _total) {
                        //we need to fetch more
                        start = _start + _count;
                        return recurseContacts(start, max, updated);
                    } else {
                        result._total = _total;
                        result._count = _total;
                        result._start = 0;

                        return fn(null, result);
                    }
                } else {
                    return fn(err, value);
                }
            });
        };

        recurseContacts(start, max, updated, fn);
    },


    importConnectionsAsContactsForUser: function(accountId, user, fn) {
        var self = this, totalImported = 0;

        var linkedInBaggage = user.getUserAccountBaggage(accountId, "linkedin");
        linkedInBaggage.contacts = linkedInBaggage.contacts || {};
        var updated = linkedInBaggage.contacts.updated;

        this.getConnectionsForUser(user, updated, function(err, value) {
            if (err) {
                return fn(err, value);
            }

            linkedInBaggage.contacts.updated = new Date().getTime();

            var linkedInId = self._getLInkedInId(user);
            var _connections = value.values;

            var updateContactFromConnection = function(contact, connection) {
                var location= null;
                if (connection.location && connection.location.name) { location = connection.location.name; }
                contact.updateContactInfo(connection.firstName, null, connection.lastName, connection.pictureUrl, connection.pictureUrl, null, location);

                var websites = [];
                if (!String.isNullOrEmpty(connection.publicProfileUrl)) {
                    websites.push(connection.publicProfielUrl);
                }
                if (connection.siteStandardProfileRequest && !String.isNullOrEmpty(connection.siteStandardProfileRequest.url)) {
                    websites.push(connection.siteStandardProfileRequest.url);
                }

                //Update contact details
                contact.createOrUpdateDetails($$.constants.social.types.LINKEDIN, linkedInId, connection.id, connection.pictureUrl, null, connection.pictureUrl, null, websites);
            };


            (function importConnections(connections, page) {
                if (connections != null) {
                    var numPerPage = 50, socialType = $$.constants.social.types.LINKEDIN;

                    var pagingInfo = paging.getPagingInfo(connections.length, numPerPage, page);

                    var items = paging.getItemsForCurrentPage(connections, page, numPerPage);
                    var socialIds = _.pluck(items, "id");

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
                                        var connection = _.findWhere(items, {id:contact.getSocialId(socialType)});

                                        //remove the contact from the items array so we don't process again
                                        items = _.without(items, connection);

                                        updateContactFromConnection(contact, connection);

                                        contactDao.saveOrUpdate(contact, function(err, value) {
                                            if (err) {
                                                self.log.error("An error occurred updating contact during LinkedIn import", err);;
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
                                    async.eachSeries(items, function(connection, cb) {

                                        var contact = new Contact({
                                            accountId: accountId,
                                            type: $$.constants.contact.contact_types.OTHER
                                        });

                                        contact.createdBy(user.id(), socialType, linkedInId);
                                        updateContactFromConnection(contact, connection);
                                        contactDao.saveOrMerge(contact, function(err, value) {
                                            if (err) {
                                                self.log.error("An error occurred saving contact during LinkedIn import", err);
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
                                    importConnections(connections, pagingInfo.nextPage);
                                });
                            } else {
                                self.log.info("LinkedIn friend import succeed. " + totalImported + " imports");
                                //Last step, save the user
                                userDao.saveOrUpdate(user, function() {});
                                fn(null);
                            }
                        });
                    });
                }
            })(_connections, 1);
        });
    },


    _getAccessToken: function(user) {
        var credentials = user.getCredentials($$.constants.user.credential_types.TWITTER);
        if (credentials == null) {
            return null;
        }
        return credentials.accessToken;
    },


    _getAccessTokenSecret: function(user) {
        var credentials = user.getCredentials($$.constants.user.credential_types.TWITTER);
        if (credentials == null) {
            return null;
        }
        return credentials.accessTokenSecret;
    },


    _getTwitterId: function(user) {
        var credentials = user.getCredentials($$.constants.user.credential_types.TWITTER);
        if (credentials == null) {
            return null;
        }
        return credentials.socialId;
    },


    _generateUrl: function(path, params) {
        var url = this.API_URL + path;

        if (params && _.isString(params) == false && Object.keys(params).length > 0) {
            params = querystring.stringify(params);
        }

        if (_.isObject(params)) {
            params = "";
        }
        if (params != null && params.length > 0 && params.indexOf("?") == -1) {
            url += "?";
        }
        url += params;

        return url;
    },


    _makeRequest: function(url, user, fn) {
        var oauth = new OAuth(
            '',                      //REquest URL (not in use)
            '',                      //Access URL (not in use)
            twitterConfig.CLIENT_ID,
            twitterConfig.CLIENT_SECRET,
            '1.0',
            '',                     //Callback URL, not in use
            'HMAC-SHA1'
        );

        var accessToken = this._getAccessToken(user);
        var accessTokenSecret = this._getAccessTokenSecret(user);

        if (accessToken == null || accessTokenSecret == null) {
            return fn($$.u.errors._401_INVALID_CREDENTIALS, "Cannot make twitter request");
        }

        oauth.get(url, accessToken, accessTokenSecret, function (err, body, response) {
            console.log('URL [%s]', url);
            if (!err && response.statusCode == 200) {
                fn(null, body);
            } else {
                fn(err, response, body);
            }
        });
    }
};

dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.social = $$.dao.social || {};
$$.dao.social.LinkedInDao = dao;

module.exports = dao;

