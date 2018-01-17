/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('./base.dao');
require('../models/account');
var urlUtils = require('../utils/urlutils');
var appConfig = require('../configs/app.config');
var async = require('async');
var orgDao = require('../organizations/dao/organization.dao');

var dao = {

    options: {
        name: "account.dao",
        defaultModel: $$.m.Account
    },

    getAccountByID: function (id, fn) {

        this.findOne({
            _id: id
        }, fn);

    },

    getAccountByIdAndOrg: function(id, orgId, fn) {
        this.findOne({_id:id, orgId:orgId}, fn);
    },


    getAccountByToken: function (token, fn) {
        this.findOne({
            'token': token
        }, fn);
    },


    /**
     * @deprecated
     * @param subdomain
     * @param accountId
     * @param fn
     */
    getAccountsBySubdomain: function (subdomain, accountId, fn) {
        this.findOne({
            _id: {
                $ne: accountId
            },
            'subdomain': subdomain
        }, fn);
    },

    /**
     * @deprecated
     * @param subdomain
     * @param fn
     */
    getAccountBySubdomain: function (subdomain, fn) {
        this.findOne({
            'subdomain': subdomain
        }, fn);
    },


    _getAccountBySubdomainAndOrgId: function(subdomain, orgId, fn) {
        orgId = orgId || 0;
        this.findOne({orgId:orgId, subdomain:subdomain}, $$.m.Account, fn);
    },


    __getAccountByDomain: function (domain, fn) {
        this.findOne({$or: [
            {domain: domain},
            {customDomain: domain}
        ]}, fn);
    },

    /*
     * We do not use the 'domain' property currently.
     */
    getAccountByDomain: function (domain, fn) {
        this.findOne({customDomain: domain}, fn);
    },


    getServerUrlByAccount: function (accountId, fn) {
        var self = this;

        if (accountId > 0) {
            this.getById(accountId, function (err, value) {
                if (err) {
                    return fn(err, value);
                }

                if (value == null) {
                    return fn("No account found", "No account found");
                }
                if(value.get('orgId') && value.get('orgId') > 0) {
                    self.getServerUrlByAccountAndOrg(accountId, value.get('orgId'), fn);
                } else {
                    var url = appConfig.getServerUrl(value.get("subdomain"), value.get("domain"));
                    fn(null, url);
                }

            });
        } else {
            fn(null, appConfig.getServerUrl(null, null));
        }
    },

    getServerUrlByAccountAndOrg: function(accountId, orgId, fn) {
        var self = this;

        if (orgId > 0) {
            orgDao.getById(orgId, $$.m.Organization, function(err, organization){
                if(err) {
                    return fn(err);
                } else if (!organization) {
                    return fn('No organization found');
                } else {
                    self.getById(accountId, $$.m.Account, function(err, account){
                        if(err) {
                            return fn(err);
                        } else if (!account) {
                            return fn("No account found", "No account found");
                        } else {
                            var orgSuffix = organization.get('signupSettings').suffix;
                            var subdomain = account.get('subdomain');
                            var url = appConfig.getOrganizationUrl(subdomain, orgSuffix);
                            return fn(null, url);
                        }
                    });
                }
            });
        } else {
            this.getServerUrlByAccount(accountId, fn);
        }
    },

    getServerDomainByAccount: function(accountId, fn) {
        var self = this;
        self.getById(accountId, function(err, value){
            if(err || !value) {
                return fn(err, value);
            }
            var url = appConfig.getServerDomain(value.get('subdomain'), value.get('customDomain'));
            fn(null, url);
        });
    },


    getAllAccountsForUserId: function (userId, fn) {
        var self = this;
        var userDao = require('./user.dao');
        userDao.getById(userId, function (err, value) {
            if (!err) {
                var accounts = value.get("accounts");
                var ids = [];
                accounts.forEach(function (account) {
                    ids.push(account.accountId);
                });

                var query = {
                    _id: {
                        $in: ids
                    }
                };

                self.findMany(query, fn);
            }
        });
    },

    getFirstAccountForUserId: function (userId, fn) {
        var self = this;
        var userDao = require('./user.dao');
        userDao.getById(userId, function (err, value) {
            if (!err && value) {
                var accounts = value.get("accounts");
                var firstAccountId = accounts[0].accountId;

                self.getById(firstAccountId, fn);
            } else {
                fn(err, null)
            }
        });
    },


    getAccountByHost: function (host, fn) {
        var parsed = urlUtils.getSubdomainFromHost(host);
        if (parsed.isMainApp) {
            return this.getAccountByID(appConfig.mainAccountID, fn);
            //return fn(null, true);
        }
        if(parsed.isOrgRoot) {
            return this.getAccountBySubdomainAndOrg(parsed.subdomain, parsed.orgDomain, fn);
        }
        if (parsed.subdomain != null || parsed.domain != null) {

            if (parsed.subdomain !== null && parsed.subdomain !== "") {
                //return this.getAccountBySubdomain(parsed.subdomain, cb);
                return this.getAccountBySubdomainAndOrg(parsed.subdomain, parsed.orgDomain, fn);
            } else if (parsed.domain != null) {
                return this.getAccountByDomain(parsed.domain, fn);
            }
        }
    },

    getAccountBySubdomainAndOrg: function(subdomain, domain, fn) {
        var self = this;
        self.log.debug('>> getAccountBySubdomainAndOrg(' + subdomain + ', ' + domain + ', fn)');
        orgDao.getByOrgDomain(domain, function(err, organization){
            if(err) {
                fn(err);
            } else if(!organization){
                fn('No organization found');
            } else {
                if(subdomain) {
                    self.findOne({orgId:organization.id(), subdomain:subdomain}, $$.m.Account, fn);
                } else {
                    self.findOne({_id:organization.get('adminAccount')}, $$.m.Account, fn);
                }
            }
        });
    },

    getAccountByBillingCustomerId: function (customerId, fn) {
        var self = this;
        var query = {
            'billing.stripeCustomerId': customerId
        };

        return self.findOne(query, $$.m.Account, fn);
    },


    createAccount: function (companyType, companySize, fn) {
        if (_.isFunction(companyType)) {
            fn = companyType;
            companyType = null;
            companySize = null;
        } else if (_.isFunction(companySize)) {
            fn = companySize;
            companySize = null;
        }

        if (companyType === null) {
            companyType = $$.constants.account.company_types.PROFESSIONAL;
        }
        if (companySize === null) {
            companySize = $$.constants.account.company_size.SMALL;
        }

        var account = new $$.m.Account({
            company: {
                type: companyType,
                size: companySize
            }
        });

        return this._createAccount(account, fn);
    },


    _createAccount: function (account, fn) {
        var self = this;
        //Test to see if subdomain is already taken
        var p = $.Deferred();
        var subdomain = account.getOrGenerateSubdomain();
        if (String.isNullOrEmpty(account.get("subdomain")) == false) {
            this._getAccountBySubdomainAndOrgId(account.get('subdomain'), account.get('orgId'), function(err, value){
                if (!err) {
                    if (value != null) {
                        var subdomain = account.get("subdomain");
                        subdomain = subdomain + "-" + Math.round(Math.random() * 1000000);
                        account.set({
                            subdomain: subdomain
                        });
                    }
                } else {
                    p.reject();
                    return fn(err, value);
                }
                p.resolve();
            });
        } else {
            p.resolve();
        }

        $.when(p)
            .done(function () {
                self.saveOrUpdate(account, function (err, value) {
                    fn(err, value);
                });
            });
    },


    //region TEMPORARILY STORE ACCOUNT INFO DURING CREATION
    getTempAccount: function (accountToken, fn) {
        var account = $$.g.cache.get(accountToken, "accounts", true, 3600 * 24, fn);
    },


    saveOrUpdateTmpAccount: function (account, fn) {
        $$.g.cache.set(account.get("token"), account, "accounts", 3600 * 24);
        fn(null, account);
    },


    convertTempAccount: function (accountToken, fn) {
        var self = this,
            account;

        if (accountToken != null) {
            account = $$.g.cache.get(accountToken, "accounts");
        }

        if (account != null) {
            return this._createAccount(account, function (err, value) {
                if (!err) {
                    $$.g.cache.remove(accountToken, "accounts");
                }
                fn(err, value);
            });
        } else {
            return this.createAccount(fn);
        }
    },

    getPreviewData: function (idAry, fn) {
        var self = this;
        var data = [];
        idAry = _.uniq(idAry);
        async.each(idAry, function (_id, callback) {
            self.getById(_id, function (err, val) {
                if (err) {
                    callback(err);
                } else {
                    var obj = {};
                    if (val) {
                        obj.id = _id;
                        obj.subdomain = val.get('subdomain');
                        obj.domain = val.get('domain');
                        obj.logo = val.get('business').logo;
                        if(val.get('orgId') && val.get('orgId') > 0) {
                            //skipping
                        } else {
                            data.push(obj);
                        }
                    }
                    callback();
                }
            });
        }, function (err) {
            fn(null, data);
        });
    },

    getPreviewDataForOrg: function(idAry, orgDomain, fn) {
        var self = this;
        var data = [];
        orgDao.getByOrgDomain(orgDomain, function(err, organization){
            if(err || !organization) {
                fn(err || 'No organization found');
            } else {
                idAry = _.uniq(idAry);
                var orgId = organization.id();
                async.each(idAry, function(id, callback){
                    var query = {_id:id, orgId:orgId};
                    self.findOne(query, $$.m.Account, function(err, val){
                        if(err) {
                            callback(err);
                        } else {
                            var obj = {};
                            if (val) {
                                obj.id = id;
                                obj.subdomain = val.get('subdomain');
                                obj.domain = val.get('domain');
                                obj.logo = val.get('business').logo;
                                obj.orgId = val.get('orgId');
                                data.push(obj);
                            }

                            callback();
                        }
                    });
                }, function(err){
                    fn(null, data);
                });
            }
        });

    },

    deleteAccountAndArtifacts: function (accountId, fn) {
        var self = this;
        self.log.debug('>> deleteAccountAndArtifacts');
        //delete account
        //delete websites by accountId
        //delete pages by accountId
        //delete users by accountId
        //delete posts by accountId
        //delete courses by userId
        //delete contacts by accountId
        //delete contactactivities by accountId
        //delete assets by accountId

        //delete emails
        //delete campaigns


        //find users by accountId.  If user has other accounts, remove this one.  Otherwise, delete user courses and then user.
        $$.dao.UserDao.getUsersForAccount(accountId, function (err, list) {
            if (err) {
                self.log.error('Error getting users for account: ' + err);
            } else {
                _.each(list, function (user, index, list) {
                    if (user.get('accounts').length > 1) {
                        user = user.removeAccount(accountId);
                        $$.dao.UserDao.saveOrUpdate(user, function (err, value) {
                            if (err) {
                                self.log.error('Error removing account from user: ' + err);
                            } else {
                                self.log.debug('Removed account ' + accountId + ' from user ' + user.id());
                            }
                        });
                    } else {
                        $$.dao.CourseDao.deleteCourseByUser(user.id(), function (err, value) {
                            if (err) {
                                self.log.error('Error removing courses for user: ' + err);
                            } else {
                                self.log.debug('Removed courses for user ' + user.id());
                                /*
                                var customerId = user.get('stripeId');
                                if (customerId && customerId.length > 0) {
                                    self.getStripeTokensFromAccount(accountId, function(err, creds){
                                        var accessToken = null;
                                        if(creds) {
                                            accessToken = creds.accessToken;
                                        }
                                        $$.dao.StripeDao.deleteStripeCustomer(customerId, null, user.id(), accessToken, function (err, value) {
                                            if (err) {
                                                self.log.error('error deleting Stripe customer: ' + err);
                                            } else {
                                                self.log.debug('Deleted Stripe Customer');
                                            }
                                        });
                                    });
                                }
                                */
                                $$.dao.UserDao.remove(user, function (err, value) {
                                    if (err) {
                                        self.log.error('Error deleting user: ' + err);
                                    } else {
                                        self.log.debug('Removed user: ' + user.id());
                                    }
                                });

                            }
                        });
                    }
                });
            }
        });


        //delete the account stuff here (websites, pages, posts, contacts, contactactivites, assets)
        var query = {
            'accountId': accountId
        };
        self.removeByQuery(query, $$.m.cms.Website, function (err, val) {
            self.log.debug('removed websites');
        });
        self.removeByQuery(query, $$.m.cms.Page, function (err, val) {
            self.log.debug('removed pages');
        });
        self.removeByQuery(query, $$.m.cms.Post, function (err, val) {
            self.log.debug('removed posts');
        });
        self.removeByQuery(query, $$.m.Contact, function (err, val) {
            self.log.debug('removed contacts');
        });
        self.removeByQuery(query, $$.m.ContactActivity, function (err, val) {
            self.log.debug('removed contact activities');
        });
        self.removeByQuery(query, $$.m.Asset, function (err, val) {
            self.log.debug('removed digital asset records');
        });
        self.removeByQuery(query, $$.m.Course, function (err, val) {
            self.log.debug('removed course records');
        });

        self.removeById(accountId, $$.m.Account, function (err, val) {
            if (err) {
                self.log.error('Error removing account: ' + err);
                fn(err, null);
            } else {
                self.log.debug('Removed account.');
                self.log.debug('<< deleteAccountAndArtifacts');
                fn(null, 'success');
            }
        });

    },
    //endregion

    updateAccountBilling: function (accountId, customerId, subscriptionId, fn) {
        var self = this;
        self.log.debug('>> updateAccountBilling');
        self.getById(accountId, $$.m.Account, function (err, account) {
            if (err) {
                self.log.error('Error getting account for id [' + accountId + ']: ' + err);
                return fn(err, null);
            }
            var billing = account.get('billing');
            billing.subscriptionId = subscriptionId;
            billing.stripeCustomerId = customerId;

            account.set('billing', billing);
            self.saveOrUpdate(account, function (err, savedAccount) {
                if (err) {
                    self.log.error('Error updating account for id [' + accountId + ']: ' + err);
                    return fn(err, null);
                } else {
                    self.log.debug('<< updateAccountBilling');
                    return fn(null, savedAccount);
                }
            });
        });
    },

    addSubscriptionToAccount: function (accountId, subscriptionId, fn) {
        var self = this;
        self.log.debug('>> addSubscriptionToAccount');
        self.getById(accountId, $$.m.Account, function (err, account) {
            if (err) {
                self.log.error('Error getting account for id [' + accountId + ']: ' + err);
                return fn(err, null);
            }
            var billing = account.get('billing');
            billing.subscriptionId = subscriptionId;
            account.set('billing', billing);
            self.saveOrUpdate(account, function (err, savedAccount) {
                if (err) {
                    self.log.error('Error updating account for id [' + accountId + ']: ' + err);
                    return fn(err, null);
                } else {
                    self.log.debug('<< addSubscriptionToAccount');
                    return fn(null, savedAccount);
                }
            });
        });
    },

    addSubscriptionAndPlanToAccount: function(accountId, subscriptionId, planId, userId, fn ) {
        var self = this;
        self.log.debug(accountId, userId, '>> addSubscriptionAndPlanToAccount');
        self.getById(accountId, $$.m.Account, function (err, account) {
            if (err) {
                self.log.error('Error getting account for id [' + accountId + ']: ' + err);
                return fn(err, null);
            }
            var billing = account.get('billing');
            billing.subscriptionId = subscriptionId;
            billing.plan = planId;
            account.set('billing', billing);
            account.set('modified', {date: new Date, by:userId});
            self.saveOrUpdate(account, function (err, savedAccount) {
                if (err) {
                    self.log.error('Error updating account for id [' + accountId + ']: ' + err);
                    return fn(err, null);
                } else {
                    self.log.debug('<< addSubscriptionAndPlanToAccount');
                    return fn(null, savedAccount);
                }
            });
        });
    },

    addSubscriptionLockToAccount: function (accountId, fn) {
        var self = this;
        self.log.debug('>> addSubscriptionLockToAccount');
        self.getById(accountId, $$.m.Account, function (err, account) {
            if (err || account === null) {
                self.log.error('Error getting account for id [' + accountId + ']: ' + err);
                return fn(err, null);
            }
            account.set('locked_sub', true);
            self.saveOrUpdate(account, function (err, savedAccount) {
                if (err) {
                    self.log.error('Error updating account for id [' + accountId + ']: ' + err);
                    return fn(err, null);
                } else {
                    self.log.debug('<< addSubscriptionLockToAccount');
                    return fn(null, savedAccount);
                }
            });
        });
    },

    removeSubscriptionLockFromAccount: function (accountId, fn) {
        var self = this;
        self.log.debug('>> removeSubscriptionLockToAccount');
        self.getById(accountId, $$.m.Account, function (err, account) {
            if (err) {
                self.log.error('Error getting account for id [' + accountId + ']: ' + err);
                return fn(err, null);
            }
            account.set('locked_sub', false);

            self.saveOrUpdate(account, function (err, savedAccount) {
                if (err) {
                    self.log.error('Error updating account for id [' + accountId + ']: ' + err);
                    return fn(err, null);
                } else {
                    self.log.debug('<< removeSubscriptionLockToAccount');
                    return fn(null, savedAccount);
                }
            });
        });
    },

    addStripeTokensToAccount: function (accountId, accessToken, refreshToken, businessName, businessLogo, fn) {
        var self = this;
        self.log.debug('>> addStripeTokensToAccount(' + accountId + ',' + accessToken + ',' + refreshToken + ')');

        self.getById(accountId, $$.m.Account, function (err, account) {
            if (err) {
                self.log.error('Error getting account: ' + err);
                return fn(err, null);
            } else if (account === null) {
                self.log.error('Error getting account for id: ' + accountId);
                return fn('No account found', null);
            }
            var credentials = account.get('credentials');
            var foundStripe = false;
            credentials.forEach(function (value, index) {
                if (value.type == 'stripe') {
                    credentials[index].accessToken = accessToken;
                    credentials[index].refreshToken = refreshToken;
                    foundStripe = true;
                }
            });

            if (foundStripe == false) {
                credentials.push({type: 'stripe', accessToken: accessToken, refreshToken: refreshToken, username: businessName, image: businessLogo, expires: null});
            }
            account.set('credentials', credentials);
            self.saveOrUpdate(account, function (err, updatedAccount) {
                if (err) {
                    self.log.error('Error updating account: ' + err);
                    return fn(err, null);
                } else {
                    self.log.debug('<< addStripeTokensToAccount');
                    return fn(null, updatedAccount);
                }

            });
        });

    },

    getStripeTokensFromAccount: function (accountId, fn) {
        var self = this;
        self.getById(accountId, $$.m.Account, function (err, account) {
            if (err) {
                self.log.error('Error getting account: ' + err);
                return fn(err, null);
            } else if (account === null) {
                self.log.error('Error getting account for id: ' + accountId);
                return fn('No account found', null);
            } else {
                var credentials = account.get('credentials');
                var stripeCred = null;
                _.each(credentials, function (cred) {
                    if (cred.type === 'stripe') {
                        stripeCred = cred;
                    }

                });
                return fn(null, stripeCred);
            }
        });

    },

    updateAccount: function (modifiedAccount, userId, fn) {
        var self = this;
        self.log.debug('>> updateAccount');

        self.getById(modifiedAccount.id(), $$.m.Account, function (err, account) {
            if (err) {
                self.log.error('Error fetching account: ' + err);
                return fn(err, null);
            } else {
                //validation
                async.waterfall([
                    function validateSubdomain(callback) {
                        if (account.get('subdomain') !== modifiedAccount.get('subdomain')) {
                            self._getAccountBySubdomainAndOrgId(modifiedAccount.get('subdomain'), modifiedAccount.get('orgId'), function(err, value){
                                if (err) {
                                    self.log.error('Error verifying subdomain: ' + err);
                                    return fn(err, null);
                                } else if (value === null) {
                                    //cool
                                    callback(null);
                                } else {
                                    self.log.debug('subdomain exists');
                                    return fn('Subdomain [' + modifiedAccount.get('subdomain') + '] already exists');
                                }
                            });

                        } else {
                            callback(null);
                        }
                    },
                    /*
                     * Add any other validation steps here.
                     */
                    function doUpdate(callback) {
                        self.log.debug('updating account');
                        modifiedAccount.set('created', account.get('created'));
                        var modifiedObject = {
                            date: new Date(),
                            by: userId
                        };
                        modifiedAccount.set('modified', modifiedObject);
                        self.log.debug('<< updateAccount');
                        self.saveOrUpdate(modifiedAccount, fn);
                    }
                ], function (err) {
                    if (err) {
                        return fn(err);
                    } else {
                        self.log.warn('Unexpected method call');
                        return;
                    }
                });

            }
        });
    },

    listAccountTemplates: function(accountId, userId, fn){
        var self = this;

        this.getAccountByID(accountId, function(err, account){
            if(err) {
                self.log.error('Exception retrieving current account: ' + err);
            } else {
                var orgId = 0;
                if(account && account.get('orgId')) {
                    orgId = account.get('orgId');
                }
                var query = {
                    isTemplateAccount: true,
                    orgId: orgId,
                    _id: {$ne: accountId}
                };
                self.findMany(query, fn);
            }
        });
    },

    getAccountsByOrg: function(orgId, fn) {
        var self = this;
        var query = {orgId:orgId};
        self.findMany(query, fn);
    }
};

dao = _.extend(dao, $$.dao.BaseDao.prototype, dao.options).init();

$$.dao.AccountDao = dao;

module.exports = dao;
