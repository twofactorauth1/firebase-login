/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../../base.api');
var socialConfigManager = require('../../../socialconfig/socialconfig_manager');
var socialConfig = require('../../../socialconfig/model/socialconfig');

var api = function () {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "social/socialconfig",

    log: $$.g.getLogger("socialconfig.api"),

    initialize: function () {

        app.get(this.url(''), this.isAuthAndSubscribedApi.bind(this), this.getSocialConfig.bind(this));

        app.post(this.url(''), this.isAuthAndSubscribedApi.bind(this), this.createSocialConfig.bind(this));

        app.get(this.url('socialaccount/:socialId'), this.isAuthAndSubscribedApi.bind(this), this.getSocialAccount.bind(this));
        app.get(this.url(':id/socialaccount/:socialId'), this.isAuthAndSubscribedApi.bind(this), this.getSocialAccount.bind(this));
        app.post(this.url('socialaccount'), this.isAuthAndSubscribedApi.bind(this), this.addSocialAccount.bind(this));
        app.post(this.url(':id/socialaccount'), this.isAuthAndSubscribedApi.bind(this), this.addSocialAccount.bind(this));
        app.delete(this.url('socialaccount/:socialId'), this.isAuthAndSubscribedApi.bind(this), this.removeSocialAccount.bind(this));
        app.delete(this.url(':id/socialaccount/:socialId'), this.isAuthAndSubscribedApi.bind(this), this.removeSocialAccount.bind(this));

        app.get(this.url('tracked/:index'), this.isAuthAndSubscribedApi.bind(this), this.fetchTrackedObject.bind(this));

        /*
         * Tracked accounts
         */
        app.get(this.url('trackedAccounts'), this.isAuthAndSubscribedApi.bind(this), this.getTrackedAccounts.bind(this));
        app.post(this.url('trackedAccounts'), this.isAuthAndSubscribedApi.bind(this), this.addTrackedAccount.bind(this));
        app.get(this.url('trackedAccount/:id'), this.isAuthAndSubscribedApi.bind(this), this.getTrackedAccount.bind(this));
        app.post(this.url('trackedAccount/:id'), this.isAuthAndSubscribedApi.bind(this), this.updateTrackedAccount.bind(this));
        app.delete(this.url('trackedAccount/:id'), this.isAuthAndSubscribedApi.bind(this), this.deleteTrackedAccount.bind(this));


        app.get(this.url('facebook/:socialAccountId/posts'), this.isAuthApi.bind(this), this.getFacebookPosts.bind(this));
        app.get(this.url('facebook/:socialAccountId/statuses'), this.isAuthApi.bind(this), this.getFacebookStatuses.bind(this));
        app.get(this.url('facebook/:socialAccountId/tagged'), this.isAuthApi.bind(this), this.getFacebookTagged.bind(this));
        app.get(this.url('facebook/:socialAccountId/postComments/:postId'), this.isAuthApi.bind(this), this.getPostComments.bind(this));
        app.get(this.url('facebook/:socialAccountId/pages'), this.isAuthApi.bind(this), this.getFacebookPages.bind(this));
        app.get(this.url('facebook/:socialAccountId/page/:pageId'), this.isAuthApi.bind(this), this.getFacebookPageInfo.bind(this));
        app.get(this.url('facebook/:socialAccountId/profile'), this.isAuthApi.bind(this), this.getFacebookProfile.bind(this));
        app.post(this.url('facebook/:socialAccountId/post'), this.isAuthApi.bind(this), this.createFacebookPost.bind(this));
        app.delete(this.url('facebook/:socialAccountId/post/:postId'), this.isAuthApi.bind(this), this.deleteFacebookPost.bind(this));
        app.post(this.url('facebook/:socialAccountId/post/:postId/comment'), this.isAuthApi.bind(this), this.addPostComment.bind(this));
        app.post(this.url('facebook/:socialAccountId/post/:postId/like'), this.isAuthApi.bind(this), this.addPostLike.bind(this));
        app.delete(this.url('facebook/:socialAccountId/post/:postId/like'), this.isAuthApi.bind(this), this.deletePostLike.bind(this));
        app.post(this.url('facebook/:socialAccountId/sharelink'), this.isAuthApi.bind(this), this.shareFacebookLink.bind(this));


        /*
         * twitter feed
         * twitter followers
         * twitter profile
         * twitter favorites
         * twitter follow/unfollow
         */

        app.get(this.url('twitter/:socialAccountId/feed'), this.isAuthApi.bind(this), this.getTwitterFeed.bind(this));
        app.get(this.url('twitter/:socialAccountId/followers'), this.isAuthApi.bind(this), this.getTwitterFollowers.bind(this));
        app.get(this.url('twitter/:socialAccountId/profile'), this.isAuthApi.bind(this), this.getTwitterProfile.bind(this));
        app.post(this.url('twitter/:socialAccountId/post'), this.isAuthApi.bind(this), this.createTwitterPost.bind(this));
        app.post(this.url('twitter/:socialAccountId/post/:postId/reply'), this.isAuthApi.bind(this), this.createTwitterReply.bind(this));
        app.post(this.url('twitter/:socialAccountId/post/:postId/retweet'), this.isAuthApi.bind(this), this.createTwitterRetweet.bind(this));
        app.post(this.url('twitter/:socialAccountId/post/:postId/favorite'), this.isAuthApi.bind(this), this.createTwitterFavorite.bind(this));
        app.delete(this.url('twitter/:socialAccountId/post/:postId/favorite'), this.isAuthApi.bind(this), this.deleteTwitterFavorite.bind(this));
        app.post(this.url('twitter/:socialAccountId/follow/:twitterId/follow'), this.isAuthApi.bind(this), this.createTwitterFollower.bind(this));
        app.delete(this.url('twitter/:socialAccountId/follow/:twitterId/unfollow'), this.isAuthApi.bind(this), this.deleteTwitterFollower.bind(this));
        app.post(this.url('twitter/:socialAccountId/user/:userId/dm'), this.isAuthApi.bind(this), this.createTwitterDM.bind(this));
        app.post(this.url('twitter/:socialAccountId/name/:name/dm'), this.isAuthApi.bind(this), this.createTwitterDM.bind(this));
        app.get(this.url('twitter/:socialAccountId/dm'), this.isAuthApi.bind(this), this.getTwitterDMs.bind(this));
        app.delete(this.url('twitter/:socialAccountId/post/:postId'), this.isAuthApi.bind(this), this.deleteTwitterPost.bind(this));

        app.get(this.url('google/:socialAccountId/importcontacts'), this.isAuthApi.bind(this), this.getGoogleContacts.bind(this));
        app.get(this.url('google/:socialAccountId/groups'), this.isAuthApi.bind(this), this.getGoogleGroups.bind(this));
        app.get(this.url('linkedin/:socialAccountId/importcontacts'), this.isAuthApi.bind(this), this.getLinkedinContacts.bind(this));


        app.post(this.url('linkedin/:socialAccountId/sharelink'), this.isAuthApi.bind(this), this.shareLinkedinLink.bind(this));

        /*
         * Putting this at the end so we don't mess with other api calls.
         */
        app.get(this.url(':id'), this.isAuthAndSubscribedApi.bind(this), this.getSocialConfig.bind(this));
        app.post(this.url(':id'), this.isAuthAndSubscribedApi.bind(this), this.updateSocialConfig.bind(this));
    },

    /**
     * This method retrieves a social config by account or id.
     * @param req
     * @param resp
     */
    getSocialConfig: function(req, resp) {
        var self = this;
        self.log.debug('>> getSocialConfig');
        var id = null;
        if(req.params.id) {
            id = req.params.id;
        }
        var accountId = parseInt(self.accountId(req));
        socialConfigManager.getSocialConfig(accountId, id, function(err, config){
            self.log.debug('<< getSocialConfig');
            self.sendResultOrError(resp, err, config, "Error retrieving social config");
        });

    },

    createSocialConfig: function(req, resp) {
        var self = this;
        self.log.debug('>> createSocialConfig');
        self.checkPermission(req, self.sc.privs.MODIFY_SOCIALCONFIG, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                var socialConfig = new $$.m.SocialConfig(req.body);
                var accountId = parseInt(self.accountId(req));
                socialConfig.set('accountId', accountId);
                socialConfigManager.createSocialConfig(socialConfig, function(err, config){
                    self.log.debug('<< createSocialConfig');
                    self.sendResultOrError(resp, err, config, "Error creating social config");
                });
            }
        });




    },

    updateSocialConfig: function(req, resp) {
        var self = this;
        self.log.debug('>> updateSocialConfig');
        self.checkPermission(req, self.sc.privs.MODIFY_SOCIALCONFIG, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                var socialConfig = new $$.m.SocialConfig(req.body);
                var accountId = parseInt(self.accountId(req));
                if(req.params.id) {
                    socialConfig.set('_id', req.params.id);
                }
                /*
                 * If the accountId and socialConfig.accountId do not match
                 * return an error.  This could be an innocent mistake... or something
                 * malicious.
                 */
                if(socialConfig.get('accountId') !== accountId) {
                    return self.wrapError(resp, 400, 'Bad Request', 'The social config does not match one belonging to this account.');
                }
                socialConfigManager.updateSocialConfig(socialConfig, function(err, config){
                    self.log.debug('<< updateSocialConfig');
                    self.sendResultOrError(resp, err, config, "Error updating social config");
                    self.createUserActivity(req, 'UPDATE_SOCIALCONFIG', null, null, function(){});
                });
            }
        });
    },

    addSocialAccount: function(req, resp) {
        var self = this;
        self.log.debug('>> addSocialAccount');
        var id = null;
        if(req.params.id) {
            id = req.params.id;
        }
        var accountId = parseInt(self.accountId(req));
        self.checkPermission(req, self.sc.privs.MODIFY_SOCIALCONFIG, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                var socialAccount = req.body;
                self.log.debug('socialAccount:', socialAccount);
                socialConfigManager.addSocialAccount(accountId, socialAccount.type, socialAccount.socialId, socialAccount.accessToken,
                    socialAccount.refreshToken, socialAccount.expires, socialAccount.username, socialAccount.socialUrl,
                    socialAccount.scope, socialAccount.accountType, function(err, config){
                        self.log.debug('<< addSocialAccount');
                        self.sendResultOrError(resp, err, config, "Error adding social account");
                        self.createUserActivity(req, 'ADD_SOCIAL_ACCOUNT', null, {type: socialAccount.type}, function(){});
                    });
            }
        });
    },

    getSocialAccount: function(req, resp) {
        var self = this;
        self.log.debug('>> getSocialAccount');
        var id = null;
        if(req.params.id) {
            id = req.params.id;
        }
        var accountId = parseInt(self.accountId(req));
        self.checkPermission(req, self.sc.privs.VIEW_SOCIALCONFIG, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                socialConfigManager.getSocialConfig(accountId, id, function(err, config){
                    if(err) {
                        self.log.error('Error getting socialConfig: ' + err);
                        return self.wrapError(resp, 500, 'Error getting socialConfig', err);
                    }
                    var account = _.find(config.get('socialAccounts'), function(_account){
                        if(_account.id === req.params.socialId) {
                            return _account;
                        }
                    });
                    self.log.debug('<< getSocialAccount');
                    self.sendResultOrError(resp, err, account, "Error retrieving social account");
                });
            }
        });
    },

    removeSocialAccount: function(req, resp) {
        var self = this;
        self.log.debug('>> removeSocialAccount');
        self.checkPermission(req, self.sc.privs.MODIFY_SOCIALCONFIG, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                var accountId = parseInt(self.accountId(req));
                var id = null;
                var socialId = req.params.socialId;
                if(req.params.id) {
                    socialConfig.set('_id', req.params.id);
                }
                socialConfigManager.removeSocialAccount(accountId, id, socialId, function(err, config){
                    self.log.debug('<< removeSocialAccount');
                    if(err) {
                        return self.wrapError(resp, 500, 'Server Error', err);
                    } else {
                        self.createUserActivity(req, 'REMOVE_SOCIAL_ACCOUNT', null, {socialId: socialId}, function(){});
                        return self.send200(resp);
                    }
                    //self.sendResultOrError(resp, err, config, "Error removing social account");
                });
            }
        });
    },

    fetchTrackedObject: function(req, resp) {
        var self = this;
        self.log.debug('>> fetchTrackedObject');
        var since = req.query.since;
        var until = req.query.until;
        var limit = req.query.limit;
        if(limit) {
            limit = parseInt(limit);
        }

        self.log.debug('since: ' + since + ', until: ' + until + ', limit: ' + limit);

        self.checkPermission(req, self.sc.privs.VIEW_SOCIALCONFIG, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                var objIndex = parseInt(req.params.index);
                var accountId = parseInt(self.accountId(req));
                socialConfigManager.fetchTrackedObject(accountId, objIndex, since, until, limit, function(err, feed){
                    self.log.debug('<< fetchTrackedObject');
                    self.sendResultOrError(resp, err, feed, "Error fetching tracked objects");
                });
            }
        });
    },

    /*
     * Tracked Accounts
     */

    getTrackedAccounts: function(req, resp) {
        var self = this;
        self.log.debug('>> getTrackedAccounts');
        var accountId = parseInt(self.accountId(req));

        self.checkPermission(req, self.sc.privs.VIEW_SOCIALCONFIG, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                socialConfigManager.getSocialConfigTrackedAccounts(accountId, function(err, trackedAccounts){
                    self.log.debug('<< getTrackedAccounts');
                    self.sendResultOrError(resp, err, trackedAccounts, "Error fetching tracked accounts");
                });
            }
        });
    },

    addTrackedAccount: function(req, resp) {
        var self = this;
        self.log.debug('>> addTrackedAccount');

        var accountId = parseInt(self.accountId(req));
        var trackedAccount = req.body.trackedAccount;

        self.checkPermission(req, self.sc.privs.MODIFY_SOCIALCONFIG, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                socialConfigManager.addTrackedAccount(accountId, trackedAccount, function(err, socialConfig){
                    self.log.debug('<< addTrackedAccount');
                    self.sendResultOrError(resp, err, socialConfig, "Error adding tracked account");
                });
            }
        });
    },

    getTrackedAccount: function(req, resp) {
        var self = this;
        self.log.debug('>> getTrackedAccount');

        var accountId = parseInt(self.accountId(req));
        var trackedAccountId = req.params.id;

        self.checkPermission(req, self.sc.privs.VIEW_SOCIALCONFIG, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                socialConfigManager.getTrackedAccount(accountId, trackedAccountId, function(err, trackedAccount){
                    self.log.debug('<< getTrackedAccount');
                    self.sendResultOrError(resp, err, trackedAccount, "Error getting tracked account");
                });
            }
        });
    },

    updateTrackedAccount: function(req, resp) {
        var self = this;
        self.log.debug('>> updateTrackedAccount');

        var accountId = parseInt(self.accountId(req));
        var trackedAccount = req.body.trackedAccount;

        self.checkPermission(req, self.sc.privs.MODIFY_SOCIALCONFIG, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                socialConfigManager.updateTrackedAccount(accountId, trackedAccount, function(err, config){
                    self.log.debug('<< updateTrackedAccount');
                    self.sendResultOrError(resp, err, config, "Error updating tracked account");
                });
            }
        });
    },

    deleteTrackedAccount: function(req, resp) {
        var self = this;
        self.log.debug('>> deleteTrackedAccount');

        var accountId = parseInt(self.accountId(req));
        var trackedAccountId = req.params.id;

        self.checkPermission(req, self.sc.privs.MODIFY_SOCIALCONFIG, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                socialConfigManager.deleteTrackedAccount(accountId, trackedAccountId, function(err, config){
                    self.log.debug('<< deleteTrackedAccount');
                    self.sendResultOrError(resp, err, config, "Error deleting tracked account");
                });
            }
        });
    },

    getFacebookPages: function(req, resp) {
        var self = this;
        self.log.debug('>> getFacebookPages');

        var accountId = parseInt(self.accountId(req));
        var socialAccountId = req.params.socialAccountId;

        self.checkPermission(req, self.sc.privs.VIEW_SOCIALCONFIG, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                socialConfigManager.getFacebookPages(accountId, socialAccountId, function(err, pages){
                    self.log.debug('<< getFacebookPages');
                    self.sendResultOrError(resp, err, pages, "Error fetching pages");
                });
            }
        });

    },

    getFacebookPageInfo: function(req, resp) {
        var self = this;
        self.log.debug('>> getFacebookPageInfo');

        var accountId = parseInt(self.accountId(req));
        var socialAccountId = req.params.socialAccountId;
        var pageId = req.params.pageId;

        self.checkPermission(req, self.sc.privs.VIEW_SOCIALCONFIG, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                socialConfigManager.getFacebookPageInfo(accountId, socialAccountId, pageId, function(err, page){
                    self.log.debug('<< getFacebookPages');
                    self.sendResultOrError(resp, err, page, "Error fetching page");
                });
            }
        });
    },

    getPostComments: function(req, resp) {
        var self = this;
        self.log.debug('>> getPostComments');

        var accountId = parseInt(self.accountId(req));
        var socialAccountId = req.params.socialAccountId;
        var postId = req.params.postId;

        self.checkPermission(req, self.sc.privs.VIEW_SOCIALCONFIG, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                socialConfigManager.getFacebookPostComments(accountId, socialAccountId, postId, function(err, comments){
                    self.log.debug('<< getPostComments');
                    self.sendResultOrError(resp, err, comments, "Error fetching comments");
                });
            }
        });
    },

    getFacebookProfile: function(req, resp) {
        var self = this;
        self.log.debug('>> getFacebookProfile');

        var accountId = parseInt(self.accountId(req));
        var socialAccountId = req.params.socialAccountId;
        var pageId = req.params.pageId;

        self.checkPermission(req, self.sc.privs.VIEW_SOCIALCONFIG, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                socialConfigManager.getFacebookProfile(accountId, socialAccountId, function(err, profile){
                    self.log.debug('<< getFacebookProfile');
                    self.sendResultOrError(resp, err, profile, "Error fetching page");
                });
            }
        });
    },

    createFacebookPost: function(req, resp) {
        var self = this;
        self.log.debug('>> createFacebookPost');

        var accountId = parseInt(self.accountId(req));
        var socialAccountId = req.params.socialAccountId;

        var message = req.body.post;
        var url = req.body.imageUrl;//optional

        self.checkPermission(req, self.sc.privs.MODIFY_SOCIALCONFIG, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                socialConfigManager.createFacebookPost(accountId, socialAccountId, message, url, function(err, value){
                    self.log.debug('<< createFacebookPost');
                    self.sendResultOrError(resp, err, value, "Error creating post");
                    self.createUserActivity(req, 'CREATE_FACEBOOK_POST', null, {socialAccountId: socialAccountId}, function(){});
                });

            }
        });

    },

    shareFacebookLink: function(req, resp) {
        var self = this;
        self.log.debug('>> shareFacebookLink');
        var accountId = parseInt(self.accountId(req));
        var socialAccountId = req.params.socialAccountId;

        var url = req.body.url;
        var picture = req.body.picture;
        var name = req.body.name;
        var caption = req.body.caption;
        var description = req.body.description;

        self.checkPermission(req, self.sc.privs.MODIFY_SOCIALCONFIG, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                socialConfigManager.shareFacebookLink(accountId, socialAccountId, url, picture, name, caption,
                    description, function(err, value){
                        self.log.debug('<< shareFacebookLink');
                        self.sendResultOrError(resp, err, value, "Error creating post");
                        self.createUserActivity(req, 'SHARE_FACEBOOK_LINK', null, {socialAccountId: socialAccountId}, function(){});
                    });
            }
        });
    },

    deleteFacebookPost: function(req, resp) {
        var self = this;
        self.log.debug('>> deleteFacebookPost');

        var accountId = parseInt(self.accountId(req));
        var socialAccountId = req.params.socialAccountId;
        var postId = req.params.postId;

        self.checkPermission(req, self.sc.privs.MODIFY_SOCIALCONFIG, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                socialConfigManager.deleteFacebookPost(accountId, socialAccountId, postId, function(err, value){
                    self.log.debug('<< deleteFacebookPost');
                    self.sendResultOrError(resp, err, value, "Error deleting post");
                    self.createUserActivity(req, 'DELETE_FACEBOOK_POST', null, {socialAccountId: socialAccountId, postId:postId}, function(){});
                });
            }
        });
    },

    addPostComment: function(req, resp) {
        var self = this;
        self.log.debug('>> addPostComment');

        var accountId = parseInt(self.accountId(req));
        var socialAccountId = req.params.socialAccountId;
        var postId = req.params.postId;
        var comment = req.body.comment;

        self.checkPermission(req, self.sc.privs.MODIFY_SOCIALCONFIG, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                socialConfigManager.addFacebookComment(accountId, socialAccountId, postId, comment, function(err, value){
                    self.log.debug('<< addPostComment');
                    self.sendResultOrError(resp, err, value, "Error adding comment");
                    self.createUserActivity(req, 'ADD_FACEBOOK_COMMENT', null, {socialAccountId: socialAccountId, postId:postId}, function(){});
                });
            }
        });
    },

    addPostLike: function(req, resp) {
        var self = this;
        self.log.debug('>> addPostLike');

        var accountId = parseInt(self.accountId(req));
        var socialAccountId = req.params.socialAccountId;
        var postId = req.params.postId;

        self.checkPermission(req, self.sc.privs.MODIFY_SOCIALCONFIG, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                socialConfigManager.addFacebookLike(accountId, socialAccountId, postId, function(err, value){
                    self.log.debug('<< addPostLike');
                    self.sendResultOrError(resp, err, value, "Error adding like");
                    self.createUserActivity(req, 'ADD_FACEBOOK_LIKE', null, {socialAccountId: socialAccountId, postId:postId}, function(){});
                });
            }
        });
    },

    deletePostLike: function(req, resp) {
        var self = this;
        self.log.debug('>> deletePostLike');

        var accountId = parseInt(self.accountId(req));
        var socialAccountId = req.params.socialAccountId;
        var postId = req.params.postId;

        self.checkPermission(req, self.sc.privs.MODIFY_SOCIALCONFIG, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                socialConfigManager.deleteFacebookLike(accountId, socialAccountId, postId, function(err, value){
                    self.log.debug('<< deletePostLike');
                    self.sendResultOrError(resp, err, value, "Error deleting like");
                    self.createUserActivity(req, 'DELETE_FACEBOOK_LIKE', null, {socialAccountId: socialAccountId, postId:postId}, function(){});
                });
            }
        });
    },

    getFacebookPosts: function(req, resp) {
        var self = this;
        self.log.debug('>> getFacebookPosts');

        var accountId = parseInt(self.accountId(req));
        var socialAccountId = req.params.socialAccountId;

        self.checkPermission(req, self.sc.privs.VIEW_SOCIALCONFIG, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                socialConfigManager.getFacebookPosts(accountId, socialAccountId, function(err, posts){
                    self.log.debug('<< getFacebookPosts');
                    self.sendResultOrError(resp, err, posts, "Error fetching posts");
                });
            }
        });

    },

    getFacebookStatuses: function(req, resp) {
        var self = this;
        self.log.debug('>> getFacebookPosts');

        var accountId = parseInt(self.accountId(req));
        var socialAccountId = req.params.socialAccountId;

        self.checkPermission(req, self.sc.privs.VIEW_SOCIALCONFIG, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                socialConfigManager.getFacebookStatuses(accountId, socialAccountId, function(err, posts){
                    self.log.debug('<< getFacebookPosts');
                    self.sendResultOrError(resp, err, posts, "Error fetching posts");
                });
            }
        });
    },

    getFacebookTagged: function(req, resp) {
        var self = this;
        self.log.debug('>> getFacebookPosts');

        var accountId = parseInt(self.accountId(req));
        var socialAccountId = req.params.socialAccountId;

        self.checkPermission(req, self.sc.privs.VIEW_SOCIALCONFIG, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                socialConfigManager.getFacebookTagged(accountId, socialAccountId, function(err, posts){
                    self.log.debug('<< getFacebookPosts');
                    self.sendResultOrError(resp, err, posts, "Error fetching posts");
                });
            }
        });
    },

    getTwitterFeed: function(req, resp) {
        var self = this;
        self.log.debug('>> getTwitterFeed');

        var accountId = parseInt(self.accountId(req));
        var socialAccountId = req.params.socialAccountId;

        self.checkPermission(req, self.sc.privs.VIEW_SOCIALCONFIG, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                socialConfigManager.getTwitterFeed(accountId, socialAccountId, function(err, posts){
                    self.log.debug('<< getTwitterFeed');
                    self.sendResultOrError(resp, err, posts, "Error fetching twitter feed");
                });
            }
        });
    },

    getTwitterFollowers: function(req, resp) {
        var self = this;
        self.log.debug('>> getTwitterFollowers');

        var accountId = parseInt(self.accountId(req));
        var socialAccountId = req.params.socialAccountId;

        self.checkPermission(req, self.sc.privs.VIEW_SOCIALCONFIG, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                socialConfigManager.getTwitterFollowers(accountId, socialAccountId, function(err, followers){
                    self.log.debug('<< getTwitterFollowers');
                    self.sendResultOrError(resp, err, followers, "Error fetching twitter followers");
                });
            }
        });
    },

    getTwitterProfile: function(req, resp) {
        var self = this;
        self.log.debug('>> getTwitterProfile');

        var accountId = parseInt(self.accountId(req));
        var socialAccountId = req.params.socialAccountId;

        self.checkPermission(req, self.sc.privs.VIEW_SOCIALCONFIG, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                socialConfigManager.getTwitterProfile(accountId, socialAccountId, function(err, profile){
                    self.log.debug('<< getTwitterProfile');
                    self.sendResultOrError(resp, err, profile, "Error fetching twitter profile");
                });
            }
        });
    },

    createTwitterPost: function(req, resp) {
        var self = this;
        self.log.debug('>> createTwitterPost');

        var accountId = parseInt(self.accountId(req));
        var socialAccountId = req.params.socialAccountId;
        var post = req.body.post;

        self.checkPermission(req, self.sc.privs.MODIFY_SOCIALCONFIG, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                socialConfigManager.createTwitterPost(accountId, socialAccountId, post, function(err, savedPost){
                    self.log.debug('<< createTwitterPost');
                    self.sendResultOrError(resp, err, savedPost, "Error creating twitter post");
                    self.createUserActivity(req, 'ADD_TWITTER_POST', null, {socialAccountId: socialAccountId}, function(){});
                });
            }
        });
    },

    createTwitterReply: function(req, resp) {
        var self = this;
        self.log.debug('>> createTwitterReply');

        var accountId = parseInt(self.accountId(req));
        var socialAccountId = req.params.socialAccountId;
        var post = req.body.post;
        var tweetId = req.params.postId;

        self.checkPermission(req, self.sc.privs.MODIFY_SOCIALCONFIG, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                socialConfigManager.replyToTwitterPost(accountId, socialAccountId, tweetId, post, function(err, savedPost){
                    self.log.debug('<< createTwitterReply');
                    self.sendResultOrError(resp, err, savedPost, "Error creating twitter post");
                    self.createUserActivity(req, 'ADD_TWITTER_REPLY', null, {socialAccountId: socialAccountId, tweetId:tweetId}, function(){});
                });
            }
        });

    },

    createTwitterRetweet: function(req, resp) {
        var self = this;
        self.log.debug('>> createTwitterRetweet');

        var accountId = parseInt(self.accountId(req));
        var socialAccountId = req.params.socialAccountId;
        var tweetId = req.params.postId;

        self.checkPermission(req, self.sc.privs.MODIFY_SOCIALCONFIG, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                socialConfigManager.retweetTwitterPost(accountId, socialAccountId, tweetId, function(err, savedPost){
                    self.log.debug('<< createTwitterRetweet');
                    self.sendResultOrError(resp, err, savedPost, "Error creating twitter retweet");
                    self.createUserActivity(req, 'ADD_TWITTER_RETWEET', null, {socialAccountId: socialAccountId, tweetId:tweetId}, function(){});
                });
            }
        });
    },

    createTwitterFavorite: function(req, resp) {
        var self = this;
        self.log.debug('>> createTwitterFavorite');

        var accountId = parseInt(self.accountId(req));
        var socialAccountId = req.params.socialAccountId;
        var tweetId = req.params.postId;

        self.checkPermission(req, self.sc.privs.MODIFY_SOCIALCONFIG, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                socialConfigManager.favoriteTwitterPost(accountId, socialAccountId, tweetId, function(err, savedPost){
                    self.log.debug('<< createTwitterFavorite');
                    self.sendResultOrError(resp, err, savedPost, "Error creating twitter favorite");
                    self.createUserActivity(req, 'ADD_TWITTER_FAVORITE', null, {socialAccountId: socialAccountId, tweetId:tweetId}, function(){});
                });
            }
        });
    },

    deleteTwitterFavorite: function(req, resp) {
        var self = this;
        self.log.debug('>> deleteTwitterFavorite');

        var accountId = parseInt(self.accountId(req));
        var socialAccountId = req.params.socialAccountId;
        var tweetId = req.params.postId;

        self.checkPermission(req, self.sc.privs.MODIFY_SOCIALCONFIG, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                socialConfigManager.unfavoriteTwitterPost(accountId, socialAccountId, tweetId, function(err, savedPost){
                    self.log.debug('<< deleteTwitterFavorite');
                    self.sendResultOrError(resp, err, savedPost, "Error deleting twitter favorite");
                    self.createUserActivity(req, 'DELETE_TWITTER_FAVORITE', null, {socialAccountId: socialAccountId, tweetId:tweetId}, function(){});
                });
            }
        });
    },

    createTwitterFollower: function(req, resp) {
        var self = this;
        self.log.debug('>> createTwitterFollower');

        var accountId = parseInt(self.accountId(req));
        var socialAccountId = req.params.socialAccountId;
        var userId = req.params.twitterId;

        self.log.debug('>> createTwitterFollower, userId: ' + userId);

        self.checkPermission(req, self.sc.privs.MODIFY_SOCIALCONFIG, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                socialConfigManager.followTwitterUser(accountId, socialAccountId, userId, function(err, savedPost){
                    self.log.debug('<< createTwitterFollower');
                    self.sendResultOrError(resp, err, savedPost, "Error creating twitter favorite");
                    self.createUserActivity(req, 'ADD_TWITTER_FOLLOWER', null, {socialAccountId: socialAccountId, userId:userId}, function(){});
                });
            }
        });
    },

    deleteTwitterFollower: function(req, resp) {
        var self = this;
        self.log.debug('>> deleteTwitterFollower');

        var accountId = parseInt(self.accountId(req));
        var socialAccountId = req.params.socialAccountId;
        var userId = req.params.twitterId;

        self.checkPermission(req, self.sc.privs.MODIFY_SOCIALCONFIG, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                socialConfigManager.unfollowTwitterUser(accountId, socialAccountId, userId, function(err, savedPost){
                    self.log.debug('<< deleteTwitterFollower');
                    self.sendResultOrError(resp, err, savedPost, "Error deleting Twitter follower");
                    self.createUserActivity(req, 'DELETE_TWITTER_FOLLOWER', null, {socialAccountId: socialAccountId, userId:userId}, function(){});
                });
            }
        });
    },

    createTwitterDM: function(req, resp) {
        var self = this;
        self.log.debug('>> createTwitterDM');

        var accountId = parseInt(self.accountId(req));
        var socialAccountId = req.params.socialAccountId;
        var userId = req.params.userId;
        var screenName = req.params.name;

        var post = req.body.msg;

        self.checkPermission(req, self.sc.privs.MODIFY_SOCIALCONFIG, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                socialConfigManager.directMessageTwitterUser(accountId, socialAccountId, userId, screenName, post,
                    function (err, savedPost){
                        self.log.debug('<< createTwitterDM');
                        self.sendResultOrError(resp, err, savedPost, "Error creating twitter dm");
                        self.createUserActivity(req, 'ADD_TWITTER_DM', null, {socialAccountId: socialAccountId}, function(){});
                    });
            }
        });

    },

    getTwitterDMs: function(req, resp) {
        var self = this;
        self.log.debug('>> getTwitterDMs');
        var since = req.query.since;
        var until = req.query.until;
        var limit = req.query.limit;
        if(limit) {
            limit = parseInt(limit);
        }
        var accountId = parseInt(self.accountId(req));
        var socialAccountId = req.params.socialAccountId;

        self.checkPermission(req, self.sc.privs.MODIFY_SOCIALCONFIG, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                socialConfigManager.getTwitterDirectMessages(accountId, socialAccountId, since, until, limit, function(err, msgs){
                    self.log.debug('<< getTwitterDMs');
                    self.sendResultOrError(resp, err, msgs, "Error getting twitter dm");
                });
            }
        });
    },

    deleteTwitterPost: function(req, resp) {
        var self = this;
        self.log.debug('>> deleteTwitterPost');

        var accountId = parseInt(self.accountId(req));
        var socialAccountId = req.params.socialAccountId;
        var postId = req.params.postId;

        self.checkPermission(req, self.sc.privs.MODIFY_SOCIALCONFIG, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                socialConfigManager.deleteTwitterPost(accountId, socialAccountId, postId, function(err, savedPost){
                    self.log.debug('<< deleteTwitterPost');
                    self.sendResultOrError(resp, err, savedPost, "Error deleting twitter post");
                    self.createUserActivity(req, 'DELETE_TWITTER_POST', null, {socialAccountId: socialAccountId, tweetId: postId}, function(){});
                });
            }
        });
    },

    getGoogleContacts: function(req, res) {
      var self = this;
      self.log.debug('>> getGoogleContacts');

      var accountId = parseInt(self.accountId(req));
      var socialAccountId = req.params.socialAccountId;
      var groupId = req.query.groupId;
      if(groupId) {
          self.log.debug('groupId: ', groupId.id);
      }

      self.checkPermission(req, self.sc.privs.MODIFY_SOCIALCONFIG, function(err, isAllowed) {
          if (isAllowed !== true) {
              return self.send403(res);
          } else {
              socialConfigManager.getGoogleContacts(accountId, socialAccountId, req.user, groupId, function(err, contacts){
                  self.log.debug('<< getGoogleContacts');
                  //self.sendResultOrError(res, err, contacts, "Error importing google contacts");
                  self.createUserActivity(req, 'IMPORT_GOOGLE_CONTACTS', null, {socialAccountId: socialAccountId}, function(){});
              });
              self.sendResult(res, "Ok");
          }
      });
    },

    getGoogleGroups: function(req, res) {
        var self = this;
        self.log.debug('>> getGoogleGroups');

        var accountId = parseInt(self.accountId(req));
        var socialAccountId = req.params.socialAccountId;

        self.checkPermission(req, self.sc.privs.MODIFY_SOCIALCONFIG, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                socialConfigManager.getGoogleContactGroups(accountId, socialAccountId, function(err, contacts){
                    self.log.debug('<< getGoogleGroups');
                    self.sendResultOrError(res, err, contacts, "Error getting google groups");
                });
            }
        });
    },

    getLinkedinContacts: function(req, res) {
      var self = this;
      self.log.debug('>> getLinkedinContacts');

      var accountId = parseInt(self.accountId(req));
      var socialAccountId = req.params.socialAccountId;

      self.checkPermission(req, self.sc.privs.MODIFY_SOCIALCONFIG, function(err, isAllowed) {
          if (isAllowed !== true) {
              return self.send403(res);
          } else {
              socialConfigManager.getLinkedinContacts(accountId, socialAccountId, req.user, function(err, contacts){
                  self.log.debug('<< getLinkedinContacts');
                  //self.sendResultOrError(res, err, contacts, "Error importing linkedin contacts");
                  self.createUserActivity(req, 'IMPORT_LINKEDIN_CONTACTS', null, {socialAccountId: socialAccountId}, function(){});
              });
              self.sendResult(res, "Ok");
          }
      });
    },

    shareLinkedinLink: function(req, resp) {
        var self = this;
        self.log.debug('>> shareLinkedinLink');
        var accountId = parseInt(self.accountId(req));
        var socialAccountId = req.params.socialAccountId;

        var url = req.body.url;
        var picture = req.body.picture;
        var name = req.body.name;
        var caption = req.body.caption;
        var description = req.body.description;

        self.checkPermission(req, self.sc.privs.MODIFY_SOCIALCONFIG, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                socialConfigManager.shareLinkedinLink(accountId, socialAccountId, url, picture, name, caption,
                    description, function(err, value){
                        self.log.debug('<< shareLinkedinLink');
                        self.sendResultOrError(resp, err, value, "Error creating post");
                        self.createUserActivity(req, 'ADD_LINKEDIN_POST', null, {socialAccountId: socialAccountId}, function(){});
                    });
            }
        });
    }

});

module.exports = new api();
