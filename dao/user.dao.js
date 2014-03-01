var baseDao = require('./base.dao');
var AccountDao = require('./account.dao');
var Constants = requirejs('constants/constants');
var crypto = require('../utils/security/crypto');
require('../models/user');


var dao = {

    options: {
        name:"user.dao",
        defaultModel: $$.m.User
    },


    //Global LEVEL METHODS
    usernameExists: function(username, fn) {
        this.exists({'_username':username.toLowerCase()}, fn);
    },


    getUserByUsername: function(username, fn) {
        this.findOne( {'_username':username}, fn);
    },


    getUserBySocialId: function(socialType, socialId, fn) {
        this.findOne( { "credentials.type":socialType, "credentials.socialId":socialId }, fn);
    },


    createUserFromUsernamePassword: function(username, password, email, accountToken, fn) {
        var self = this;
        this.getUserByUsername(username, function(err, value) {
            if (err) {
                return fn(err, value);
            }

            if (value != null) {
                return fn(true, "An account with this username already exists");
            }

            var deferred = $.Deferred();

            AccountDao.convertTempAccount(accountToken, function(err, value) {
                if (!err) {
                    deferred.resolve(value);
                } else {
                    deferred.reject();
                    return fn(err, value);
                }
            });

            deferred
                .done(function(account) {
                    var accountId;
                    if (account != null) {
                        accountId = account.id();
                    }

                    if (accountId == null) {
                        return fn(true, "Failed to create user, no account found");
                    }

                    var user = new $$.m.User({
                        username:username,
                        email:email,
                        created: {
                            date: new Date().getTime(),
                            strategy: $$.constants.user.credential_types.LOCAL,
                            by: null, //self-created
                            isNew: true
                        }
                    });

                    user.createOrUpdateLocalCredentials(password);
                    user.createUserAccount(accountId, username, password, ["super","admin","member"]);

                    self.saveOrUpdate(user, fn);
                });
        });
    },


    createUserFromSocialProfile: function(socialType, socialId, email, firstName, lastName, accessToken, accountToken, fn) {
        var self = this;

        this.getUserByUsername(email, function(err, value) {
            if (err) {
                return fn(err, value);
            }

            if (value != null) {
                return fn(true, "An account with a matching email address of " + email + " already exists.");
            }

            self.getUserBySocialId(socialType, socialId, function(err, value) {
                if (err) {
                    return fn(err, value);
                }

                if (value != null) {
                    return fn(true, "An account already exists with this social profile");
                }

                var deferred = $.Deferred();
                AccountDao.convertTempAccount(accountToken, function(err, value) {
                    if (!err) {
                        deferred.resolve(value);
                    } else {
                        deferred.reject();
                        return fn(err, value);
                    }
                });

                deferred
                    .done(function(account) {
                        var accountId;
                        if (account != null) {
                            accountId = account.id();
                        }

                        if (accountId == null) {
                            return fn(true, "Failed to create user, no account found");
                        }

                        var user = new $$.m.User({
                            username:email,
                            email:email,
                            first:firstName,
                            last:lastName,
                            created: {
                                date: new Date().getTime(),
                                strategy: socialType,
                                by: null, //self-created
                                isNew: true
                            }
                        });

                        user.createOrUpdateLocalCredentials(null);
                        user.createOrUpdateSocialCredentials(socialType, socialId, accessToken);
                        user.createUserAccountFromSocialProfile(accountId, email, socialType, socialId, accessToken, ["super","admin","member"]);

                        self.saveOrUpdate(user, fn);
                    });
            });
        })
    },


    //region SUBDOMAIN ACCOUNT LEVEL METHODS
    usernameExistsForAccount: function(accountId, username, fn) {
        this.exists({"accounts.accountId" : accountId, "accounts.credentials._username" : username.toLowerCase() }, fn);
    },


    getUserForAccount: function(accountId, username, fn) {
        var query = { "accounts.accountId" : accountId, username:username };
        return this.findOne(query, fn);
    },


    getUserForAccountBySocialProfile: function(accountId, socialType, socialId, fn) {
        var query = { "accounts.accountId":accountId, "accounts.credentials.type":socialType, "accounts.credentials.socialId":socialId };
        return this.findOne(query, fn);
    },


    //TODO - remove this after March 1, 2014
    _onStartup: function() {
        var query = {};
        var self = this;
        this.findMany(null, function(err, value) {
            if (!err) {
                if (value.length > 0) {
                    value.forEach(function(user) {
                        if (user.get("_v") < "0.2") {
                            user.set({_v:"0.2"});
                            self.saveOrUpdate(user);
                        }
                    });
                }
            }
        });
    }
};

dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.UserDao = dao;

module.exports = dao;
