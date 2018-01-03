
var LOG = $$.g.getLogger("account.manager");
var accountDao = require('../dao/account.dao');
var orgDao = require('../organizations/dao/organization.dao');
var appConfig = require('../configs/app.config');
var assetManager = require('../assets/asset_manager');
var websiteDao = require('../ssb/dao/website.dao');
var pageDao = require('../ssb/dao/page.dao');
var sectionDao = require('../ssb/dao/section.dao');
var emailDao = require('../cms/dao/email.dao');
var campaignDao = require('../campaign/dao/campaign.dao');
var productDao = require('../products/dao/product.dao');
var organizationDao = require('../organizations/dao/organization.dao');
var userManager = null;//This is needed because of circular dependencies
var socialConfigManager = require('../socialconfig/socialconfig_manager');
var securityManager = require('../security/sm')(true);
var cmsManager = require('../cms/cms_manager');
var contactDao = require('../dao/contact.dao');
var ssbManager = require('../ssb/ssb_manager');
var sm = require('../security/sm')(false);

var async = require('async');

var defaultBusiness = {
    "logo" : '',
    "name" : '',
    "description" : '',
    "category" : '',
    "size" : '',
    "phones" : [],
    "addresses" : [],
    "type" :'',
    "nonProfit" : false,
    "emails": [],
    'splitHours': false,
    'hours': [
        {'day': "Mon", 'start':"9:00 am",'end':"5:00 pm", 'start2':"9:00 am", 'end2':"5:00 pm", 'closed':false, 'split':false, 'wholeday':false},
        {'day': "Tue", 'start':"9:00 am",'end':"5:00 pm", 'start2':"9:00 am", 'end2':"5:00 pm", 'closed':false, 'split':false, 'wholeday':false},
        {'day': "Wed", 'start':"9:00 am",'end':"5:00 pm", 'start2':"9:00 am", 'end2':"5:00 pm", 'closed':false, 'split':false, 'wholeday':false},
        {'day': "Thu", 'start':"9:00 am",'end':"5:00 pm", 'start2':"9:00 am", 'end2':"5:00 pm", 'closed':false, 'split':false, 'wholeday':false},
        {'day': "Fri", 'start':"9:00 am",'end':"5:00 pm", 'start2':"9:00 am", 'end2':"5:00 pm", 'closed':false, 'split':false, 'wholeday':false},
        {'day': "Sat", 'start':"9:00 am",'end':"5:00 pm", 'start2':"9:00 am", 'end2':"5:00 pm", 'closed':true, 'split':false, 'wholeday':false},
        {'day': "Sun", 'start':"9:00 am",'end':"5:00 pm", 'start2':"9:00 am", 'end2':"5:00 pm", 'closed':true, 'split':false, 'wholeday':false}]
};
var defaultBilling = {
    "userId" : '',
    "stripeCustomerId": '',
    "cardToken": '',
    "signupDate": new Date(),
    "trialLength": 31
};

