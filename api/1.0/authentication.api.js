var baseApi = require('../base.api');
var authenticationDao = require('../../dao/authentication.dao');


var api = function() {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "authentication",

    dao: authenticationDao,

    initialize: function() {
        //GET
        app.get(this.url('account/:accountId/url'), this.isAuthApi, this.getAuthenticatedUrlForAccount.bind(this));
    },


    getAuthenticatedUrlForAccount: function(req,resp) {
        var self = this;
        var accountId = req.params.accountId;

        accountId = parseInt(accountId);

        if (accountId == null) {
            return this.wrapError(resp, 400, "Invalid parameter", "Invalid parameter provided for accountId");
        }

        if (!this.sm.canReadAccount(req, accountId)) {
            return this.wrapError(resp, 401, "Unauthorized access to this account", "Unauthorized access to account [" + accountId + "]");
        }

        authenticationDao.getAuthenticatedUrlForAccount(accountId, this.userId(req), req.query.path, function(err, value) {
            if (err) {
                return self.wrapError(resp, 500, "An error occurred", err, value);
            }

            resp.send({url:value});
        });
    }
});

module.exports = new api();

