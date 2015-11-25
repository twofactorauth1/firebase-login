/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */


var dao = require('./user.dao');
var accountDao = require('./account.dao');
var cmsManager = require('../cms/cms_manager');
var log = $$.g.getLogger("user.manager");
var securityManager = require('../security/sm')(true);
var contactDao = require('./contact.dao');
var appConfig = require('../configs/app.config');
var analyticsManager = require('../analytics/analytics_manager');
var socialConfigManager = require('../socialconfig/socialconfig_manager');

var mandrillHelper = require('../utils/mandrillhelper');
var notificationConfig = require('../configs/notification.config');
var fs = require('fs');
var async = require('async');

module.exports = {

    createAccountAndUserFromTempAccount: function(accountToken, fingerprint, sendWelcomeEmail, fn) {
        var self = this;
        log.debug('>> createAccountAndUserFromTempAccount');
        async.waterfall([
            function convertAccount(callback){
                accountDao.getTempAccount(accountToken, function(err, tempAccount){
                    if(err) {
                        log.error('Error getting temp account: ' + err);
                        callback(err);
                    }
                    log.debug('got tempAccount: ', tempAccount);
                    var user = new $$.m.User(tempAccount.get('tempUser'));
                    accountDao.convertTempAccount(accountToken, function(err, account) {
                        if (err) {
                            log.error('Error converting temp account: ' + err);
                            callback(err);
                        }
                        callback(null, account, user);
                    });
                });
            },
            function convertUser(account, user, callback){
                log.debug('Created account with id: ' + account.id());
                var accountId = account.id();
                var roleAry = ["super","admin","member"];
                var username = user.get('username');
                var email = user.get('email');

                user.createUserAccount(accountId, username, null, roleAry);
                if(user.id().toString().substring(0, 4) ==='temp') {
                    //user does not exist.  set temp ID to null.
                    user.set('_id', null);
                }
                dao.saveOrUpdate(user, function(err, savedUser) {
                    if (err) {
                        log.error('Error saving user: ' + err);
                        callback(err);
                    }
                    callback(null, account, savedUser);
                });
            },
            function setupCustomerContactAndSocialConfig(account, user, callback){
                log.debug('Created user with id: ' + user.id());
                socialConfigManager.createSocialConfigFromUser(account.id(), user, function(err, value){
                    if(err) {
                        log.error('Error creating social config for account:' + account.id());
                    }

                });
            },
            function setupSecurity(account, user, callback){
                log.debug('Initializing user security.');
                var userId = user.id();
                var username = user.get('username');
                var roleAry = ["super","admin","member"];
                var accountId = account.id();
                securityManager.initializeUserPrivileges(userId, username, roleAry, accountId, function(err, value) {
                    if (err) {
                        log.error('Error initializing user privileges for userID: ' + userId);
                        callback(err);
                    }
                    callback(null, account, user);
                });
            },
            function setupCMS(account, user, callback){
                log.debug('creating website for account');
                var accountId = account.id();
                cmsManager.createWebsiteForAccount(accountId, 'admin', function(err, value){
                    if(err) {
                        log.error('Error creating website for account: ' + err);
                        callback(err);
                    } else {
                        log.debug('creating default pages');
                        cmsManager.createDefaultPageForAccount(accountId, value.id(), function (err, value) {
                            if (err) {
                                log.error('Error creating default page for account: ' + err);
                                callback(err);
                            }
                            callback(null, account, user);
                        });
                    }
                });
            },
            function finalizeAccount(account, user, callback){
                log.debug('Finalizing account');
                accountDao.getAccountByID(account.id(), function(err, updatedAccount){
                    if(err) {
                        log.error('Error getting updated account: ' + err);
                        callback(err);
                    } else {
                        var businessObj = updatedAccount.get('business');
                        var email = user.get('email');
                        businessObj.emails = [];
                        businessObj.emails.push({
                            _id: $$.u.idutils.generateUniqueAlphaNumericShort(),
                            email: email
                        });
                        accountDao.saveOrUpdate(updatedAccount, function(err, savedAccount){
                            if(err) {
                                log.error('Error saving account: ' + err);
                                callback(err);
                            }
                            log.debug('<< createAccountAndUserFromTempAccount');
                            fn(null, {account: savedAccount, user:user});
                        });
                    }
                });
            }
        ], function asyncComplete(err){
            fn(err);
        });
    },

    sendWelcomeEmail: function(accountId, account, user, email, username, contactId, callback){
        /*
         * Send welcome email.  This is done asynchronously.
         * But only do this if we are not running unit tests.
         */
        if (process.env.NODE_ENV != "testing") {
            fs.readFile(notificationConfig.WELCOME_HTML, 'utf-8', function (err, htmlContent) {
                if (err) {
                    log.error('Error getting welcome email file.  Welcome email not sent for accountId ' + accountId);
                } else {
                    log.debug('account ', account.attributes.subdomain);
                    var siteUrl = account.get('subdomain') + '.' + appConfig.subdomain_suffix;

                    var vars = [
                        {
                            "name": "SITEURL",
                            "content": siteUrl
                        },
                        {
                            "name": "USERNAME",
                            "content": user.get('username')
                        }
                    ];
                    mandrillHelper.sendAccountWelcomeEmail(notificationConfig.WELCOME_FROM_EMAIL,
                        notificationConfig.WELCOME_FROM_NAME, email, username, notificationConfig.WELCOME_EMAIL_SUBJECT,
                        htmlContent, accountId, user.id(), vars, null, contactId, function (err, result) {
                        });
                }

            });
        }
        callback();
    },


    addUserToAccount: function(accountId, userId, roleAry, callingUser, fn) {
        var self = this;
        log.debug('>> addUserToAccount');

        async.waterfall([
            function stepZero(callback) {
                dao.getById(userId, $$.m.User, function(err, user){
                    if(err) {
                        log.error('Error fetching user:', err);
                        callback(err);
                    } else if(user === null) {
                        log.error('Could not find user');
                        callback('Could not find user');
                    } else {
                        callback(null, user);
                    }
                });
            },
            function stepOne(user, callback){
                var creds = user.getCredentials('lo');
                var username = user.get('username');
                user.createUserAccount(accountId, username, creds.password, roleAry);
                dao.saveOrUpdate(user, function(err, savedUser){
                    if(err) {
                        log.error('Error saving user:', err);
                        callback(err);
                    } else {
                        callback(null, savedUser, username);
                    }
                });
            },
            function stepTwo(user, username, callback) {
                log.debug('Initializing user security.');
                securityManager.initializeUserPrivileges(user.id(), username, roleAry, accountId, function(err, value) {
                    if (err) {
                        log.error('Error initializing user privileges for userID: ' + user.id());
                        callback(err);
                    } else {
                        callback(null, user);
                    }
                });
            }
        ], function(err, user){
            if(err) {
                return fn(err, null);
            } else {
                log.debug('<< addUserToAccount');
                return fn(null, user);
            }
        });

    },

    /**
     * This method creates a NEW user and initiates the security privileges for him/her.
     * @param accountId
     * @param username
     * @param password
     * @param email
     * @param roleAry
     * @param callingUser
     * @param fn
     */
    createUser: function(accountId, username, password, email, roleAry, callingUser, fn) {
        var self = this;
        log.debug('>> createUser');

        async.waterfall([
            function stepZero(callback){
                log.debug('Checking if user exists');
                //check for an existing user
                dao.usernameExists(username, function(err, exists){
                    if(err) {
                        log.error('Error checking that username exists', err);
                        callback(err);
                    } else {
                        if(exists === true) {
                            callback('Username [' + username + '] already exists');
                        } else {
                            callback();
                        }
                    }
                });
            },
            function stepOne(callback){
                log.debug('Creating user');
                var user = new $$.m.User({
                    username:username,
                    email:email,
                    created: {
                        date: new Date().getTime(),
                        strategy: $$.constants.user.credential_types.LOCAL,
                        by: callingUser, //self-created
                        isNew: true
                    }
                });
                user.encryptPasswordAsync(password, function(err, hash){
                    if(err) {
                        log.error('Error encrypting password: ' + err);
                        callback(err);
                    } else {
                        callback(null, hash, user);
                    }
                });
            },
            function stepTwo(hash, user, callback){
                log.debug('Storing encrypted password');
                user.createOrUpdateLocalCredentials(hash);
                user.createUserAccount(accountId, username, hash, roleAry);
                dao.saveOrUpdate(user, function(err, savedUser){
                    if(err) {
                        log.error('Error saving user:', err);
                        callback(err);
                    } else {
                        callback(null, savedUser);
                    }
                });
            },
            function stepThree(user, callback) {
                log.debug('Initializing user security.');
                securityManager.initializeUserPrivileges(user.id(), username, roleAry, accountId, function(err, value) {
                    if (err) {
                        log.error('Error initializing user privileges for userID: ' + user.id());
                        callback(err);
                    } else {
                        callback(null, user);
                    }
                });
            }
        ], function(err, user){
            if(err) {
                return fn(err, null);
            } else {
                return fn(null, user);
            }
        });
    },

    createAccountAndUser: function(username, password, email, accountToken, anonymousId, fingerprint, sendWelcomeEmail, name, fn) {
        var self = this;
        if (_.isFunction(accountToken)) {
            fn = accountToken;
            accountToken = null;
        }
        log.debug('>> createAccountAndUser');
        var user = null;
        async.waterfall([
            function stepOne(callback){
                //encrypt the password
                var userForEncryption = new $$.m.User({});
                userForEncryption.encryptPasswordAsync(password, function(err, hash){
                    if(err) {
                        log.error('Error encrypting password: ' + err);
                        callback(err);
                    } else {
                        callback(null, hash);
                    }
                });
            },
            function stepTwo(hash, callback){
                dao.getUserByUsername(username, function(err, value) {
                    if (err) {
                        log.error('Error getting user by username: ' + err);
                        callback(err);
                    } else {
                        if (value != null) {
                            //return fn(true, "An account with this username already exists");
                            user = value;
                            user.set('fingerprint', fingerprint);
                        } else {
                            user = new $$.m.User({
                                username:username,
                                email:email,
                                fingerprint: fingerprint,
                                created: {
                                    date: new Date().getTime(),
                                    strategy: $$.constants.user.credential_types.LOCAL,
                                    by: null, //self-created
                                    isNew: true
                                }
                            });
                            if(name.first) {
                                user.set('first', name.first);
                            }
                            if(name.middle) {
                                user.set('middle', name.middle);
                            }
                            if(name.last) {
                                user.set('last', name.last);
                            }
                            user.createOrUpdateLocalCredentials(hash);
                        }
                        callback(null, hash);
                    }
                });
            },
            function stepThree(hash, callback){
                accountDao.convertTempAccount(accountToken, function(err, value) {
                    if (err || value===null) {
                        log.error('Error converting account: ' + err);
                        callback(err);
                    } else {
                        callback(null, value, hash);
                    }
                });
            },
            function stepFour(account, hash, callback){
                var roleAry = ["super","admin","member"];
                user.createUserAccount(account.id(), username, hash, roleAry);

                dao.saveOrUpdate(user, function(err, savedUser) {
                    if (err) {
                        log.error('Error saving user: ' + err);
                        callback(err);
                    }
                    var userId = savedUser.id();
                    log.debug('Created user with id: ' + userId);
                    callback(null, account.id(), savedUser, roleAry);
                });
            },
            function stepFive(accountId, user, roleAry, callback){
                socialConfigManager.createSocialConfigFromUser(accountId, user, function(err, value){
                    if(err) {
                        log.error('Error creating social config for account:' + accountId);
                    }
                    return;
                });

                log.debug('Initializing user security.');
                securityManager.initializeUserPrivileges(user.id(), username, roleAry, accountId, function(err, value) {
                    if (err) {
                        log.error('Error initializing user privileges for userID: ' + user.id());
                        callback(err);
                    } else {
                        callback(null, accountId, user);
                    }
                });
            },
            function stepSix(accountId, user, callback){
                log.debug('creating website for account');
                cmsManager.createWebsiteForAccount(accountId, 'admin', function(err, value) {
                    if (err) {
                        log.error('Error creating website for account: ' + err);
                        callback(err);
                    } else {
                        callback(null, accountId, value.id(), user);
                    }
                });
            },
            function stepSeven(accountId, websiteId, user, callback){
                log.debug('creating default page');
                cmsManager.createDefaultPageForAccount(accountId, websiteId, function(err, value) {
                    if (err) {
                        log.error('Error creating default page for account: ' + err);
                        fn(err, null);
                    } else {
                        callback(null, accountId, user);
                    }
                });
            },
            function stepEight(accountId, user, callback){
                log.debug('Updating email notifications');
                accountDao.getAccountByID(accountId, function(err, updatedAccount){
                    cmsManager.updateEmailsByAccountId(accountId, user.get("email"), updatedAccount.get("business").name, function(err, value) {
                        if (err) {
                            log.error('Error updating emails: ' + err);
                            fn(err, null);
                        } else {
                            callback(null, accountId, user);
                        }
                    });
                });
            },
            function stepNine(accountId, user, callback){
                //pick up updated account
                accountDao.getAccountByID(accountId, function(err, updatedAccount){
                    var businessObj = updatedAccount.get('business');
                    var email = user.get('email');
                    businessObj.emails = [];
                    businessObj.emails.push({
                        _id: $$.u.idutils.generateUniqueAlphaNumericShort(),
                        email: email
                    });
                    accountDao.saveOrUpdate(updatedAccount, function(err, savedAccount){
                        if(err) {
                            log.error('Error saving account: ' + err);
                            callback(err);
                        }
                        log.debug('<< createUserFromUsernamePassword');
                        fn(null, {account: savedAccount, user:user});
                    });
                });
            }
        ],
        function(err){
            if(err) {
                log.error('error processing tasks: ' + err);
                return fn(err, null);
            }
        });

    },

    createAccountUserFromContact: function(accountId, username, password, contact, requser, fn) {
        var self = this;
        self.log = log;
        self.log.debug('>> createAccountUserFromContact');

        var user = null;
        //encrypt the password
        $$.m.User.encryptPasswordAsync(password, function(err, hash){
            if(err) {
                self.log.error('Error hashing password: ' + err);
                return fn(err, null);
            }
            //look for user by username first.  If found, update with account details, otherwise create.

            dao.getUserByUsername(username, function(err, value) {
                if (err) {
                    return fn(err, value);
                }

                if (value != null) {
                    //return fn(true, "An account with this username already exists");
                    user = value;
                } else {
                    user = new $$.m.User({

                        username:username,
                        email:contact.getEmails()[0],
                        first: contact.get('first'),
                        middle: contact.get('middle'),
                        last: contact.get('last'),
                        created: {
                            date: new Date().getTime(),
                            strategy: $$.constants.user.credential_types.LOCAL,
                            by: requser.id(), //created by current user
                            isNew: true
                        }
                    });
                    user.createOrUpdateLocalCredentials(hash);
                }
                var roleAry = ["member"];
                user.createUserAccount(accountId, username, hash, roleAry);

                dao.saveOrUpdate(user, function(err, savedUser) {
                    if (err) {
                        log.error('Error saving user: ' + err);
                        return fn(err, null);
                    }
                    //TODO: sm.createMemberPrivileges
                    self.log.debug('<< createAccountUserFromContact');
                    return fn(null, savedUser);
                });

            });
        });



    },

    createAccountUser: function(accountId, username, password, email, first, last, user, roleAry, fn) {
        var self = this;
        self.log = log;
        self.log.debug('>> createAccountUser');

        var user = null;
        //look for user by username first.  If found, update with account details, otherwise create.

        //encrypt the password
        $$.m.User.encryptPasswordAsync(password, function(err, hash){
            if(err) {
                self.log.error('Error hashing password: ' + err);
                return fn(err, null);
            }
            dao.getUserByUsername(username, function(err, value) {
                if (err) {
                    return fn(err, value);
                }

                if (value != null) {
                    //return fn(true, "An account with this username already exists");
                    user = value;
                } else {
                    user = new $$.m.User({

                        username:username,
                        email:email,
                        first: first,
                        middle: '',
                        last: last,
                        created: {
                            date: new Date().getTime(),
                            strategy: $$.constants.user.credential_types.LOCAL,
                            by: user.id(), //created by current user
                            isNew: true
                        }
                    });
                    user.createOrUpdateLocalCredentials(hash);
                }

                user.createUserAccount(accountId, username, hash, roleAry);

                dao.saveOrUpdate(user, function(err, savedUser) {
                    if (err) {
                        log.error('Error saving user: ' + err);
                        return fn(err, null);
                    }
                    //TODO: sm.createMemberPrivileges
                    self.log.debug('<< createAccountUserFromContact');
                    return fn(null, savedUser);
                });
            });
        });



    },

    getUserAccounts: function(accountId, fn) {
        var self = this;
        self.log = log;
        self.log.debug('>> getUserAccounts');

        var query ={
            'accounts.accountId': accountId
        };

        dao.findMany(query, $$.m.User, function(err, list){
            if(err) {
                self.log.error('Error searching for users by account:' + err);
                fn(err, null);
            } else {
                self.log.debug('<< getUserAccounts');
                fn(null, list);
            }
        });

    },

    deleteOrRemoveUserForAccount: function(accountId, userId, fn){
        var self = this;
        self.log = log;
        self.log.debug('>> deleteOrRemoveUserForAccount');

        dao.getById(userId, $$.m.User, function(err, user){
            if(err || user=== null) {
                self.log.error('Error getting user to delete:' + err);
                return fn(err, null);
            } else {
                if(user.getAllAccountIds().length > 1) {
                    user.removeAccount(accountId);
                    dao.saveOrUpdate(user, function(err, savedUser){
                        if(err) {
                            self.log.error('Error updating user: ' + err);
                            return fn(err, null);
                        } else {
                            self.log.debug('<< deleteOrRemoveUserForAccount');
                            return fn(null, 'removed');
                        }
                    });
                } else {
                    dao.removeById(userId, $$.m.User, function(err, value){
                        if(err) {
                            self.log.error('Error deleting user: ' + err);
                            return fn(err, null);
                        } else {
                            self.log.debug('<< deleteOrRemoveUserForAccount');
                            return fn(null, 'deleted');
                        }
                    });
                }
            }
        });
    },

    setUserPassword: function(userId, newPassword, callingUser, fn){
        var self = this;
        self.log = log;
        self.log.debug('>> setUserPassword');

        /*
         * 1. Get user by Id
         * 2. Encrypt password
         * 3. Update local credentials
         */
        dao.getById(userId, $$.m.User, function(err, user){
            if(err) {
                self.log.error('Error fetching user by Id', err);
                return fn(err, null);
            } else if(user === null) {
                self.log.warn('Could not find user with id [' + userId + ']');
                return fn(null, null);
            } else {
                user.encryptPasswordAsync(newPassword, function(err, hash){
                    if(err) {
                        self.log.error('Error encrypting password:', err);
                        return fn(err, null);
                    } else {
                        user.updateAllLocalCredentials(hash);
                        var modified = {
                            date: new Date(),
                            by: callingUser
                        };
                        user.set('modified', modified);
                        dao.saveOrUpdate(user, fn);
                    }
                });
            }
        });

    },

    getUserAccountIds: function(userId, fn) {
        dao.getById(userId, $$.m.User, function(err, user){
            if(err) {
                return fn(err, null);
            } else {
                return fn(null, user.getAllAccountIds());
            }

        });
    }
};