var accountManager = {
    log:LOG,

    getOwnerUsername: function(accountId, userId, orgId, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> getOwnerUsername');
        organizationDao.getById(orgId, $$.m.Organization, function(err, organization){
            if(err) {
                self.log.error('Error getting organization:', err);
                fn(err);
            } else {
                if(!contactDao.getContactsByTagArray) {
                    contactDao = require('../dao/contact.dao');
                }
                contactDao.getContactsByTagArray(accountId, userId, ['Pre-Activation'], function(err, contacts){
                    if(err) {
                        self.log.error('Error getting contacts:', err);
                        fn(err);
                    } else {
                        var userName = '';
                        if(contacts && contacts.length > 0) {
                            userName = contacts[0].getPrimaryEmail();
                        }
                        self.log.debug(accountId, userId, '<< getOwnerUsername');
                        fn(null, userName);
                    }
                });
            }
        });
    },

    cancelAccount: function(accountId, userId, targetAccountId, reason, cancelNow, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> cancelAccount [' + targetAccountId + ']');
        var paymentsManager = require('../payments/payments_manager');
        async.waterfall([
            function(cb) {
                accountDao.getAccountByID(targetAccountId, function(err, account){
                    if(err) {
                        self.log.error(accountId, userId, 'Error finding account:', err);
                        cb(err);
                    } else {
                        cb(null, account);
                    }
                });
            },
            function(account, cb) {
                var atPeriodEnd = true;
                if(cancelNow === true) {
                    atPeriodEnd = false;
                }
                paymentsManager.cancelAccountSubscription(accountId, userId, account, atPeriodEnd, function(err, value){
                    if(err) {
                        self.log.error(accountId, userId, 'Error cancelling account subscription:', err);
                        cb(err);
                    } else {
                        cb(null, account);
                    }
                });
            },
            function(account, cb) {
                var billing = account.get('billing');
                billing.cancellationDate = new Date();
                billing.cancellationReason = reason;
                if(cancelNow === true) {
                    account.set('locked_sub', true);
                }

                accountDao.saveOrUpdate(account, function(err, savedAccount){
                    if(err) {
                        self.log.error(accountId, userId, 'Error saving account:', err);
                        cb(err);
                    } else {
                        cb(null, savedAccount);
                    }
                });
            }
        ], function(err, updatedAccount){
            if(err) {
                self.log.error(accountId, userId, 'Error cancelling account subscription:', err);
                fn(err);
            } else {
                self.log.debug(accountId, userId, '<< cancelAccount');
                fn(null, updatedAccount);
            }
        });

    },

    getOrganizationByAccountId: function(accountId, userId, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> getOrganizationByAccountId');
        accountDao.getAccountByID(accountId, function(err, account){
            if(err) {
                self.log.error(accountId, userId, 'Error getting account:', err);
                fn(err);
            } else {
                var orgId = account.get('orgId') || 0;
                organizationDao.getById(orgId, $$.m.Organization, function(err, organization){
                    if(err) {
                        self.log.error(accountId, userId, 'Error getting organization:', err);
                        fn(err);
                    } else {
                        self.log.debug(accountId, userId, '<< getOrganizationByAccountId');
                        fn(null, organization);
                    }
                });
            }
        });
    },

    getOrganizationById: function(accountId, userId, orgId, fn) {
        var self = this;
        self.log.debug(accountId, userId, 'getOrganizationbyId');
        organizationDao.getById(orgId || 0, $$.m.Organization, function(err, organization){
            if(err) {
                self.log.error(accountId, userId, 'Error getting organization:', err);
                fn(err);
            } else {
                self.log.debug(accountId, userId, '<< getOrganizationbyId');
                fn(null, organization);
            }
        });
    },

    getAccountIdsByOrg: function(accountId, userId, orgId, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> getAccountIdsByOrg');
        var query = {
            orgId:orgId
        };
        accountDao.findMany(query, $$.m.Account, function(err, accounts){
            if(err) {
                self.log.error(accountId, userId, 'Error finding accounts:', err);
                return fn(err);
            } else {
                var accountIds = [];
                _.each(accounts, function(account){
                    accountIds.push(account.id());
                });
                self.log.debug(accountId, userId, '<< getAccountIdsByOrg');
                return fn(null, accountIds);
            }
        });
    },

    copyAccountTemplate:function(accountId, userId, srcAccountId, destAccountId, fn){
        var self = this;
        self.log.debug(accountId, userId, '>> copyAccountTemplate');
        var rollbackHandler = {};
        var srcAccount = null;
        var idMap = {};
        async.waterfall([
            function(cb) {
                accountDao.getAccountByID(srcAccountId, cb);
            },
            function(account, cb) {
                if(!account) {
                    cb('source account with id[' + srcAccountId + '] not found');
                } else {
                    //fetch destination account
                    srcAccount = account;
                    accountDao.getAccountByID(destAccountId, cb);
                }
            },
            function(account, cb){
                 /*
                 * COPY Account Settings
                 */
                if(!account) {
                    cb('Could not find destination account');
                } else {
                    self.log.debug(accountId, userId, 'Found destination account with id:' + account.id());
                    self._copyAccountSettings(accountId, userId, srcAccountId, account.id(), account, srcAccount, function(err, updatedAccount){
                        cb(err, account);
                    });
                }
            },
            function(account, cb){
                /*
                 * COPY ASSETS
                 */
                self._copyAssets(accountId, userId, srcAccountId, account.id(), idMap, function(err, updatedIdMap){
                    //I don't think we need the udpatedIdMap... the reference should hold
                    cb(err, account);
                });
            },
            function(account, cb) {
                /*
                 * COPY WEBSITE
                 */
                websiteDao.getWebsitesForAccount(srcAccountId, function(err, websites){
                    if(err) {
                        self.log.error(accountId, userId, 'Error finding websites:', err);
                        cb(err);
                    } else if(!websites || !websites.length || websites.length < 1) {
                        self.log.error(accountId, userId, 'Could not find website');
                        cb('Could not find websites');
                    } else {
                        websiteDao.getWebsitesForAccount(destAccountId, function(err, destWebsites){
                            if(err) {
                                self.log.error(accountId, userId, 'Error finding websites:', err);
                                cb(err);
                            } else if(!destWebsites || !destWebsites.length || destWebsites.length < 1) {
                                self.log.error(accountId, userId, 'Could not find website');
                                cb('Could not find websites');
                            } else {
                                var sourceWebsite = websites[0];
                                idMap.website = idMap.website || {};
                                idMap.website.sourceId = sourceWebsite.id();
                                sourceWebsite.set('_id', destWebsites[0].id());
                                sourceWebsite.set('accountId', account.id());
                                var created = {date:new Date(), by:userId};
                                sourceWebsite.set('created', created);
                                sourceWebsite.set('modified', created);
                                if(sourceWebsite.get('settings') && sourceWebsite.get('settings').favicon) {
                                    var settings = sourceWebsite.get('settings');
                                    var url = settings.favicon;
                                    if(idMap.assets && idMap.assets[url]) {
                                        settings.favicon = idMap.assets[url];
                                        sourceWebsite.set('settings', settings);
                                    }
                                }
                                websiteDao.saveOrUpdate(sourceWebsite, function(err, destWebsite){
                                    if(err) {
                                        self.log.error(accountId, userId, 'Error saving website:', err);
                                        cb(err);
                                    } else {
                                        idMap.website.destId = destWebsite.id();
                                        cb(null, account);
                                    }
                                });
                            }
                        });

                    }
                });
            },
            // Update blog and blog list version and set inactive
            function(account, cb){
                var query = {accountId:account.id(), latest:true};
                pageDao.findMany(query, $$.m.ssb.Page, function(err, pages){
                    if(err) {
                        self.log.error(accountId, userId, 'Error finding pages:', err);
                        cb(err);
                    } else {
                        async.eachSeries(pages, function(page, callback){
                            self._updateBlogPages(account.id(), userId, page, callback);
                        }, function(err){
                            if(err) {
                                self.log.error(accountId, userId, 'Error updating blog pages:', err);
                                cb(err);
                            } else {
                                cb(null, account);
                            }
                        });
                    }
                });
            },
            function(account, cb) {
                /*
                 * Copy pages and sections
                 */
                var query = {accountId:srcAccountId, latest:true};
                pageDao.findMany(query, $$.m.ssb.Page, function(err, pages){
                    if(err) {
                        self.log.error(accountId, userId, 'Error finding pages:', err);
                        cb(err);
                    } else {
                        idMap.pages = idMap.pages || {};
                        async.eachSeries(pages, function(page, callback){
                            self._copyPage(accountId, userId, srcAccountId, account.id(), idMap.website.destId, idMap, page, callback);
                        }, function(err){
                            if(err) {
                                self.log.error(accountId, userId, 'Error copyingPage:', err);
                                cb(err);
                            } else {
                                cb(null, account);
                            }
                        });
                    }
                });
            },
            function(account, cb) {
                /*
                 * Copy published pages
                 */
                var query = {accountId:srcAccountId, latest:true};

                pageDao.findPublishedPages(query, function(err, pages){
                    if(err) {
                        self.log.error(accountId, userId, 'Error finding pages:', err);
                        cb(err);
                    } else {
                        idMap.published_pages = idMap.published_pages || {};
                        async.eachSeries(pages, function(page, callback){
                            self._copyPublishedPages(accountId, userId, srcAccountId, account.id(), idMap.website.destId, idMap, page, callback);
                        }, function(err){
                            if(err) {
                                self.log.error(accountId, userId, 'Error copyingPublishedPage:', err);
                                cb(err);
                            } else {
                                cb(null, account);
                            }
                        });
                    }
                });
            },
            function(account, cb) {
                /*
                 * Update old emails
                 */
                var query = {accountId:account.id(), latest:true};
                emailDao.findMany(query, $$.m.cms.Email, function(err, emails){
                    if(err) {
                        self.log.error(accountId, userId, 'Error getting old emails:', err);
                        cb(err);
                    } else {

                        async.eachSeries(emails, function(email, callback){

                            email.set('latest', false);
                            emailDao.saveOrUpdate(email, function(err, savedEmail){
                                if(err) {
                                    self.log.error(accountId, userId, 'Error saving old email:', err);
                                    callback(err);
                                } else {
                                    callback();
                                }
                            });
                        }, function(err){
                            if(err) {
                                self.log.error(accountId, userId, 'Error copying old emails:', err);
                                cb(err);
                            } else {
                                cb(null, account);
                            }
                        });
                    }
                });
            },
            function(account, cb) {
                /*
                 * Copy emails
                 */
                var query = {accountId:srcAccountId, latest:true};
                emailDao.findMany(query, $$.m.cms.Email, function(err, emails){
                    if(err) {
                        self.log.error(accountId, userId, 'Error getting emails:', err);
                        cb(err);
                    } else {
                        idMap.emails = idMap.emails || {};
                        async.eachSeries(emails, function(email, callback){
                            var sourceId = email.id();
                            email.set('_id', null);
                            email.set('accountId', account.id());
                            //not sure about fromName, fromEmail, replyTo
                            email.set('fromName', '');
                            email.set('fromEmail', '');
                            email.set('replyTo', '');
                            var created = {date:new Date(), by:userId};
                            email.set('created', created);
                            email.set('modified', created);
                            var components = email.get('components');
                            _.each(components, function(component){
                                self._fixJSONAssetReferences(component, idMap);
                            });
                            email.set('components', components);
                            emailDao.saveOrUpdate(email, function(err, savedEmail){
                                if(err) {
                                    self.log.error(accountId, userId, 'Error saving email:', err);
                                    callback(err);
                                } else {
                                    var destId = savedEmail.id();
                                    idMap.emails[sourceId] = destId;
                                    callback();
                                }
                            });
                        }, function(err){
                            if(err) {
                                self.log.error(accountId, userId, 'Error copying emails:', err);
                                cb(err);
                            } else {
                                cb(null, account);
                            }
                        });
                    }
                });
            },
            function(account, cb) {
                /*
                 * Copy campaigns
                 */
                self._copyCampaigns(accountId, userId, srcAccountId, account.id(), idMap, function(err, value){
                    if(err) {
                        self.log.error(accountId, userId, 'Error copying campaigns:', err);
                        cb(err);
                    } else {
                        cb(null, account);
                    }
                });
            },
            function(account, cb) {
                /*
                 * Copy Products
                 * -- emailSettings
                 * -- assets
                 */
                var query = {accountId:srcAccountId};
                productDao.findMany(query, $$.m.Product, function(err, products){
                    if(err) {
                        self.log.error(accountId, userId, 'Error finding products');
                        cb(err);
                    } else {
                        idMap.products = idMap.products || {};
                        async.eachSeries(products, function(product, callback){
                            var srcProductId = product.id();
                            product.set('_id', null);
                            product.set('accountId', destAccountId);
                            var created = {date: new Date(), by:userId};
                            product.set('created', created);
                            product.set('modified', created);
                            var emailSettings = product.get('emailSettings');
                            if(emailSettings && emailSettings.emailId) {
                                emailSettings.emailId = idMap.emails[emailSettings.emailId];
                                emailSettings.fromEmail = '';
                                emailSettings.fromName = '';
                                emailSettings.replyTo = '';
                                emailSettings.bcc = '';
                                product.set('emailSettings', emailSettings);
                            }
                            var productJSON = self._fixJSONAssetReferences(product.toJSON(), idMap);
                            var destProduct = new $$.m.Product(productJSON);
                            productDao.saveOrUpdate(destProduct, function(err, savedProduct){
                                if(err) {
                                    self.log.error(accountId, userId, 'Error saving product:', err);
                                    callback(err);
                                } else {
                                    idMap.products[srcProductId] = savedProduct.id();
                                    callback();
                                }
                            });
                        }, function(err){
                            if(err) {
                                self.log.error(accountId, userId, 'Error copying products:', err);
                                cb(err);
                            } else {
                                cb(null, account);
                            }
                        });
                    }
                });
            }
        ], function(err, account){
            if(err) {
                self.log.error(accountId, userId, 'Error copying account:', err);
                fn(err);
            } else {
                self.log.debug(accountId, userId, '<< copyAccountTemplate');
                fn(null, account);
            }
        });
    },

    activateAccount: function(accountId, userId, orgId, username, password, templateAccountId, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> activateAccount');
        /*
         create User, Delete Contact and associate Template w/ Account (if applicable). At successful completion change activation flag
         */
        async.waterfall([
            function(cb) {
                accountDao.getAccountByID(accountId, function(err, account){
                    cb(err, account);
                });
            },
            function(account, cb) {
                organizationDao.getById(orgId, $$.m.Organization, function(err, organization){
                    cb(err, account, organization);
                });
            },
            function(account, organization, cb) {
                //VALIDATION STEP
                if(account.get('activated') !== false) {
                    cb('Cannot activate an active account');
                } else if(account.get('orgId') !== orgId) {
                    cb('OrgID mismatch');
                } else {
                    cb(null, account, organization);
                }
            },
            function(account,organization, cb){
                var params = null;
                var roleAry = ['super','admin','member'];
                var callingUser = null;
                if(!userManager) {
                    userManager = require('../dao/user.manager');
                }
                userManager.createUser(accountId, username, password, username, roleAry, callingUser, params, function(err, user){
                    cb(err, account, organization, user);
                });
            },
            function(account, organization, user, cb) {
                if(templateAccountId) {
                    self.copyAccountTemplate(accountId, userId, templateAccountId, accountId, function(err, value){
                        cb(err, account, organization, user);
                    });
                } else {
                    cb(null, account, organization, user);
                }
            },
            function(account, organization, user, cb) {
                if(!contactDao) {
                    contactDao = require('../dao/contact.dao');
                }
                contactDao.findContactsByEmail(accountId, username, function(err, contacts){
                    if(contacts) {
                        var contactIDAry = [];
                        _.each(contacts, function(contact){
                            contactIDAry.push(contact.id());
                        });
                        contactDao.removeByQuery({_id:{$in:contactIDAry}}, $$.m.Contact, function(err, value){
                            cb(err, account, organization, user);
                        });
                    } else {
                        cb(null, account, organization, user);
                    }
                });
            },
            function(account, organization, user, cb) {
                //TODO: we might want to get the plan from the organization settings here
                var orgSettings = organization.get('signupSettings');
                var subscriptionId = orgSettings.internalSubscription;
                var planId = orgSettings.internalSubscription;

                sm.setPlanAndSubOnAccount(accountId, subscriptionId, planId, userId, function(err, value){
                    cb(err, account, user, organization);
                });
            },
            function(account, user, organization, cb) {
                //send welcome email
                var orgSettings = organization.get('signupSettings');
                if(orgSettings && orgSettings.welcomeEmail) {
                    userManager.sendOrgWelcomeEmail(accountId, account, organization, user, username, username, null, function(err, value){
                        cb(err, account);
                    });
                } else {
                    userManager.sendWelcomeEmail(accountId, account, user, username, username, null, function(err){
                        cb(err, account);
                    });
                }

            }

        ], function(err, account){
            if(err) {
                self.log.error('Error activating account:', err);
                fn(err);
            } else {
                self.log.debug(accountId, userId, '<< activateAccount');
                fn(null, account);
            }
        });
    },

    createAccount: function(accountId, userId, orgId, subdomain, username, password, billing, oem, passkey, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> createAccount');
        if(!userManager) {
            userManager = require('../dao/user.manager');
        }
        async.waterfall([
            function(cb) {
                // validate new account
                self.getAccountBySubdomainAndOrgId(subdomain, orgId, function(err, existingAccount){
                    if(err || existingAccount) {
                        cb(err || 'Account with subdomain [' + subdomain + '] and orgId [' + orgId + '] already exists');
                    } else {
                        cb();
                    }
                });
            },
            function(cb) {
                //validate user
                userManager.getUserByUsername(accountId, userId, username, function(err, user){
                    if(err) {
                        cb(err);
                    } else if(user) {
                        self.log.debug(accountId, userId, 'User with username [' + username + '] already exists.');
                        cb(null, user);
                    } else {
                        cb(null, null);
                    }
                });
            },
            function(user, cb) {
                var account = new $$.m.Account({
                    orgId:orgId,
                    subdomain:subdomain,
                    oem:oem,
                    passkey:passkey,
                    created:{
                        date: new Date(),
                        by:userId
                    }
                });
                accountDao.saveOrUpdate(account, function(err, newAccount){
                    if(err) {
                        self.log.error(accountId, userId, 'Error creating new account:', err);
                        cb(err);
                    } else {
                        cb(null, newAccount, user);
                    }

                });
                /*
                 * - create account
                 * - create user
                 * - setupCustomerContactAndSocialConfig
                 * - setupSecurity
                 * - setupCMS
                 * - finalizeAccount
                 * - take care of billing
                 * - add subscription privs
                 * - add admin users
                 */
            },
            function(newAccount, user, cb) {
                var newAccountId = newAccount.id();
                var roleAry = ["super","admin","member"];

                if(user) {
                    var newUsername = user.get('username');
                    var newEmail = user.get('email');
                    userManager.addUserToAccount(newAccountId, userId, ["super","admin","member"], userId, function(err, savedUser){
                        if (err) {
                            self.log.error('Error saving user: ' + err);
                            cb(err);
                        } else {
                            cb(null, newAccount, savedUser);
                        }
                    });
                } else {
                    userManager.createUser(newAccountId, username, password, username, roleAry, userId, null, function(err, savedUser){
                        if (err) {
                            self.log.error('Error saving user: ' + err);
                            cb(err);
                        } else {
                            cb(null, newAccount, savedUser);
                        }
                    });
                }
            },
            function setupCustomerContactAndSocialConfig(newAccount, savedUser, callback){
                socialConfigManager.createSocialConfigFromUser(newAccount.id(), savedUser, function(err, value){
                    if(err) {
                        self.log.error('Error creating social config for account:' + newAccount.id());
                        callback(err);
                    } else {
                        callback(null, newAccount, savedUser);
                    }

                });
            },
            function setupSecurity(account, user, callback){
                self.log.debug('Initializing user security.');
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
                self.log.debug('creating website for account');
                var accountId = account.id();
                cmsManager.createWebsiteForAccount(accountId, 'admin', function(err, value){
                    if(err) {
                        self.log.error('Error creating website for account: ' + err);
                        callback(err);
                    } else {
                        var websiteId = value.id();
                        self.log.debug('creating default pages');
                        cmsManager.createDefaultPageForAccount(accountId, websiteId, function (err, value) {
                            if (err) {
                                log.error('Error creating default page for account: ' + err);
                                callback(err);
                            } else {
                                self.log.debug(accountId, user.id(), 'creating blog pages');
                                ssbManager.addBlogPages(accountId, websiteId, user.id(), function(err, blogPages){
                                    if(err) {
                                        self.log.error(accountId, user.id(), 'Error adding blog pages:', err);
                                        callback(err);
                                    } else {
                                        callback(null, account, user);
                                    }
                                });

                            }
                        });
                    }
                });
            },
            /*
             * - add subscription privs
             * - add admin users
             */
            function finalizeAccount(account, user, cb){
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
                        if(billing) {
                            updatedAccount.set('billing', billing);
                        }
                        accountDao.saveOrUpdate(updatedAccount, function(err, savedAccount){
                            if(err) {
                                self.log.error('Error saving account: ' + err);
                                callback(err);
                            }
                            cb(null, savedAccount, user);
                        });
                    }
                });
            },
            function(newAccount, savedUser, cb) {
                var subId = 'NOSUBSCRIPTION';
                var plan = 'NO_PLAN_ARGUMENT';
                securityManager.addSubscriptionToAccount(newAccount.id(), subId, plan, savedUser.id(), function(err, value){
                    cb(err, newAccount, savedUser);
                });
            },

            function(newAccount, savedUser, cb) {
                self.log.debug('Adding the admin user to the new account');
                userManager.addUserToAccount(newAccount.id(), 1, ["super","admin","member"], 1, function(err, value){
                    if(err) {
                        self.log.error('Error adding admin user to account:', err);
                    } else {
                        self.log.debug('Admin user added to account ' + accountId);
                    }
                    userManager.addUserToAccount(newAccount.id(), userId, ["super","admin","member"], userId, function(err, value){
                        if(orgId && orgId > 0) {
                            organizationDao.getById(orgId, $$.m.Organization, function(err, organization){
                                if(organization && organization.get('adminUser') && organization.get('adminUser') > 1) {
                                    self.log.debug('Adding the org admin user to the new account');
                                    var orgAdminUser = organization.get('adminUser');
                                    userManager.addUserToAccount(newAccount.id(), orgAdminUser, ['super', 'admin', 'member'], orgAdminUser, function(err, value){
                                        if(err) {
                                            self.log.error('Error adding org admin user to account:', err);
                                        } else {
                                            self.log.debug('Org Admin user added to account ' + accountId);
                                        }
                                        cb(null, newAccount);
                                    });
                                } else {
                                    cb(null, newAccount);
                                }
                            });
                        } else {
                            cb(null, newAccount);
                        }
                    });

                });
            }

        ], function(err, newAccount){
            if(err) {
                self.log.error('Error creating new account:', err);
                fn(err);
            } else {
                self.log.debug(accountId, userId, '<< createAccount');
                fn(null, newAccount);
            }
        });
    },

    /**
     * Used to check for existance of account
     * @param accountId - accountId to exclude from results.
     * @param subdomain - subdomain we are looking for
     * @param orgId - organization of the account.
     * @param fn
     */
    getAccountsBySubdomainAndOrgId: function(accountId, subdomain, orgId, fn) {
        var query = {
            _id:{$ne:accountId},
            subdomain:subdomain,
            orgId:orgId
        };
        accountDao.findOne(query, $$.m.Account, fn);
    },

    getAccountBySubdomainAndOrgId: function(subdomain, orgId, fn) {
        var self = this;
        self.log.debug('>> getAccountBySubdomainAndOrgId(' + subdomain + ',' + orgId + ')');
        orgId = orgId || 0;
        accountDao.findOne({orgId:orgId, subdomain:subdomain}, $$.m.Account, fn);
    },

    getAccountBySubdomainAndOrgDomain: function(subdomain, domain, fn) {
        var self = this;
        self.log.debug('>> getAccountBySubdomainAndOrg(' + subdomain + ', ' + domain + ', fn)');
        orgDao.getByOrgDomain(domain, function(err, organization){
            if(err) {
                fn(err);
            } else if(!organization){
                fn('No organization found');
            } else {
                if(subdomain) {
                    accountDao.findOne({orgId:organization.id(), subdomain:subdomain}, $$.m.Account, fn);
                } else {
                    accountDao.findOne({_id:organization.get('adminAccount')}, $$.m.Account, fn);
                }
            }
        });
    },

    _updateBlogPages: function(accountId, userId, page, fn){

        page.set('latest', false);
        page.set('version', 0);
        //var currentVersion = 0;
        // page.set('_id', page.id() + '_' + currentVersion);
        pageDao.saveOrUpdate(page, function(err, value){
            if(err) {
                self.log.error(accountId, userId, 'Error saving page:', err);
                fn(err);
            } else {
                fn();
            }
        });
    },

    _copyPage: function(accountId, userId, srcAccountId, destAccountId, destWebsiteId, idMap, page, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> _copyPage [' + page.id() + ']');
        var created = {date:new Date(), by:userId};
        var srcPageId = page.id();
        page.set('_id', null);
        page.set('websiteId', destWebsiteId);
        page.set('accountId', destAccountId);
        page.set('created', created);
        page.set('modified', created);
        page.set('published', null);
        pageDao.saveOrUpdate(page, function(err, destPage){
            if(err) {
                self.log.error(accountId, userId, 'Error saving page:', err);
                fn(err);
            } else {
                var destPageId = destPage.id();
                idMap.pages[srcPageId] = destPageId;
                idMap.sections = idMap.sections || {};
                self._copySections(accountId, userId, srcAccountId, destAccountId, destWebsiteId, destPageId, destPage.get('sections'), idMap, function(err, sectionIdAry){
                    if(err) {
                        self.log.error(accountId, userId, 'Error saving sections:', err);
                        fn(err);
                    } else {
                        destPage.set('sections', sectionIdAry);
                        self.log.debug(accountId, userId, '<< _copyPage');
                        pageDao.saveOrUpdate(page, fn);
                    }
                });
            }
        });
    },

    _copySections: function(accountId, userId, srcAccountId, destAccountId, destWebsiteId, destPageId, sections, idMap, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> _copySections');
        var sectionIdAry = [];
        async.eachSeries(sections, function(sectionRef, cb){
            var sectionId = sectionRef._id;
            self.log.debug(accountId, userId, 'Copying section [' + sectionId + ']');
            sectionDao.getById(sectionId, $$.m.ssb.Section, function(err, section){
                if(err) {
                    self.log.error(accountId, userId, 'Error finding section:', err);
                    cb(err);
                } else {
                    if(!section) {
                        self.log.warn(accountId, userId, 'No section found with id [' + sectionId + ']');
                        cb();
                    } else if(idMap.sections[sectionId]){
                        self.log.debug(accountId, userId, 'Skipping section with id [' + sectionId + '] because it was already copied');
                        // Add global section to section array of the page
                        sectionIdAry.push({"_id": idMap.sections[sectionId]});
                        cb();
                    } else {
                        var oldId = sectionId;
                        section.set('_id', null);
                        section.set('accountId', destAccountId);

                        var sectionJSON = section.toJSON();
                        self.log.debug('Before transformation:', sectionJSON);
                        sectionJSON = self._fixJSONAssetReferences(sectionJSON, idMap);
                        self.log.debug('After transformation:', sectionJSON);
                        section = new $$.m.ssb.Section(sectionJSON);
                        section.set("enabled", true);
                        sectionDao.saveOrUpdate(section, function(err, savedSection){
                            if(err) {
                                self.log.error(accountId, userId, 'Error saving sections:', err);
                                cb(err);
                            } else {
                                idMap.sections[oldId] = savedSection.id();
                                sectionIdAry.push({"_id": savedSection.id()});
                                cb();
                            }
                        });
                    }

                }
            });
        }, function(err){
            if(err) {
                self.log.error(accountId, userId, 'Error saving sections:', err);
                fn(err);
            } else {
                self.log.debug(accountId, userId, '<< _copySections');
                fn(null, sectionIdAry);
            }
        });
    },

    _copyPublishedPages: function(accountId, userId, srcAccountId, destAccountId, destWebsiteId, idMap, page, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> _copyPublishedPages [' + page.id() + ']');
        var created = {date:new Date(), by:userId};
        var srcPageId = page.id();
        page.set('_id', null);
        page.set('websiteId', destWebsiteId);
        page.set('accountId', destAccountId);
        page.set('created', created);
        page.set('modified', created);
        pageDao.savePublishedPage(page, function(err, destPage){
            if(err) {
                self.log.error(accountId, userId, 'Error saving page:', err);
                fn(err);
            } else {
                var destPageId = destPage.id();
                idMap.published_pages[srcPageId] = destPageId;
                fn();
            }
        });
    },

    _copyAssets: function(accountId, userId, srcAccountId, destAccountId, idMap, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> _copyAssets');

        assetManager.listAssets(srcAccountId, 0, 0, function(err, assets){
            if(err) {
                self.log.error('Error listing assets:', err);
                fn(err);
            } else {
                async.eachLimit(assets, 10, function(asset, cb){
                    asset.set('_id', null);
                    asset.set('accountId', destAccountId);
                    var created = {date:new Date(), by:userId};
                    asset.set('created', created);
                    asset.set('modified', created);
                    var sourceUrl = asset.get('url');
                    var destUrl = sourceUrl.replace(/account_\d+/g, 'account_' + destAccountId);
                    idMap.assets = idMap.assets || {};
                    idMap.assets[sourceUrl] = destUrl;
                    var contentType = asset.get('mimeType');
                    asset.set('url', destUrl);
                    assetManager.copyS3Asset(accountId, userId, sourceUrl, destUrl, contentType, function(err, value){
                        if(err) {
                            self.log.error('Error copying asset:', err);
                            cb(err);
                        } else {
                            assetManager.updateAsset(asset, userId, function(err, value){
                                if(err) {
                                    self.log.error('Error saving asset:', err);
                                    cb();
                                } else {
                                    cb();
                                }
                            });
                        }
                    });
                }, function(err){
                    if(err) {
                        self.log.error(accountId, userId, 'Error copying assets:', err);
                        fn(err);
                    } else {
                        self.log.debug(accountId, userId, '<< _copyAssets');
                        fn(null, idMap);
                    }
                });
            }
        });
    },

    _fixJSONAssetReferences: function(json, idMap) {
        var checkObjectFxn = function(obj){
            /*
             * If obj is an Array, iterate and call checkObj or fixString
             * If obj is an Object, iterate over keys and call checkObj or fixString
             */
            if(_.isArray(obj)) {
                _.each(obj, function(_obj){
                    if(_.isObject(_obj)) {
                        checkObjectFxn(_obj);
                    } else {
                        _obj = fixStringFxn(_obj);
                    }
                });
            } else if(_.isObject(obj)) {
                _.each(_.keys(obj), function(_obj){
                    if(_.isObject(_obj)) {
                        checkObjectFxn(_obj);
                    } else {
                        _obj = fixStringFxn(_obj);
                    }
                });
            }
        };
        var fixStringFxn = function(str) {
            _.each(_.keys(idMap.assets), function(srcUrl){
                /*
                 * This is a neat trick: http://stackoverflow.com/questions/4371565/can-you-create-javascript-regexes-on-the-fly-using-string-variables
                 * s.split(string_to_replace).join(replacement)
                 */
                str = str.split(srcUrl).join(idMap.assets[srcUrl]);
            });
            return str;
        };
        checkObjectFxn(json);
        return json;
    },

    _copyCampaigns: function(accountId, userId, srcAccountId, destAccountId, idMap, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> _copyCampaigns');
        var query = {accountId:srcAccountId};
        idMap.campaigns = idMap.campaigns || {};
        campaignDao.findMany(query, $$.m.Campaign, function(err, campaigns){
            if(err) {
                self.log.error(accountId, userId, 'Error finding campaigns:', err);
                fn(err);
            } else {
                async.each(campaigns, function(campaign, cb){
                    var sourceCampaignId = campaign.id();
                    campaign.set('_id', null);
                    campaign.set('accountId', destAccountId);
                    campaign.set('contacts', []);
                    var statistics = {
                        "emailsBounced" : 0,
                        "emailsSent" : 0,
                        "emailsOpened" : 0,
                        "emailsClicked" : 0,
                        "participants" : 0
                    };
                    campaign.set('statistics', statistics);
                    var emailSettings = campaign.get('emailSettings');
                    if(emailSettings) {
                        var oldEmailId = emailSettings.emailId;
                        emailSettings.fromEmail = '';
                        emailSettings.fromName = '';
                        emailSettings.replyTo = '';
                        emailSettings.emailId = idMap.emails[oldEmailId];
                        campaign.set('emailSettings', emailSettings);
                    }

                    var created = {date:new Date(), by:userId};
                    campaign.set('created', created);
                    campaign.set('modified', created);
                    campaignDao.saveOrUpdate(campaign, function(err, savedCampaign){
                        if(err) {
                            self.log.error(accountId, userId, 'Error saving campaign:', err);
                            cb(err);
                        } else {
                            idMap.campaigns[sourceCampaignId] = savedCampaign.id();
                            cb();
                        }
                    });
                }, function(err){
                    if(err) {
                        self.log.error(accountId, userId, 'Error copying campaigns:', err);
                        fn(err);
                    } else {
                        self.log.debug(accountId, userId, '<< _copyCampaigns');
                        fn(null);
                    }
                });
            }
        });
    },

    _copyAccountSettings: function(accountId, userId, srcAccountId, destAccountId, destAccount, srcAccount, fn){
        var self = this;
        self.log.debug(accountId, userId, '>> _copyAccountSettings');
        var _showHideSettings = srcAccount.get("showhide");
        var _email_preferences = srcAccount.get("email_preferences");
        var _commerceSettings = srcAccount.get("commerceSettings");
        destAccount.set("showhide", _showHideSettings);
        destAccount.set("email_preferences", _email_preferences);
        destAccount.set("commerceSettings", _commerceSettings);
        var modified = {date:new Date(), by:userId};
        destAccount.set('modified', modified);
        accountDao.saveOrUpdate(destAccount, function(err, updatedAccount){
            if(err) {
                self.log.error(accountId, userId, 'Error saving account settings:', err);
                fn(err);
            } else {
                self.log.debug(accountId, userId, '<< _copyAccountSettings');
                fn(null, updatedAccount);
            }
        });
    }
};

module.exports = accountManager;
$$.u = $$.u||{};
$$.u.AccountManger = accountManager;
