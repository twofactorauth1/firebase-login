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


    createAccount: function(name, type, size, subdomain, fn) {
        var account = this._createAccount(name, type, size, subdomain);
        this.saveOrUpdate(account, fn);
    },


    createTempAccount: function(name, type, size, subdomain, fn) {
        var account = this._createAccount(name, type, size, subdomain);

        $$.g.cache.set(token, account, 3600*24, "accounts");
        fn(null, account);
    },


    _createAccount: function(name, type, size, subdomain) {
        if (subdomain == null) {
            subdomain = name.trim().replace(" ", "");
        }

        var token = $$.u.idutils.generateUUID();
        var account = new $$.m.Account({
            subdomain: subdomain,
            token: token,
            company: {
                name:name,
                type: type,
                size: size
            }
        });

        return account;
    },


    //region TEMPORARILY STORE ACCOUNT INFO DURING CREATION
    updateTempAccount: function(account, fn) {
        var account = this._createModel(account);

        $$.g.cache.set(account.get("token"), account, 3600*24, "accounts");
        fn(null, account);
    },


    convertTempAccount: function(accountToken, fn) {
        var account = $$.g.cache.get(accountToken);

        if (account != null) {
            this.saveOrUpdate(account, function(err, value) {
                if (!err) {
                    $$.g.cache.remove(accountToken);
                }
                fn(err, value);
            });
        } else {
            fn(null, null);
        }
    },


    getTempAccount: function(accountToken, fn) {
        var account = $$.g.cache.get(accountToken);
        fn(null, account);
    }
    //endregion
};

dao = _.extend(dao, $$.dao.BaseDao.prototype, dao.options).init();

$$.dao.AccountDao = dao;

module.exports = dao;
