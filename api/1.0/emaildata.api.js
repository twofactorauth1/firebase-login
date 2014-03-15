var baseApi = require('../base.api');
var emailDataDao = require('../../dao/emaildata.dao');


var api = function() {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "emaildata",

    dao: emailDataDao,

    initialize: function() {
        //GET
        app.get(this.url('contextio/accounts'), this.isAuthApi, this.getContextIOAccounts.bind(this));

        app.post(this.url('contextio/account'), this.isAuthApi, this.createContextIOAccount.bind(this));
        app.post(this.url('contextio/account/mailbox'), this.isAuthApi, this.createContextIOMailbox.bind(this));
    },


    getContextIOAccounts: function(req, resp) {
        emailDataDao.getAccounts(function(err, value) {
            if (err) {
                return self.wrapError(resp, 500, "Error retrieving ContextIO Accounts", err, value);
            }
            return resp.send(value);
        });
    },


    createContextIOAccount: function(req, resp) {
        var body = req.body;
        emailDataDao.createContextIOAccountAndMailboxForUser(req.user, this.accountId(req), body.email, body.username, body.password, body.imapServer, body.port, function(err, value) {
            if (err) {
                return self.wrapError(resp, 500, "Error retrieving ContextIO Accounts", err, value);
            }
            return resp.send(value);
        });
    },


    createContextIOMailbox: function(req, resp) {

    }
});

module.exports = new api();

