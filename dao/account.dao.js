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

var dao = {

    options: {
        name: "account.dao",
        defaultModel: $$.m.Account
    },

    getAccountByID: function (id, fn) {

        this.findOne({_id: id}, fn);

    },


    getAccountByToken: function (token, fn) {
        this.findOne({'token': token}, fn);
    },


    getAccountsBySubdomain: function (subdomain, accountId, fn) {
        this.findOne({ _id: { $ne: accountId }, 'subdomain': subdomain}, fn);
    },

    getAccountBySubdomain: function (subdomain, fn) {
        this.findOne({'subdomain': subdomain}, fn);
    },


    getAccountByDomain: function (domain, fn) {
        this.findOne({'domain': domain}, fn);
    },


    getServerUrlByAccount: function (accountId, fn) {
        if (accountId > 0) {
            this.getById(accountId, function (err, value) {
                if (err) {
                    return fn(err, value);
                }

                if (value == null) {
                    return fn("No account found", "No account found");
                }

                var url = appConfig.getServerUrl(value.get("subdomain"), value.get("domain"));

                fn(null, url);
            });
        } else {
            fn(null, appConfig.getServerUrl(null, null));
        }
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

                var query = {_id: {$in: ids }};

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

        if (parsed.subdomain != null || parsed.domain != null) {
            var cb = function (err, value) {
                if (err) {
                    return fn(err, value);
                } else {
                    return fn(null, value);
                }
            };

            if (parsed.subdomain != null) {
                this.getAccountBySubdomain(parsed.subdomain, cb);
            } else if (parsed.domain != null) {
                this.getAccountByDomain(parsed.domain, cb);
            }
        }
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
            this.getAccountBySubdomain(account.get("subdomain"), function (err, value) {
                if (!err) {
                    if (value != null) {
                        var subdomain = account.get("subdomain");
                        subdomain = subdomain + "-" + Math.round(Math.random() * 1000000);
                        account.set({subdomain: subdomain});
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
        var self = this, account;

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

    getPreviewData: function(idAry, fn) {
        var self = this;
        var data = [];
        async.each(idAry, function(_id, callback){
            self.getById(_id, function(err, val){
                if(err) {
                    callback(err);
                } else {
                    var obj = {};
                    obj.id = _id;
                    obj.subdomain = val.get('subdomain');
                    obj.domain = val.get('domain');
                    obj.logo = val.get('business').logo;
                    data.push(obj);
                    callback();
                }
            });
        }, function(err){
            fn(null, data);
        });
    },

    deleteAccountAndArtifacts: function(accountId, fn) {
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



        //find users by accountId.  If user has other accounts, remove this one.  Otherwise, delete user courses and then user.
        $$.dao.UserDao.getUsersForAccount(accountId, function(err, list){
            if(err) {
                self.log.error('Error getting users for account: ' + err);
            } else {
                _.each(list, function(user, index, list){
                    if(user.get('accounts').length > 1) {
                        user = user.removeAccount(accountId);
                        $$.dao.UserDao.saveOrUpdate(user, function(err, value){
                            if(err) {
                                self.log.error('Error removing account from user: ' + err);
                            } else {
                                self.log.debug('Removed account ' + accountId + ' from user ' + user.id());
                            }
                        });
                    } else {
                        $$.dao.CourseDao.deleteCourseByUser(user.id(), function(err, value){
                            if(err) {
                                self.log.error('Error removing courses for user: ' + err);
                            } else {
                                self.log.debug('Removed courses for user ' + user.id());
                                var customerId = user.get('stripeId');
                                if(customerId && customerId.length > 0) {
                                    $$.dao.StripeDao.deleteStripeCustomer(customerId, null, user.id(), function(err, value){
                                        if(err) {
                                            self.log.error('error deleting Stripe customer: ' + err);
                                        } else {
                                            self.log.debug('Deleted Stripe Customer');
                                        }
                                    });
                                }
                                $$.dao.UserDao.remove(user, function(err, value){
                                    if(err) {
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
        var query = {'accountId': accountId};
        self.removeByQuery(query, $$.m.cms.Website, function(err,val){self.log.debug('removed websites');});
        self.removeByQuery(query, $$.m.cms.Page, function(err,val){self.log.debug('removed pages');});
        self.removeByQuery(query, $$.m.cms.Post, function(err,val){self.log.debug('removed posts');});
        self.removeByQuery(query, $$.m.Contact, function(err,val){self.log.debug('removed contacts');});
        self.removeByQuery(query, $$.m.ContactActivity, function(err,val){self.log.debug('removed contact activities');});
        self.removeByQuery(query, $$.m.Asset, function(err,val){self.log.debug('removed digital asset records');});
        self.removeByQuery(query, $$.m.Course, function(err,val){self.log.debug('removed course records');});

        self.removeById(accountId, $$.m.Account, function(err, val){
            if(err) {
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

    updateAccountBilling: function(accountId, customerId, subscriptionId, fn) {
        var self = this;
        self.log.debug('>> updateAccountBilling');
        self.getById(accountId, $$.m.Account, function(err, account){
            if(err) {
                self.log.error('Error getting account for id [' + accountId + ']: ' + err);
                return fn(err, null);
            }
            var billing = account.get('billing');
            billing.subscriptionId=subscriptionId;
            billing.stripeCustomerId=customerId;

            account.set('billing', billing);
            self.saveOrUpdate(account, function(err, savedAccount){
                if(err) {
                    self.log.error('Error updating account for id [' + accountId + ']: ' + err);
                    return fn(err, null);
                } else {
                    self.log.debug('<< updateAccountBilling');
                    return fn(null, savedAccount);
                }
            });
        });
    },

    addSubscriptionToAccount: function(accountId, subscriptionId, fn) {
        var self = this;
        self.log.debug('>> addSubscriptionToAccount');
        self.getById(accountId, $$.m.Account, function(err, account){
            if(err) {
                self.log.error('Error getting account for id [' + accountId + ']: ' + err);
                return fn(err, null);
            }
            var billing = account.get('billing');
            billing.subscriptionId=subscriptionId;
            account.set('billing', billing);
            self.saveOrUpdate(account, function(err, savedAccount){
                if(err) {
                    self.log.error('Error updating account for id [' + accountId + ']: ' + err);
                    return fn(err, null);
                } else {
                    self.log.debug('<< addSubscriptionToAccount');
                    return fn(null, savedAccount);
                }
            });
        });
    },

    addStripeTokensToAccount: function(accountId, accessToken, refreshToken, fn) {
        var self=this;
        self.log.debug('>> addStripeTokensToAccount(' + accountId + ',' + accessToken + ',' + refreshToken +')');

        self.getById(accountId, $$.m.Account, function(err, account){
            if(err) {
                self.log.error('Error getting account: ' + err);
                return fn(err, null);
            } else if(account === null) {
                self.log.error('Error getting account for id: ' + accountId);
                return fn('No account found', null);
            }
            var billing = account.get('billing');
            billing.accessToken = accessToken;
            billing.refreshToken = refreshToken;
            account.set('billing', billing);
            self.saveOrUpdate(account, function(err, updatedAccount){
                if(err) {
                    self.log.error('Error updating account: ' + err);
                    return fn(err, null);
                } else {
                    self.log.debug('<< addStripeTokensToAccount');
                    return fn(null, updatedAccount);
                }

            });
        });

    }
};

dao = _.extend(dao, $$.dao.BaseDao.prototype, dao.options).init();

$$.dao.AccountDao = dao;

module.exports = dao;
