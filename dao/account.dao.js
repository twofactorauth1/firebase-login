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
