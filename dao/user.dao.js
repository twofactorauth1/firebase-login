/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseDao = require('./base.dao');
var accountDao = require('./account.dao');
var constants = requirejs('constants/constants');
var crypto = require('../utils/security/crypto');
var cmsDao = require('../cms/dao/cms.dao');
require('../models/user');
var cookies = require("../utils/cookieutil");


var dao = {

    options: {
        name:"user.dao",
        defaultModel: $$.m.User
    },


    //Global LEVEL METHODS
    usernameExists: function(username, fn) {
        this.exists({'username':username.toLowerCase()}, fn);
    },


    getUserByUsername: function(username, fn) {
        if (username == null) {
            return fn(null, null);
        }
        this.findOne( {'_username':username}, fn);
    },


    getUserBySocialId: function(socialType, socialId, fn) {
        this.findOne( { "credentials.type":socialType, "credentials.socialId":socialId }, fn);
    },

    getUserBySocialUsername: function(socialType, socialUsername, fn) {
        this.findOne( {'credentials.type': socialType, 'credentials.userName': socialUsername}, fn);
    },

    //TODO: This method is bad.  And you should feel bad.
    createUserFromUsernamePassword: function(username, password, email, accountToken, fn) {
        /*if (_.isFunction(accountToken)) {
             fn = accountToken;
             accountToken = null;
        }
        var self = this;
        self.log.debug('>> createUserFromUsernamePassword');
        this.getUserByUsername(username, function(err, value) {
            if (err) {
                return fn(err, value);
            }

            if (value != null) {
                return fn(true, "An account with this username already exists");
            }

            var deferred = $.Deferred();


            accountDao.convertTempAccount(accountToken, function(err, value) {
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
                    var userId = $$.u.idutils.generateUUID();
                    var user = new $$.m.User({
                        _id: userId,
                        username:username,
                        email:email,
                        created: {
                            date: new Date().getTime(),
                            strategy: $$.constants.user.credential_types.LOCAL,
                            by: userId, //self-created
                            isNew: true
                        }
                    });


                    user.createOrUpdateLocalCredentials(password);
                    var roleAry = ["super","admin","member"];
                    user.createUserAccount(accountId, username, password, roleAry);

                    self.log.debug('Initializing user security.');
                    securityManager.initializeUserPrivileges(user.id(), username, roleAry, accountId, function(err, value){
                        if(err) {
                            self.log.error('Error initializing user privileges for userID: ' + user.id());
                            return fn(err, null);
                        }
                        self.log.debug('creating website for account');
                        cmsDao.createWebsiteForAccount(accountId, 'admin', function(err, value){
                            if(err) {
                                self.log.error('Error creating website for account: ' + err);
                                fn(err, null);
                            } else {
                                self.log.debug('creating default page');
                                cmsDao.createDefaultPageForAccount(accountId, value.id(), function(err, value){
                                    if(err) {
                                        self.log.error('Error creating default page for account: ' + err);
                                        fn(err, null);
                                    } else {
                                        self.log.debug('saving user.');
                                        self.saveOrUpdate(user, function(err, savedUser){
                                            if(err) {
                                                self.log.error('Error saving user: ' + err);
                                                fn(err, null);
                                            } else {
                                                self.log.debug('<< createUserFromUsernamePassword');
                                                fn(null, savedUser);
                                            }
                                        });
                                    }

                                });
                            }

                        });
                    });

                });
        });
        */
    },

    createUserFromSocialProfile: function(socialType, socialId, email, firstName, lastName, username, socialUrl, accessToken, refreshToken, expires, accountToken, scope, fn) {
        var self = this;

        this.getUserByUsername(email, function(err, value) {
            if (err) {
                return fn(err, value);
            }

            if (value != null) {
                var msg = "An account with a matching email address of " + email + " already exists.";
                return fn(msg,msg);
            }

            self.getUserBySocialId(socialType, socialId, function(err, value) {
                if (err) {
                    return fn(err, value);
                }

                if (value != null) {
                    return fn(true, "An account already exists with this social profile");
                }

                var deferred = $.Deferred();
                accountDao.convertTempAccount(accountToken, function(err, value) {
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
                                by: null, //self-created
                                strategy: socialType,
                                isNew: true
                            }
                        });

                        user.createOrUpdateLocalCredentials(null);
                        user.createOrUpdateSocialCredentials(socialType, socialId, accessToken, refreshToken, expires, username, socialUrl, scope);
                        user.createUserAccount(accountId, email, null, ["super","admin","member"]);

                        self.refreshFromSocialProfile(user, socialType, true, false, fn);
                    });
            });
        })
    },

    createTempUserFromSocialProfile: function(socialType, socialId, email, firstName, lastName, username, socialUrl, accessToken,
                                              refreshToken, expires, accountToken, scope, fn) {
        var self = this;
        self.log.debug('>> createTempUserFromSocialProfile');

        accountDao.getTempAccount(accountToken, function(err, tempAccount){
            if(err) {
                self.log.error('Error getting temp account: ' + err);
                return fn(err, null);
            } else if(tempAccount === null) {

                self.log.error('Could not find account with token: ' + accountToken);
                return fn('Temp account not found', null);
            }
            self.getUserByUsername(email, function(err, user) {
                if (err) {
                    return fn(err, null);
                } else if(user !== null) {
                    tempAccount.set('tempUser', user);
                    accountDao.saveOrUpdateTmpAccount(tempAccount, function(err, tmpAccount){
                        if(err) {
                            self.log.error('Error updating temp account: ' + err);
                            return fn(err, null);
                        } else {
                            self.log.debug('<< createTempUserFromSocialProfile');
                            return fn(null, user);
                        }
                    });
                } else {
                    //check if social user exists
                    self.getUserBySocialId(socialType, socialId, function(err, user) {
                        if (err) {
                            return fn(err, null);
                        } else if (user != null) {
                            tempAccount.set('tempUser', user);
                            accountDao.saveOrUpdateTmpAccount(tempAccount, function(err, tmpAccount){
                                if(err) {
                                    self.log.error('Error updating temp account: ' + err);
                                    return fn(err, null);
                                } else {
                                    self.log.debug('<< createTempUserFromSocialProfile');
                                    return fn(null, user);
                                }
                            });
                        } else {
                            self.log.debug('creating new temp user');
                            //need to create a temp user
                            var user = new $$.m.User({
                                _id: 'temp:' + $$.u.idutils.generateUUID(),
                                username:email,
                                email:email,
                                first:firstName,
                                last:lastName,
                                created: {
                                    date: new Date().getTime(),
                                    by: null, //self-created
                                    strategy: socialType,
                                    isNew: true
                                }
                            });

                            user.createOrUpdateLocalCredentials(null);
                            user.createOrUpdateSocialCredentials(socialType, socialId, accessToken, refreshToken, expires, username, socialUrl, scope);
                            self.refreshFromSocialProfile(user, socialType, true, true, function(err, updatedUser){
                                self.saveOrUpdateTmpUser(updatedUser, function(err, tmpUser){
                                    self.log.debug('saved temp user with id: ' + tmpUser.id());
                                    tempAccount.set('tempUser', tmpUser);
                                    accountDao.saveOrUpdateTmpAccount(tempAccount, function(err, tmpAccount){
                                        if(err) {
                                            self.log.error('Error updating temp account: ' + err);
                                            return fn(err, null);
                                        } else {
                                            self.log.debug('<< createTempUserFromSocialProfile');
                                            return fn(null, user);
                                        }
                                    });
                                });
                            });





                        }
                    });
                }
            });

        });


    },


    refreshFromSocialProfile: function(user, socialType, defaultPhoto, tempUser, fn) {
        var self = this;
        if (_.isFunction(defaultPhoto)) {
            fn = defaultPhoto;
            defaultPhoto = false;
        }

        var social = $$.constants.social.types;

        var fxn = function(err, value) {
            if (!err) {
                self.saveOrUpdate(value, fn);
            } else {
                self.saveOrUpdate(user, fn);
            }
        };
        if(tempUser === true) {
            fxn = function(err, value){
                if (!err) {
                    self.saveOrUpdateTmpUser(value, fn);
                } else {
                    self.saveOrUpdateTmpUser(user, fn);
                }
            }
        }

        switch(socialType) {
            case social.FACEBOOK:
                var facebookDao = require('./social/facebook.dao');
                return facebookDao.refreshUserFromProfile(user, defaultPhoto, fxn);
            case social.TWITTER:
                return fxn(null, user);
            case social.GOOGLE:
                var googleDao = require('./social/google.dao');
                return googleDao.refreshUserFromProfile(user, defaultPhoto, fxn);
            case social.LINKEDIN:
                var linkedInDao = require('./social/linkedin.dao');
                return linkedInDao.refreshUserFromProfile(user, defaultPhoto, fxn);
            default:
                return process.nextTick(function() {
                    return fxn(null, user);
                });
        }
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
        var query = { "accounts.accountId":accountId, "credentials.type":socialType, "credentials.socialId":socialId };
        return this.findOne(query, fn);
    },

    getUsersForAccount: function(accountId, fn) {
        var query = {'accounts.accountId':accountId};
        return this.findMany(query, $$.m.User, fn);
    },

    saveOrUpdateTmpUser: function(user, fn) {
        //key, value, region, ttl
        $$.g.cache.set(user.id(), user, "users", 3600 * 24);
        fn(null, user);
    },

    removeTmpUser: function(user, fn) {
        $$.g.cache.remove(user.id(), 'users');
        fn(null, 'ok');
    }
};

dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.UserDao = dao;

module.exports = dao;
