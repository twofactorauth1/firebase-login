var baseApi = require('../../base.api');
var facebookDao = require('../../../dao/social/facebook.dao');


var api = function() {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "social/facebook",

    dao: facebookDao,

    initialize: function() {
        //GET
        app.get(this.url('checkaccess'), this.isAuthApi, this.checkAccess.bind(this));
        app.get(this.url('profile'), this.isAuthApi, this.getFacebookProfile.bind(this));
        app.get(this.url('friends'), this.isAuthApi, this.getFacebookFriends.bind(this));

        app.get(this.url('friends/import'), this.isAuthApi, this.importFacebookFriends.bind(this));
        app.post(this.url('friends/import'), this.isAuthApi, this.importFacebookFriends.bind(this));
    },


    checkAccess: function(req, resp) {
        var self = this;
        facebookDao.checkAccessToken(req.user, function(err, value) {
            if (!err) {
                resp.send(value);
                self = null;
            } else {
                self.wrapError(resp, 500, "Facebook API access not verified", err, value);
                self = null;
            }
        });
    },


    getFacebookProfile: function(req, resp) {
        var self = this;
        facebookDao.getProfileForUser(req.user, function(err, value) {
            if (!err) {
                resp.send(value);
                self = null;
            } else {
                self.wrapError(resp, 500, "Error retrieving facebook profile", err, value);
                self = null;
            }
        });
    },


    getFacebookFriends: function(req, resp) {
        var self = this;
        facebookDao.getFriendsForUser(req.user, function(err, value) {
            if (!err) {
                resp.send(value);
            } else {
                self.wrapError(resp, 500, "Error retrieving facebook profile", err, value);
            }
        });
    },


    importFacebookFriends: function(req, resp) {
        var self = this;
        var accountId = this.accountId(req);

        if (accountId > 0) {
            facebookDao.importFriendsAsContactsForUser(accountId, req.user, function(err, value) {
                console.log("Facebook import succeeded");
            });
            resp.send("processing");
            self = null;
        } else {
            self.wrapError(resp, 500, "Unauthorized action", "Unauthorized action. Contacts may only be imported at the Account level");
            self = null;
        }
    }
});

module.exports = new api();

