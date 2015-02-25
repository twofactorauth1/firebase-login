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

module.exports = {

    createAccountAndUserFromTempAccount: function(accountToken, fingerprint, sendWelcomeEmail, fn) {
        var self = this;
        log.debug('>> createAccountAndUserFromTempAccount');

        accountDao.getTempAccount(accountToken, function(err, tempAccount){
            if(err) {
                log.error('Error getting temp account: ' + err);
                return fn(err, null);
            }
            var user = new $$.m.User(tempAccount.tempUser);
            accountDao.convertTempAccount(accountToken, function(err, account) {
                if(err) {
                    log.error('Error converting temp account: ' + err);
                    return fn(err, null);
                }
                var accountId = account.id();
                var roleAry = ["super","admin","member"];
                var username = user.get('username');
                var email = user.get('email');
                user.createUserAccount(accountId, username, null, roleAry);
                user.set('_id', null);
                dao.saveOrUpdate(user, function(err, savedUser){
                    if(err) {
                        log.error('Error saving user: ' + err);
                        return fn(err, null);
                    }
                    var userId = savedUser.id();
                    log.debug('Created user with id: ' + userId);
                    socialConfigManager.createSocialConfigFromUser(accountId, savedUser, function(err, value){
                        if(err) {
                            log.error('Error creating social config for account:' + accountId);
                        }
                        return;
                    });

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
                                        "content": savedUser.attributes.username
                                    }
                                ];
                                mandrillHelper.sendAccountWelcomeEmail(notificationConfig.WELCOME_FROM_EMAIL,
                                    notificationConfig.WELCOME_FROM_NAME, email, username, notificationConfig.WELCOME_EMAIL_SUBJECT,
                                    htmlContent, accountId, userId, vars, function (err, result) {
                                    });
                            }

                        });
                    }



                    log.debug('Creating customer contact for main account.');
                    contactDao.createCustomerContact(user, appConfig.mainAccountID, fingerprint, function(err, contact){
                        if(err) {
                            log.error('Error creating customer for user: ' + userId);
                        } else {
                            log.debug('Created customer for user:' + userId);
                        }
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
                                        log.debug('<< createAccountAndUserFromTempAccount');
                                        fn(null, {account: account, user:savedUser});

                                    }

                                });
                            }

                        });
                    });
                });
            });

        });
    },

    createAccountAndUser: function(username, password, email, accountToken, anonymousId, fingerprint, sendWelcomeEmail, fn) {
        var self = this;
        if (_.isFunction(accountToken)) {
            fn = accountToken;
            accountToken = null;
        }
        log.debug('>> createAccountAndUser');
        var user = null;
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

            deferred
                .done(function(account) {
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
                                            "content": savedUser.attributes.username
                                        }
                                    ];
                                    mandrillHelper.sendAccountWelcomeEmail(notificationConfig.WELCOME_FROM_EMAIL,
                                        notificationConfig.WELCOME_FROM_NAME, email, username, notificationConfig.WELCOME_EMAIL_SUBJECT,
                                        htmlContent, accountId, userId, vars, function (err, result) {
                                        });
                                }

                            });
                        }



                        log.debug('Creating customer contact for main account.');
                        contactDao.createCustomerContact(user, appConfig.mainAccountID, fingerprint, function(err, contact){
                            if(err) {
                                log.error('Error creating customer for user: ' + userId);
                            } else {
                                log.debug('Created customer for user:' + userId);
                            }
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
                                            log.debug('<< createUserFromUsernamePassword');
                                            fn(null, {account: account, user:savedUser});

                                        }

                                    });
                                }

                            });
                        });
                    });




                });
        });
    },

    createAccountUserFromContact: function(accountId, username, password, contact, requser, fn) {
        var self = this;
        self.log = log;
        self.log.debug('>> createAccountUserFromContact');

        var user = null;

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
                user.createOrUpdateLocalCredentials(password);
            }
            var roleAry = ["member"];
            user.createUserAccount(accountId, username, password, roleAry);

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

    },

    createAccountUser: function(accountId, username, password, email, first, last, user, fn) {
        var self = this;
        self.log = log;
        self.log.debug('>> createAccountUser');

        var user = null;
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
                user.createOrUpdateLocalCredentials(password);
            }
            var roleAry = ["member"];
            user.createUserAccount(accountId, username, password, roleAry);

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