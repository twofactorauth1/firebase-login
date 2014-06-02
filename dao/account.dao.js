/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@INDIGENOUS SOFTWARE, INC. for approval or questions.
 */

require('./base.dao');
require('../models/account');
var urlUtils = require('../utils/urlutils');
var appConfig = require('../configs/app.config');

var dao = {

    options: {
        name:"account.dao",
        defaultModel: $$.m.Account
    },


    getAccountByToken: function(token, fn) {
        this.findOne( {'token':token}, fn);
    },


    getAccountBySubdomain: function(subdomain, fn) {
        this.findOne( {'subdomain':subdomain}, fn);
    },


    getAccountByDomain: function(domain, fn) {
        this.findOne( {'domain':domain}, fn);
    },


    getServerUrlByAccount: function(accountId, fn) {
        if (accountId > 0) {
            this.getById(accountId, function(err, value) {
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


    getAllAccountsForUserId: function(userId, fn) {
        var self = this;
        var userDao = require('./user.dao');
        userDao.getById(userId, function(err, value) {
            if (!err) {
                var accounts = value.get("accounts");
                var ids = [];
                accounts.forEach(function(account) {
                   ids.push(account.accountId);
                });

                var query = {_id: {$in: ids }};

                self.findMany(query, fn);
            }
        });
    },


    getAccountByHost: function(host, fn) {
        var parsed = urlUtils.getSubdomainFromHost(host);
        if (parsed.isMainApp) {
            return fn(null, true);
        }

        if (parsed.subdomain != null || parsed.domain != null) {
            var cb = function(err, value) {
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


    createAccount: function(companyType, companySize, fn) {
        if (_.isFunction(companyType)) {
            fn = companyType;
            companyType = null;
            companySize = null;
        } else if(_.isFunction(companySize)) {
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
                type:companyType,
                size:companySize
            }
        });

        return this._createAccount(account, fn);
    },


    _createAccount: function(account, fn) {
        var self = this;
        //Test to see if subdomain is already taken
        var p = $.Deferred();
        var subdomain = account.getOrGenerateSubdomain();
        if (String.isNullOrEmpty(account.get("subdomain")) == false) {
            this.getAccountBySubdomain(account.get("subdomain"), function(err, value) {
                if (!err) {
                    if (value != null) {
                        var subdomain = account.get("subdomain");
                        subdomain = subdomain + "-" + Math.round(Math.random()*1000000);
                        account.set({subdomain:subdomain});
                    }
                } else {
                    p.reject();
                    return fn(err, avlue);
                }
                p.resolve();
            });
        } else {
            p.resolve();
        }

        $.when(p)
            .done(function() {
                self.saveOrUpdate(account, function(err, value) {
                    fn(err, value);
                });
            });
    },


    //region TEMPORARILY STORE ACCOUNT INFO DURING CREATION
    getTempAccount: function(accountToken, fn) {
        var account = $$.g.cache.get(accountToken, "accounts", true, 3600*24, fn);
    },


    saveOrUpdateTmpAccount: function(account, fn) {
        $$.g.cache.set(account.get("token"), account, "accounts", 3600*24);
        fn(null, account);
    },


    convertTempAccount: function(accountToken, fn) {
        var self = this, account;

        if (accountToken != null) {
            account = $$.g.cache.get(accountToken, "accounts");
        }

        if (account != null) {
            return this._createAccount(account, function(err, value) {
                if (!err) {
                    $$.g.cache.remove(accountToken, "accounts");
                }
                fn(err, value);
            });
        } else {
            return this.createAccount(fn);
        }
    }
    //endregion
};

dao = _.extend(dao, $$.dao.BaseDao.prototype, dao.options).init();

$$.dao.AccountDao = dao;

module.exports = dao;
