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
        app.get(this.url('checkaccess'), this.isAuthApi.bind(this), this.checkAccess.bind(this));
        app.get(this.url('profile'), this.isAuthApi.bind(this), this.getFacebookProfile.bind(this));
        app.get(this.url('friends'), this.isAuthApi.bind(this), this.getFacebookFriends.bind(this));

        app.get(this.url('friends/import'), this.isAuthApi.bind(this), this.importFacebookFriends.bind(this));
        app.post(this.url('friends/import'), this.isAuthApi.bind(this), this.importFacebookFriends.bind(this));

        //facebook api
        app.get(this.url('likesperday'), this.isAuthApi.bind(this), this.getLikesPerDay.bind(this));
        app.get(this.url('insights/'), this.isAuthApi.bind(this), this.getAppInsights.bind(this));
        app.get(this.url('insights/:metric'), this.isAuthApi.bind(this), this.getAppInsights.bind(this));
        app.get(this.url('insights/:metric/:period'), this.isAuthApi.bind(this), this.getAppInsights.bind(this));
        app.get(this.url('insights/:metric/:period/:breakdown'), this.isAuthApi.bind(this), this.getAppInsights.bind(this));

        app.get(this.url('pages'), this.isAuthApi.bind(this), this.getPages.bind(this));
        app.get(this.url('page/:pageId'), this.isAuthApi.bind(this), this.getPageInfo.bind(this));
        app.get(this.url('pagepic/:pageId'), this.isAuthApi.bind(this), this.getPageProfilePic.bind(this));

        app.get(this.url('posts/:socialId'), this.isAuthApi.bind(this), this.getPosts.bind(this));

        app.post(this.url('share/link'), this.isAuthApi.bind(this), this.shareLink.bind(this));
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

    getPages: function(req, resp) {
        var self = this;
        facebookDao.getPages(req.user, function(err, value) {
            if (!err) {
                resp.send(value);
                self = null;
            } else {
                self.wrapError(resp, 500, "Error retrieving facebook pages", err, value);
                self = null;
            }
        });
    },

    getPageInfo: function(req, resp) {
        var self = this;
        var pageId = req.params.pageId;
        facebookDao.getPageInfo(req.user, pageId, function(err, value) {
            if (!err) {
                resp.send(value);
                self = null;
            } else {
                self.wrapError(resp, 500, "Error retrieving facebook page info", err, value);
                self = null;
            }
        });
    },

    getPageProfilePic: function(req, resp) {
        var self = this;
        var pageId = req.params.pageId;
        facebookDao.getPageProfilePic(req.user, pageId, function(err, value) {
            if (!err) {
                resp.send(value);
                self = null;
            } else {
                self.wrapError(resp, 500, "Error retrieving facebook page profile pic", err, value);
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

        //check if we have an access token
        var user = req.user;
        if(user.getCredentials($$.constants.user.credential_types.FACEBOOK) === null) {
            self.wrapError(resp, 401, "Unauthorized action", "User has not authorized Indigenous to access Facebook data.");
            self = null;
            return;
        }

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
        var options = {
            since : req.query.since
            , until : req.query.until
            , limit : req.query.limit
        };
        facebookDao.getLikesPerDay(req.user, options, function(err, value) {
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
        var options = {
            since : req.query.since
            , until : req.query.until
            , limit : req.query.limit
        };
        facebookDao.getUnlikesPerDay(req.user, options, function(err, value) {
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
        self.log.debug('getPosts >>');
        var socialId = req.params.socialId;
        facebookDao.getUserPosts(req.user, socialId, function(err, value) {
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
    },

    getAppInsights: function (req, resp) {
        var self= this;
        var urlOptions = {};
        urlOptions.metric = req.params.metric || null;
        urlOptions.period = req.params.period || null;
        urlOptions.breakdown = req.params.breakdown || null;
        facebookDao.getAppInsights(req.user, urlOptions, function(err, value) {
            if (!err) {
                resp.send(value);
            } else {
                self.wrapError(resp, 500, "Error getting facebook app insights", err, value);
                self = null;
            }
        });
    },

    shareLink: function(req, resp) {
        var self = this;
        self.log.debug('>> shareLink');

        var url = req.body.url;
        var picture = req.body.picture;
        var name = req.body.name;
        var caption = req.body.caption;
        var description = req.body.description;

        facebookDao.shareLink(req.user, url, picture, name, caption, description, function(err, value){
            self.log.debug('<< shareLink');
            self.sendResultOrError(resp, err, value, 'Error sharing link.', 500);
        });
    }
});

module.exports = new api();

