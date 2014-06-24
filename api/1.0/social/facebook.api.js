/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

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
            resp.send({data:"Processing Import"});
            self = null;
        } else {
            self.wrapError(resp, 500, "Unauthorized action", "Unauthorized action. Contacts may only be imported at the Account level");
            self = null;
        }
    },

    // Likes
    // Generate a function to get likes per day
    getLikesPerDay: function(req, resp) {
        var self = this;
        facebookDao.getLikesPerDay(req.user, function(err, value) {
            if (!err) {
                resp.send(value);
                self = null;
            } else {
                self.wrapError(resp, 500, "Error getting facebook likes per day", err, value);
                self = null;
            }
        });
    },

    // Unlikes
    // Generate a function to get unlikes per day
    getUnlikesPerDay: function(req, resp) {
        var self = this;
        facebookDao.getUnlikesPerDay(req.user, function(err, value) {
            if (!err) {
                resp.send(value);
                self = null;
            } else {
                self.wrapError(resp, 500, "Error getting facebook unlikes per day", err, value);
                self = null;
            }
        });
    },

    // Likes / Unlikes
    // Generate a function to get likes/unlikes per day in batch
    getLikesUnlikesPerDay: function(req, resp) {
        var self = this;
        facebookDao.getLikesUnlikesPerDay(req.user, function(err, value) {
            if (!err) {
                resp.send(value);
            } else {
                self.wrapError(resp, 500, "Error getting facebook likes/unlikes per day in batch", err, value);
                self = null;
            }
        });
    },

    // Posts
    // Get Post function
    getPosts: function(req, resp) {
        var self = this;
        facebookDao.getPosts(req.user, function(err, value) {
            if (!err) {
                resp.send(value);
            } else {
                self.wrapError(resp, 500, "Error getting facebook posts", err, value);
                self = null;
            }
        });
    },

    // Post Interactions
    getPostInteractions: function(req, resp) {
        var self = this;
        facebookDao.getPostInteractions(req.user, function(err, value) {
            if (!err) {
                resp.send(value);
            } else {
                self.wrapError(resp, 500, "Error getting facebook post interactions", err, value);
                self = null;
            }
        });
    },

    // Get Top Ten Posts
    getTopTenPosts: function(req, resp) {
        var self = this;
        facebookDao.getTopTenPosts(req.user, function(err, value) {
            if (!err) {
                resp.send(value);
            } else {
                self.wrapError(resp, 500, "Error getting facebook top ten posts", err, value);
                self = null;
            }
        });
    },

    // Get Reach Per Day
    getReachPerDay: function(req, resp) {
        var self = this;
        facebookDao.getReachPerDay(req.user, function(err, value) {
            if (!err) {
                resp.send(value);
            } else {
                self.wrapError(resp, 500, "Error getting facebook reach per day", err, value);
                self = null;
            }
        });
    },

    // Get engaged demo graphics
    getEngagedDemographics: function(req, resp) {
        var self = this;
        facebookDao.getEngagedDemographics(req.user, function(err, value) {
            if (!err) {
                resp.send(value);
            } else {
                self.wrapError(resp, 500, "Error getting facebook engaged demo graphics", err, value);
                self = null;
            }
        });
    },

    // Get top five fans
    getTopFiveFans: function(req, resp) {
        var self = this;
        facebookDao.getTopFiveFans(req.user, function(err, value) {
            if (!err) {
                resp.send(value);
            } else {
                self.wrapError(resp, 500, "Error getting facebook top five fans", err, value);
                self = null;
            }
        });
    }
});

module.exports = new api();

