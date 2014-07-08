/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../base.api');
var accountDao = require('../../dao/account.dao');
var cookies = require('../../utils/cookieutil');
var Account = require('../../models/account');

var api = function() {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "account",

    dao: accountDao,

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

        app.get(this.url(':userid/accounts', 'user'), this.isAuthApi, this.getAllAccountsForUserId.bind(this));
    },


    getCurrentAccount: function(req, resp) {
        //TODO - add granular security

        var self = this;

        accountDao.getAccountByHost(req.get("host"), function(err, value) {
            if (!err) {
                if (value == null) {
                    return resp.send({});
                } else {
                    return resp.send(value.toJSON("public"));
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
            this.wrapError(resp, 400, null, "Invalid parameter for ID");
        }

        accountId = parseInt(accountId);
        accountDao.getById(accountId, function(err, value) {
            if (!err && value != null) {
                resp.send(value.toJSON("public"));
            } else {
                self.wrapError(resp, 500, null, err, value);
            }
        });
    },


    getAllAccountsForUserId: function(req,resp) {
        //TODO - add granular security

        var self = this;
        var userId = req.params.userid;

        if (!userId) {
            this.wrapError(resp, 400, null, "Invalid parameter for UserId");
        }

        userId = parseInt(userId);

        accountDao.getAllAccountsForUserId(userId, function(err, value) {
            if (!err) {
                self.sendResult(resp, value);
            } else {
                self.wrapError(resp, 500, null, err, value);
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

        accountDao.getTempAccount(token, function(err, value) {
            if (!err) {
                if (value != null) {
                    resp.send(value.toJSON("public"));
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
        accountDao.saveOrUpdateTmpAccount(account, function(err, value) {
           if (!err && value != null) {
               cookies.setAccountToken(resp, value.get("token"));
               resp.send(value.toJSON("public"));
           } else {
               self.wrapError(resp, 500, null, err, value);
           }
        });
    }
});

module.exports = new api();

