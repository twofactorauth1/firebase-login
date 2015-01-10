/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
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
        app.get(this.url('checkaccess'), this.isAuthApi.bind(this), this.checkAccess.bind(this));
        app.get(this.url('hasaccess'), this.isAuthApi.bind(this), this.hasAccess.bind(this));
        app.get(this.url('accesstoken'), this.isAuthApi.bind(this), this.getAccessToken.bind(this));

        app.get(this.url('profile'), this.isAuthApi.bind(this), this.getProfile.bind(this));
        app.get(this.url('contacts'), this.isAuthApi.bind(this), this.getContacts.bind(this));

        app.get(this.url('contacts/groups'), this.isAuthApi.bind(this), this.getContactGroups.bind(this));
        app.get(this.url('contacts/import'), this.isAuthApi.bind(this), this.importContacts.bind(this));
        app.post(this.url('contacts/import'), this.isAuthApi.bind(this), this.importContacts.bind(this));
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

    hasAccess: function(req, res) {
        var self = this;
        googleDao.checkAccessToken(req.user, function(err, value) {
            if(!err) {
                res.send(value);
            } else {
                res.send('false');
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
                    self.log.debug('>> 500 1');
                    self.wrapError(resp, 500, "Cannot retrieve access token, Google API access not verified", err, value);
                }
            } else {
                //TODO Find a better way to send error
                resp.send('error');
                //self.wrapError(resp, 500, "Cannot retrieve access token, Google API access not verified", err, value);
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
        var groupIdAry = (req.query['groupIDs'] || '').split(',');

        var user = req.user;
        if(user.getCredentials($$.constants.user.credential_types.GOOGLE) === null) {
            self.wrapError(resp, 401, "Unauthorized action", "User has not authorized Indigenous to access Google data.");
            self = null;
            return;
        }
        if (accountId > 0) {
            googleDao.importContactsForUser(accountId, req.user, groupIdAry, function(err, value) {
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
    },

    getContactGroups: function(req, res) {
        var self = this;
        self.log.debug('>> getContactGroups');
        var accountId = this.accountId(req);

        if(accountId > 0) {
            googleDao.getGroupsForUser(req.user, function(err, value){
                self.log.debug('just got back from googleDao.');
                console.dir(err);
                console.dir(value);
                self.log.debug('<< getContactGroups');
                self.sendResultOrError(res, err, value, "Error getting groups");
            });
        } else {
            self.wrapError(res, 403, "Unauthorized action", "Unauthorized action. Contacts may only be imported at the Account level");
        }
    }
});

module.exports = new api();

