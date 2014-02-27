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


    usernameExists: function(username, fn) {
        this.exists({'_username':username.toLowerCase()}, fn);
    },


    usernameExistsForAccount: function(accountId, username, fn) {
        this.exists({"accounts.accountId" : accountId, "accounts.credentials._username" : username.toLowerCase() }, fn);
    },


    getUserByUsername: function(username, fn) {
        this.findOne( {'_username':username}, fn);
    },


    getUserByEmail: function(email, fn) {
        this.findOne( {'email':email}, fn);
    },


    getUserByUsernameOrEmail: function(username, fn) {
        var deferred = $.Deferred();
        var self = this;
        var fxn1, fxn2;

        var isEmail = $$.u.validate(username, { required: true, email: true }).success;

        if (isEmail) {
            fxn1 = this.getUserByEmail;
            fxn2 = this.getUserByUsername;
        } else {
            fxn1 = this.getUserByUsername;
            fxn2 = this.getUserByEmail;
        }

        fxn1.call(self, username, function(err, value) {
            if (err || value == null) {
                fxn2.call(self, username, function(err, value) {
                    if (!err) {
                        deferred.resolve(value);
                        if (fn) {
                            fn(null, value);
                        }
                    } else {
                        deferred.reject(err);
                        if (fn) {
                            fn(err, value);
                        }
                    }
                });
            } else {
                deferred.resolve(value);
                if (fn) {
                    fn(null, value);
                }
            }
        });

        return deferred;
    },
    
    getUserByOauthProfile: function (email, type, fn) {
        this.findOne({'email': email, 'credentials.type':type}, fn);
    },


    getUserForAccount: function(accountId, username, fn) {
        var query = { "accounts.accountId" : accountId, username:username };
        return this.findOne(query, fn);
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

            /*
             If we don't have an account id yet, they are probably in the process
             of creating one at startup, lets try to convert the account now that
             they are actually signing up.
             */
            if (accountToken != null) {
                AccountDao.convertTempAccount(accountToken, function(err, value) {
                    if (!err) {
                        deferred.resolve(value);
                    } else {
                        return fn(err, value);
                    }
                });
            } else {
                AccountDao.createAccount("", $$.constants.account.company_types.PROFESSIONAL, $$.constants.account.company_size.SINGLE, null, function(err, value) {
                    if (!err) {
                        deferred.resolve(value);
                    } else {
                        return fn(err, value);
                    }
                });
            }

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
    
    createUserFromOauthProfile: function(token, profile, type, fn) {
        var self = this;
        var user = new $$.m.User({
                email: profile.emails[0].value,
                first: profile.name.givenName,
                last: profile.name.familyName,
                isSocial: true,
                created: {
                    date: new Date().getTime(),
                    strategy: $$.constants.user.credential_types.FACEBOOK,
                    by: null,
                    isNew: true
                }
        });

        user.createOrUpdateOauthToken(token, type);
        self.saveOrUpdate(user, fn);
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
