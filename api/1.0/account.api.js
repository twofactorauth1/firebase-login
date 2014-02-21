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
        app.get(this.url('tmp'), this.getTempAccount.bind(this));
        app.post(this.url('tmp'), this.saveOrUpdateTmpAccount.bind(this));
        app.put(this.url('tmp'), this.saveOrUpdateTmpAccount.bind(this));

        //GET
        app.get(this.url(''), this.isAuthApi, this.getCurrentAccount.bind(this));
        app.get(this.url(':id'), this.isAuthApi, this.getAccountById.bind(this));
        app.post(this.url(''), this.isAuthApi, this.createAccount.bind(this));
        app.put(this.url(''), this.isAuthApi, this.updateAccount.bind(this));
        app.delete(this.url(':id'), this.isAuthApi, this.deleteAccount.bind(this));
    },


    getCurrentAccount: function(req, resp) {
        //TODO - add granular security

        var self = this;

        AccountDao.getAccountByHost(req.get("host"), function(err, value) {
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
    },


    getAccountById: function(req,resp) {
        //TODO - add granular security

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

