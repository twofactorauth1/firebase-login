var baseApi = require('../../base.api');
var googleDao = require('../../../dao/social/google.dao');


var api = function() {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "social/google",

    dao: googleDao,

    initialize: function() {
        //GET
        app.get(this.url('checkaccess'), this.isAuthApi, this.checkAccess.bind(this));
        app.get(this.url('profile'), this.isAuthApi, this.getProfile.bind(this));
        app.get(this.url('contacts'), this.isAuthApi, this.getContacts.bind(this));

        app.get(this.url('friends/import'), this.isAuthApi, this.importContacts.bind(this));
        app.post(this.url('friends/import'), this.isAuthApi, this.importContacts.bind(this));
    },


    checkAccess: function(req, resp) {
        var self = this;
        googleDao.checkAccessToken(req.user, function(err, value) {
            if (!err) {
                resp.send(value);
            } else {
                self.wrapError(resp, 500, "Google API access not verified", err, value);
            }
        });
    },


    getProfile: function(req, resp) {
        var self = this;
        googleDao.getProfileForUser(req.user, function(err, value) {
            if (!err) {
                resp.send(value);
            } else {
                self.wrapError(resp, 500, "Error retrieving Google profile", err, value);
            }
        });
    },


    getContacts: function(req, resp) {
        var self = this;
        var properties = req.params.properties;
        googleDao.getContactsForUser(req.user, properties, function(err, value) {
            if (!err) {
                resp.send(value);
            } else {
                self.wrapError(resp, 500, "Error retrieving Google contacts", err, value);
            }
        });
    },


    importContacts: function(req, resp) {
        var self = this;
        var accountId = this.accountId(req);

        if (accountId > 0) {
            googleDao.importContactsForUser(accountId, req.user, function(err, value) {
                console.log("Google Contacts import succeeded");
            });
            resp.send("processing");
        } else {
            self.wrapError(resp, 403, "Unauthorized action", "Unauthorized action. Contacts may only be imported at the Account level");
        }
    }
});

module.exports = new api();

