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
        app.get(this.url(':id'), this.isAuthAndSubscribedApi.bind(this), this.getSocialConfig.bind(this));
        app.post(this.url(''), this.isAuthAndSubscribedApi.bind(this), this.createSocialConfig.bind(this));

        app.get(this.url('socialaccount/:socialId'), this.isAuthAndSubscribedApi.bind(this), this.getSocialAccount.bind(this));
        app.get(this.url(':id/socialaccount/:socialId'), this.isAuthAndSubscribedApi.bind(this), this.getSocialAccount.bind(this));
        app.post(this.url('socialaccount'), this.isAuthAndSubscribedApi.bind(this), this.addSocialAccount.bind(this));
        app.post(this.url(':id/socialaccount'), this.isAuthAndSubscribedApi.bind(this), this.addSocialAccount.bind(this));
        app.delete(this.url('socialaccount/:socialId'), this.isAuthAndSubscribedApi.bind(this), this.removeSocialAccount.bind(this));
        app.delete(this.url(':id/socialaccount/:socialId'), this.isAuthAndSubscribedApi.bind(this), this.removeSocialAccount.bind(this));
        app.post(this.url(':id'), this.isAuthAndSubscribedApi.bind(this), this.updateSocialConfig.bind(this));
        app.get(this.url('tracked/:index'), this.isAuthAndSubscribedApi.bind(this), this.fetchTrackedObject.bind(this));


        app.get(this.url('facebook/:socialAccountId/posts'), this.isAuthApi.bind(this), this.getFacebookPosts.bind(this));
        app.get(this.url('facebook/:socialAccountId/postComments/:postId'), this.isAuthApi.bind(this), this.getPostComments.bind(this));
        app.get(this.url('facebook/:socialAccountId/pages'), this.isAuthApi.bind(this), this.getFacebookPages.bind(this));
        app.get(this.url('facebook/:socialAccountId/page/:pageId'), this.isAuthApi.bind(this), this.getFacebookPageInfo.bind(this));
        app.get(this.url('facebook/:socialAccountId/profile'), this.isAuthApi.bind(this), this.getFacebookProfile.bind(this));
        app.post(this.url('facebook/:socialAccountId/post'), this.isAuthApi.bind(this), this.createFacebookPost.bind(this));
        app.delete(this.url('facebook/:socialAccountId/post/:postId'), this.isAuthApi.bind(this), this.deleteFacebookPost.bind(this));
        app.post(this.url('facebook/:socialAccountId/post/:postId/comment'), this.isAuthApi.bind(this), this.addPostComment.bind(this));
        app.post(this.url('facebook/:socialAccountId/post/:postId/like'), this.isAuthApi.bind(this), this.addPostLike.bind(this));
        app.delete(this.url('facebook/:socialAccountId/post/:postId/like'), this.isAuthApi.bind(this), this.deletePostLike.bind(this));



        /*
         * twitter feed
         * twitter followers
         * twitter profile
         */

        app.get(this.url('twitter/:socialAccountId/feed'), this.isAuthApi.bind(this), this.getTwitterFeed.bind(this));
        app.get(this.url('twitter/:socialAccountId/followers'), this.isAuthApi.bind(this), this.getTwitterFollowers.bind(this));
        app.get(this.url('twitter/:socialAccountId/profile'), this.isAuthApi.bind(this), this.getTwitterProfile.bind(this));
        app.post(this.url('twitter/:socialAccountId/post'), this.isAuthApi.bind(this), this.createTwitterPost.bind(this));
        app.post(this.url('twitter/:socialAccountId/post/:postId/reply'), this.isAuthApi.bind(this), this.createTwitterReply.bind(this));
        app.post(this.url('twitter/:socialAccountId/post/:postId/retweet'), this.isAuthApi.bind(this), this.createTwitterRetweet.bind(this));
        app.post(this.url('twitter/:socialAccountId/user/:userId/dm'), this.isAuthApi.bind(this), this.createTwitterDM.bind(this));
        app.post(this.url('twitter/:socialAccountId/name/:name/dm'), this.isAuthApi.bind(this), this.createTwitterDM.bind(this));
        app.delete(this.url('twitter/:socialAccountId/post/:postId'), this.isAuthApi.bind(this), this.deleteTwitterPost.bind(this));

        app.get(this.url('google/:socialAccountId/importcontacts'), this.isAuthApi.bind(this), this.getGoogleContacts.bind(this));
        app.get(this.url('google/:socialAccountId/groups'), this.isAuthApi.bind(this), this.getGoogleGroups.bind(this));
        app.get(this.url('linkedin/:socialAccountId/importcontacts'), this.isAuthApi.bind(this), this.getLinkedinContacts.bind(this));

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
                    self.sendResultOrError(resp, err, page, "Error fetching page");
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
                });
            }
        });
    },

    getGoogleContacts: function(req, res) {
      var self = this;
      self.log.debug('>> getGoogleContacts');

      var accountId = parseInt(self.accountId(req));
      var socialAccountId = req.params.socialAccountId;

      self.checkPermission(req, self.sc.privs.MODIFY_SOCIALCONFIG, function(err, isAllowed) {
          if (isAllowed !== true) {
              return self.send403(res);
          } else {
              socialConfigManager.getGoogleContacts(accountId, socialAccountId, req.user, function(err, contacts){
                  self.log.debug('<< getGoogleContacts');
                  self.sendResultOrError(res, err, contacts, "Error importing google contacts");
              });
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
                  self.sendResultOrError(res, err, contacts, "Error importing linkedin contacts");
              });
          }
      });
    }

});

module.exports = new api();
