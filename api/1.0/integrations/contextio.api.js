var baseApi = require('../../base.api');
var emailDataDao = require('../../../dao/emaildata.dao');
var contextioDao = require('../../../dao/integrations/contextio.dao');

var api = function() {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "integrations/contextio",

    dao: contextioDao,

    initialize: function() {
        //GET
        app.get(this.url('accounts'), this.isAuthApi, this.getContextIOAccount.bind(this));

        //Create / Update
        app.post(this.url('account'), this.isAuthApi, this.createContextIOAccount.bind(this));
    },


    getContextIOAccount: function(req, resp) {
        //Todo, implement security
        var accountId = this.accountId(req);
        if (accountId == null) {
            return this.wrapError(resp, 403, "Cannot retrieve ContextIO information", "An account id must be specific to return this information");
        }

        contextioDao.getContextIOAccountForUserAndAccount(req.user, accountId, function(err, value) {
            if (err) {
                return self.wrapError(resp, 500, "Error retrieving ContextIO Accounts", err, value);
            } else {
                if (value == null) {
                    resp.send({});
                } else {
                    resp.send(value);
                }
            }
        });
    },


    createContextIOAccount: function(req, resp) {
        //Todo, implement security
        var accountId = this.accountId(req);
        if (accountId == null) {
            return this.wrapError(resp, 403, "Cannot retrieve ContextIO information", "An account id must be specific to return this information");
        }

        var body = req.body;
        contextioDao.createContextIOAccountAndMailboxForUser(req.user, accountId, body.email, body.username, body.password, body.imapServer, body.port, function(err, value) {
            if (err) {
                return self.wrapError(resp, 500, "Error retrieving ContextIO Accounts", err, value);
            }
            return resp.send(value);
        });
    }
});

module.exports = new api();

