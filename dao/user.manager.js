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

                log.debug('Creating customer contact for main account.');
                contactDao.createCustomerContact(user, appConfig.mainAccountID, fingerprint, function(err, contact){
                    if(err) {
                        log.error('Error creating customer for user: ' + user.id());
                    } else {
                        log.debug('Created customer for user:' + user.id());
                    }
                    callback(null, account, user);
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
                        businessObj.email = email;
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

    sendWelcomeEmail: function(accountId, account, user, email, username, callback){
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
                        htmlContent, accountId, user.id(), vars, function (err, result) {
                        });
                }

            });
        }
        callback();
    },

    createAccountAndUser: function(username, password, email, accountToken, anonymousId, fingerprint, sendWelcomeEmail, fn) {
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
                        } else {
                            user = new $$.m.User({
                                username:username,
                                email:email,
                                created: {
                                    date: new Date().getTime(),
                                    strategy: $$.constants.user.credential_types.LOCAL,
                                    by: null, //self-created
                                    isNew: true
                                }
                            });
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
                //pick up updated account
                accountDao.getAccountByID(accountId, function(err, updatedAccount){
                    var businessObj = updatedAccount.get('business');
                    var email = user.get('email');
                    businessObj.email = email;
                    accountDao.saveOrUpdate(updatedAccount, function(err, savedAccount){
                        if(err) {
                            log.error('Error saving account: ' + err);
                            callback(err);
                        }
                        log.debug('<< createUserFromUsernamePassword');
                        fn(null, {account: savedAccount, user:user});
                    });
                });
            }],
            function(err){
                if(err) {
                    log.error('error processing tasks: ' + err);
                    return fn(err, null);
                }
            });
            /*




        dao.getUserByUsername(username, function(err, value) {
            if (err) {
                return fn(err, value);
            }

            if (value != null) {
                //return fn(true, "An account with this username already exists");
                user = value;
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

            deferred.done(function(account) {
                    var accountId;
                    if (account != null) {
                        accountId = account.id();
                    }

                    if (accountId == null) {
                        return fn(true, "Failed to create user, no account found");
                    }


                    if(user === null) {
                        user = new $$.m.User({

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

                    }


                    var roleAry = ["super","admin","member"];
                    user.createUserAccount(accountId, username, password, roleAry);

                    dao.saveOrUpdate(user, function(err, savedUser){
                        if(err) {
                            log.error('Error saving user: ' + err);
                            return fn(err, null);
                        }
                        var userId = savedUser.id();
                        log.debug('Created user with id: ' + userId);
                        //analyticsManager.linkUsers(anonymousId, userId, function(err, value){});
                        socialConfigManager.createSocialConfigFromUser(accountId, savedUser, function(err, value){
                            if(err) {
                                log.error('Error creating social config for account:' + accountId);
                            }
                            return;
                        });





                        log.debug('Initializing user security.');
                        securityManager.initializeUserPrivileges(userId, username, roleAry, accountId, function(err, value){
                            if(err) {
                                log.error('Error initializing user privileges for userID: ' + userId);
                                return fn(err, null);
                            }
                            log.debug('creating website for account');
                            cmsManager.createWebsiteForAccount(accountId, 'admin', function(err, value){
                                if(err) {
                                    log.error('Error creating website for account: ' + err);
                                    fn(err, null);
                                } else {
                                    log.debug('creating default page');
                                    cmsManager.createDefaultPageForAccount(accountId, value.id(), function(err, value){
                                        if(err) {
                                            log.error('Error creating default page for account: ' + err);
                                            fn(err, null);
                                        } else {
                                            //pick up updated account
                                            accountDao.getAccountByID(account.id(), function(err, updatedAccount){
                                                var businessObj = updatedAccount.get('business');
                                                var email = user.get('email');
                                                businessObj.email = email;
                                                accountDao.saveOrUpdate(updatedAccount, function(err, savedAccount){
                                                    if(err) {
                                                        log.error('Error saving account: ' + err);
                                                        callback(err);
                                                    }
                                                    log.debug('<< createUserFromUsernamePassword');
                                                    fn(null, {account: savedAccount, user:savedUser});
                                                });

                                            });

                                        }
                                    });
                                }

                            });
                        });
                    });

                });
        });
        */
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

    createAccountUser: function(accountId, username, password, email, first, last, user, fn) {
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
                    dao.saveOrUpdate(user, $$.m.User, function(err, savedUser){
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
    }
};