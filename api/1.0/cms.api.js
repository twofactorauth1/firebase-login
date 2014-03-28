/**
 * COPYRIGHT CMConsulting LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact christopher.mina@gmail.com for approval or questions.
 */

var baseApi = require('../base.api.js');
var cmsDao = require('../../dao/cms.dao');

var api = function() {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "cms",

    dao: cmsDao,

    initialize: function() {
        //GET
        app.get(this.url('website/:id'), this.isAuthApi, this.getWebsiteById.bind(this));
        app.get(this.url(':accountid/cms/website', "account"), this.isAuthApi, this.getWebsiteForAccountId.bind(this));

        app.get(this.url('website/:websiteid/page/:handle'), this.getPageByHandle.bind(this));
        app.get(this.url('page/:id'), this.getPageById.bind(this));

        app.get(this.url('theme/:id'), this.isAuthApi, this.getThemeConfigById.bind(this));
        app.get(this.url(':accountid/cms/theme', "account"), this.isAuthApi, this.getThemeConfigForAccountId.bind(this));
    },


    getWebsiteById: function(req, resp) {
        //TODO: Add security
        var self = this;
        var websiteId = req.params.id;

        cmsDao.getWebsiteById(websiteId, function(err, value) {
            self.sendResultOrError(resp, err, value, "Error Retrieving Website by Id");
            self = null;
        });
    },


    getWebsiteForAccountId: function(req, resp) {
        //TODO: Add Security
        var self = this;
        var accountId = parseInt(req.params.accountid);

        cmsDao.getOrCreateWebsiteByAccountId(accountId, req.user.id(), true, function(err, value) {
            self.sendResultOrError(resp, err, value, "Error retrieving website by account id");
            self = value = null;
        });
    },


    getPageByHandle: function(req, resp) {
        //TODO: Add security
        var self = this;
        var websiteId = req.params.websiteid;
        var pageHandle = req.params.handle;

        cmsDao.getPageForWebsite(websiteId, pageHandle, function(err, value) {
            self.sendResultOrError(resp, err, value, "Error Retrieving Page for Website");
            self = null;
        });
    },


    getPageById: function(req, resp) {
        //TODO: Add security
        var self = this;
        var pageId = req.params.id;

        cmsDao.getPageById(pageId, function(err, value) {
            self.sendResultOrError(resp, err, value, "Error Retrieving Page by Id");
            self = null;
        });
    },


    getThemeConfigById: function(req, resp) {
        //TODO: Add Security
        var self = this;
        var themeId = req.params.id;

        cmsDao.getThemeConfig(themeId, function(err, value) {
            self.sendResultOrError(resp, err, value, "Error retrieving Theme Config for ID: [" + themeId + "]");
            self = null;
        });
    },


    getThemeConfigForAccountId: function(req, resp) {
        //TODO: Add Security
        var self = this;
        var accountId = req.params.accountid;

        accountId = parseInt(accountId);

        if (isNaN(accountId)) {
            this.sendResultOnError(resp, "Account Id is not valid", "");
            self = null;
            return;
        }
        cmsDao.getThemeConfigSignedByAccountId(accountId, function(err, value) {
            self.sendResultOrError(resp, err, value, "Error retrieving Theme Config for AccountId: [" + accountId + "]");
            self = null;
        });
    }
});

module.exports = new api();

