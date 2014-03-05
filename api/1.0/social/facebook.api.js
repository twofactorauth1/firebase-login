var BaseApi = require('../../base.api');
var FacebookDao = require('../../../dao/social/facebook.dao');


var api = function() {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, BaseApi.prototype, {

    base: "social/facebook",

    dao: FacebookDao,

    initialize: function() {
        //GET
        app.get(this.url('profile'), this.isAuthApi, this.getFacebookProfile.bind(this));
        app.get(this.url('friends'), this.isAuthApi, this.getFacebookFriends.bind(this));

        app.get(this.url('friends/import'), this.isAuthApi, this.importFacebookFriends.bind(this));
        app.post(this.url('friends/import'), this.isAuthApi, this.importFacebookFriends.bind(this));
    },


    getFacebookProfile: function(req, resp) {
        var self = this;
        FacebookDao.getProfileForUser(req.user, function(err, value) {
            if (!err) {
                resp.send(value);
            } else {
                self.wrapError(resp, 500, "Error retrieving facebook profile", err, value);
            }
        });
    },


    getFacebookFriends: function(req, resp) {
        var self = this;
        FacebookDao.getFriendsForUser(req.user, function(err, value) {
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
            FacebookDao.importFriendsAsContactsForUser(accountId, req.user, function(err, value) {
                console.log("Facebook import succeeded");
            });
            resp.send("processing");
        } else {
            self.wrapError(resp, 500, "Unauthorized action", "Unauthorized action. Contacts may only be imported at the Account level");
        }
    }
});

module.exports = new api();

