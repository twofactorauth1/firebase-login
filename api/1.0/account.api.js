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
        //GET
        app.get(this.getUrlRoute(':id'), this.isAuthApi, this.getAccountById.bind(this));
        app.post(this.getUrlRoute(''), this.isAuthApi, this.createAccount.bind(this));
        app.put(this.getUrlRoute(''), this.isAuthApi, this.updateAccount.bind(this));
        app.delete(this.getUrlRoute(':id'), this.isAuthApi, this.deleteAccount.bind(this));

        app.get(this.getUrlRoute('tmp'), this.getTempAccount.bind(this));
        app.post(this.getUrlRoute('tmp'), this.createTempAccount.bind(this));
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
                resp.send(value);
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
        var token = cookies.getAccountToken(req);

        AccountDao.getTempAccount(token, function(err, value) {
            if (!err) {
                if (value != null) {
                    resp.send(value);
                } else {
                    self.wrapError(resp, 404, null, "Temporary account not found");
                }
            } else {
                resp.wrapError(resp, 500, null, err, value);
            }
        })
    },


    createTempAccount: function(req,resp) {
        AccountDao.createTempAccount(req.body.name, req.body.type, req.body.size, req.body.subdomain, function(err, value) {
           if (!err) {
               cookies.setAccountToken(resp, value.get("token"));
               resp.send(value);
           } else {
               self.wrapError(resp, 500, null, err, value);
           }
        });
    },


    updateTempAccount: function(req, resp) {
        AccountDao.updateTempAccount(req.body, function(err, value) {
            if (!err) {
                cookies.setAccountToken(resp, value.get("token"));
                resp.send(value);
            } else {
                self.wrapError(resp, 500, null, err, value);
            }
        });
    }
});

module.exports = new api();

