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
        app.post(this.url(':id'), this.isAuthAndSubscribedApi.bind(this), this.updateSocialConfig.bind(this));

        app.get(this.url('tracked/:index'), this.isAuthAndSubscribedApi.bind(this), this.fetchTrackedObject.bind(this));



        app.get(this.url('facebook/:socialAccountId/pages'), this.isAuthApi.bind(this), this.getFacebookPages.bind(this));
        app.get(this.url('facebook/:socialAccountId/page/:pageId'), this.isAuthApi.bind(this), this.getFacebookPageInfo.bind(this));
        app.post(this.url('facebook/:socialAccountId/post'), this.isAuthApi.bind(this), this.createFacebookPost.bind(this));

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
        self.checkPermission(req, self.sc.privs.VIEW_SOCIALCONFIG, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                socialConfigManager.getSocialConfig(accountId, id, function(err, config){
                    self.log.debug('<< getSocialConfig');
                    self.sendResultOrError(resp, err, config, "Error retrieving social config");
                });
            }
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

    fetchTrackedObject: function(req, resp) {
        var self = this;
        self.log.debug('>> fetchTrackedObject');
        self.checkPermission(req, self.sc.privs.VIEW_SOCIALCONFIG, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                var objIndex = parseInt(req.params.index);
                var accountId = parseInt(self.accountId(req));
                socialConfigManager.fetchTrackedObject(accountId, objIndex, function(err, feed){
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
                return self.send403(res);
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



    createFacebookPost: function(req, resp) {

    }


});

module.exports = new api();
