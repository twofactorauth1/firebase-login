var baseDao = require('./base.dao');
require('../models/account');

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


    getAccountByHost: function(host, fn) {
        var self = this
            , defaultHost = process.env.ROOT_HOST || "indigenous"
            , hosts
            , subdomain
            , domain;

        //If we're length one and hosts[0] == defaultHost, then it's ok
        //If we're length two and hosts[0] == www and hosts[1] == defaultHost, then its ok
        //If we're length two and hosts[1] == defaultHost, we need to check account.subdomain
        //If we're length one, we need to check hosts[0] against our account.domain
        //if we're length two+ and hosts[0] == www, we need to check hosts[1+] against our account.domain

        host = host.replace("www", "");
        var portIndex = host.indexOf(":");
        if (portIndex > -1) {
            host = host.substr(0, portIndex);
        }

        hosts = host.split(".");

        if (hosts[0] == "localhost") {
            return fn(null, true);
        }
        if (hosts.length == 1 && hosts[0] == defaultHost) {
            return fn(null, true);
        } else if(hosts.length == 2 && hosts[0] == defaultHost) {
            return fn(null, true);
        } else if(hosts.join(".") == defaultHost) {
            return fn(null, true);
        } else if((hosts.length == 2 || hosts.length == 3) && hosts[1] == defaultHost) {
            subdomain = hosts[0]; //custom subdomain
        } else {
            domain = hosts.join("."); //custom domain
        }

        if (subdomain != null || domain != null) {
            var cb = function(err, value) {
                if (err) {
                    return fn(err, value);
                } else {
                    return fn(null, value);
                }
            };

            if (subdomain != null) {
                this.getAccountBySubdomain(subdomain, cb);
            } else if (domain != null) {
                this.getAccountByDomain(domain, cb);
            }
        }
    },


    //region TEMPORARILY STORE ACCOUNT INFO DURING CREATION
    getTempAccount: function(accountToken, fn) {
        var account = $$.g.cache.get(accountToken, true, 3600*24, "accounts");
        fn(null, account);
    },


    saveOrUpdateTmpAccount: function(account, fn) {
        $$.g.cache.set(account.get("token"), account, 3600*24, "accounts");
        fn(null, account);
    },


    convertTempAccount: function(accountToken, fn) {
        var account = $$.g.cache.get(accountToken, "accounts");

        if (account != null) {
            this.saveOrUpdate(account, function(err, value) {
                if (!err) {
                    $$.g.cache.remove(accountToken, "accounts");
                }
                fn(err, value);
            });
        } else {
            fn(null, null);
        }
    }
    //endregion
};

dao = _.extend(dao, $$.dao.BaseDao.prototype, dao.options).init();

$$.dao.AccountDao = dao;

module.exports = dao;
