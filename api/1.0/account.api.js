var BaseApi = require('../base.api');
var AccountDao = require('../../dao/account.dao');
var cookies = require('../../utils/cookieutil');
var Account = require('../../models/account');

var api = function() {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, BaseApi.prototype, {

    base: "account",

    dao: AccountDao,

    initialize: function() {
        //TMP Accont
        app.get(this.getUrlRoute('tmp'), this.getTempAccount.bind(this));
        app.post(this.getUrlRoute('tmp'), this.saveOrUpdateTmpAccount.bind(this));
        app.put(this.getUrlRoute('tmp'), this.saveOrUpdateTmpAccount.bind(this));

        //GET
        app.get(this.getUrlRoute(''), this.isAuthApi.bind(this), this.getCurrentAccount.bind(this));
        app.get(this.getUrlRoute(':id'), this.isAuthApi.bind(this), this.getAccountById.bind(this));
        app.post(this.getUrlRoute(''), this.isAuthApi.bind(this), this.createAccount.bind(this));
        app.put(this.getUrlRoute(''), this.isAuthApi.bind(this), this.updateAccount.bind(this));
        app.delete(this.getUrlRoute(':id'), this.isAuthApi.bind(this), this.deleteAccount.bind(this));
    },


    getCurrentAccount: function(req, resp) {
        var self = this;

        var user = req.user;
        var accountId = req.user.get("accountId");
        if (accountId != null) {
            AccountDao.getById(accountId, function(err, value) {
                if (!err) {
                    if (value == null) {
                        return resp.send({});
                    } else {
                        return resp.send(value.toJSON());
                    }
                } else {
                    return self.wrapError(resp, 500, null, err, value);
                }
            });
        } else {
            return resp.send({});
        }
    },


    getAccountById: function(req,resp) {
        var self = this;
        var accountId = req.params.id;

        if (!accountId) {
            this.wrapError(resp, 400, null, "Invalid paramater for ID");
        }

        accountId = parseInt(accountId);
        AccountDao.getById(accountId, function(err, value) {
            if (!err) {
                resp.send(value.toJSON());
            } else {
                self.wrapError(resp, 401, null, err, value);
            }
        });
    },


    createAccount: function(req,resp) {

    },


    updateAccount: function(req,resp) {

    },


    deleteAccount: function(req,resp) {

    },


    getTempAccount: function(req,resp) {
        var self = this;
        var token = cookies.getAccountToken(req);

        AccountDao.getTempAccount(token, function(err, value) {
            if (!err) {
                if (value != null) {
                    resp.send(value.toJSON());
                } else {
                    resp.send({});
                }
            } else {
                resp.wrapError(resp, 500, null, err, value);
            }
        })
    },


    saveOrUpdateTmpAccount: function(req,resp) {
        var self = this;
        var account = new $$.m.Account(req.body);
        AccountDao.saveOrUpdateTmpAccount(account, function(err, value) {
           if (!err) {
               cookies.setAccountToken(resp, value.get("token"));
               resp.send(value.toJSON());
           } else {
               self.wrapError(resp, 500, null, err, value);
           }
        });
    }
});

module.exports = new api();

