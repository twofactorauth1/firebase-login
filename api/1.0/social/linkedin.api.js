/**
 * COPYRIGHT CMConsulting LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact christopher.mina@gmail.com for approval or questions.
 */

var baseApi = require('../../base.api');
var linkedInDao = require('../../../dao/social/linkedin.dao');


var api = function() {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "social/linkedin",

    dao: linkedInDao,

    initialize: function() {
        //GET
        app.get(this.url('checkaccess'), this.isAuthApi, this.checkAccess.bind(this));
        app.get(this.url('profile'), this.isAuthApi, this.getLinkedInProfile.bind(this));
        app.get(this.url('connections'), this.isAuthApi, this.getLinkedInConnections.bind(this));

        app.get(this.url('connections/import'), this.isAuthApi, this.importLinkedInConnections.bind(this));
        app.post(this.url('connections/import'), this.isAuthApi, this.importLinkedInConnections.bind(this));
    },


    checkAccess: function(req, resp) {
        var self = this;
        linkedInDao.checkAccessToken(req.user, function(err, value) {
            if (!err) {
                resp.send(value);
            } else {
                self.wrapError(resp, 500, "LinkedIn API access not verified", err, value);
            }
        });
    },


    getLinkedInProfile: function(req, resp) {
        var self = this;
        linkedInDao.getProfileForUser(req.user, function(err, value) {
            if (!err) {
                resp.send(value);
            } else {
                self.wrapError(resp, 500, "Error retrieving LinkedIn profile", err, value);
            }
        });
    },


    getLinkedInConnections: function(req, resp) {
        var self = this;
        linkedInDao.getConnectionsForUser(req.user, function(err, value) {
            if (!err) {
                resp.send(value);
            } else {
                self.wrapError(resp, 500, "Error retrieving LinkedIn connections", err, value);
            }
        });
    },


    importLinkedInConnections: function(req, resp) {
        var self = this;
        var accountId = this.accountId(req);

        if (accountId > 0) {
            linkedInDao.importConnectionsAsContactsForUser(accountId, req.user, function(err, value) {
                console.log("LinkedIn import succeeded");
            });
            resp.send({data:"Processing Import"});
        } else {
            self.wrapError(resp, 500, "Unauthorized action", "Unauthorized action. Contacts may only be imported at the Account level");
        }
    }
});

module.exports = new api();

