/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */


var dao = require('./user.dao');
var accountDao = require('./account.dao');
var cmsDao = require('../cms/dao/cms.dao');
var log = $$.g.getLogger("user.manager");
var securityManager = require('../security/sm')(true);
var contactDao = require('./contact.dao');
var appConfig = require('../configs/app.config');
var analyticsManager = require('../analytics/analytics_manager');

var mandrillHelper = require('../utils/mandrillhelper');
var notificationConfig = require('../configs/notification.config');
var fs = require('fs');

module.exports = {

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
                        analyticsManager.linkUsers(anonymousId, userId, function(err, value){});

                        /*
                         * Send welcome email.  This is done asynchronously.
                         * But only do this if we are not in the "testing" env.
                         */


                        if (process.env.NODE_ENV != "testing") {
                            fs.readFile(notificationConfig.WELCOME_HTML, 'utf-8', function (err, htmlContent) {
                                if (err) {
                                    log.error('Error getting welcome email file.  Welcome email not sent for accountId ' + accountId);
                                } else {
                                    log.debug('account ', account.attributes.subdomain);
                                    var vars = [
                                        {
                                            "name": "ADMINURL",
                                            "content": account.attributes.subdomain + ".indigenous.io/admin"
                                        },
                                        {
                                            "name": "SITEURL",
                                            "content": account.attributes.subdomain + ".indigenous.io/"
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
                            cmsDao.createWebsiteForAccount(accountId, 'admin', function(err, value){
                                if(err) {
                                    log.error('Error creating website for account: ' + err);
                                    fn(err, null);
                                } else {
                                    log.debug('creating default page');
                                    cmsDao.createDefaultPageForAccount(accountId, value.id(), function(err, value){
                                        if(err) {
                                            log.error('Error creating default page for account: ' + err);
                                            fn(err, null);
                                        } else {
                                            log.debug('<< createUserFromUsernamePassword');
                                            fn(null, savedUser);

                                        }

                                    });
                                }

                            });
                        });
                    });




                });
        });
    }

};