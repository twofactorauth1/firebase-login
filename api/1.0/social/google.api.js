/**
 * COPYRIGHT INDIGENOUS.IO, LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

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
        app.get(this.url('accesstoken'), this.isAuthApi, this.getAccessToken.bind(this));

        app.get(this.url('profile'), this.isAuthApi, this.getProfile.bind(this));
        app.get(this.url('contacts'), this.isAuthApi, this.getContacts.bind(this));

        app.get(this.url('contacts/import'), this.isAuthApi, this.importContacts.bind(this));
        app.post(this.url('contacts/import'), this.isAuthApi, this.importContacts.bind(this));
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


    getAccessToken: function(req, resp) {
        var self = this;
        googleDao.checkAccessToken(req.user, function(err, value) {
            if (!err) {
                var googleCreds = req.user.getCredentials($$.constants.user.credential_types.GOOGLE);
                if (googleCreds != null) {
                    resp.send({data:googleCreds.accessToken});
                } else {
                    self.wrapError(resp, 500, "Cannot retrieve access token, Google API access not verified", err, value);
                }
            } else {
                self.wrapError(resp, 500, "Cannot retrieve access token, Google API access not verified", err, value);
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
        googleDao.getContactsForUser(req.user, function(err, value) {
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
                if (err) {
                    self.log.error("Google contacts import failed:", err);
                } else {
                    self.log.info("Google Contacts import succeeded");
                }
            });
            resp.send({data:"Processing Import"});
        } else {
            self.wrapError(resp, 403, "Unauthorized action", "Unauthorized action. Contacts may only be imported at the Account level");
        }
    }
});

module.exports = new api();

