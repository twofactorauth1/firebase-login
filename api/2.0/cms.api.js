/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2015
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../base.api.js');


var cmsManager = require('../../cms/cms_manager');
var cmsDao = require('../../cms/dao/cms.dao');
var preRenderConfig = require('../../configs/prerender.config');
var request = require('request');

var ssbManager = require('../../ssb/ssb_manager');

var api = function () {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "cms",

    version: "2.0",

    dao: cmsDao,

    initialize: function () {

        // THEME - work with theme objects

        app.get(this.url('themes'), this.isAuthAndSubscribedApi.bind(this), this.noop.bind(this));//list
        app.get(this.url('themes/:id'), this.isAuthAndSubscribedApi.bind(this), this.noop.bind(this));//get
        app.post(this.url('themes'), this.isAuthAndSubscribedApi.bind(this), this.noop.bind(this));//create
        app.post(this.url('themes/:id'), this.isAuthAndSubscribedApi.bind(this), this.noop.bind(this));//update
        app.delete(this.url('themes/:id'), this.isAuthAndSubscribedApi.bind(this), this.noop.bind(this));//delete


        // TEMPLATE - work with template objects
        app.get(this.url('templates'), this.isAuthAndSubscribedApi.bind(this), this.listTemplates.bind(this));//list
        app.get(this.url('templates/:id'), this.isAuthAndSubscribedApi.bind(this), this.getTemplate.bind(this));//get
        app.post(this.url('templates'), this.isAuthAndSubscribedApi.bind(this), this.noop.bind(this));//create
        app.post(this.url('templates/:id'), this.isAuthAndSubscribedApi.bind(this), this.noop.bind(this));//update
        app.delete(this.url('templates/:id'), this.isAuthAndSubscribedApi.bind(this), this.noop.bind(this));//delete

        // WEBSITE - work with website objects
        app.get(this.url('websites'), this.isAuthAndSubscribedApi.bind(this), this.noop.bind(this));//get default (0th) website for current account
        app.get(this.url('websites/:id'), this.isAuthAndSubscribedApi.bind(this), this.noop.bind(this));//get
        app.get(this.url('websites'), this.isAuthAndSubscribedApi.bind(this), this.noop.bind(this));//list
        app.post(this.url('websites'), this.isAuthAndSubscribedApi.bind(this), this.noop.bind(this));//create
        app.post(this.url('websites/:id'), this.isAuthAndSubscribedApi.bind(this), this.noop.bind(this));//update
        app.delete(this.url('websites/:id'), this.isAuthAndSubscribedApi.bind(this), this.noop.bind(this));//delete

        app.get(this.url('websites/:id/theme'), this.isAuthAndSubscribedApi.bind(this), this.noop.bind(this));//get theme

        //PAGE
        app.get(this.url('websites/:id/page'), this.isAuthAndSubscribedApi.bind(this), this.noop.bind(this));//get pages
        app.post(this.url('websites/:id/page'), this.isAuthAndSubscribedApi.bind(this), this.createPage.bind(this));//create page
        app.get(this.url('pages/:id'), this.isAuthAndSubscribedApi.bind(this), this.getPage.bind(this));//get page
        app.post(this.url('pages/:id'), this.isAuthAndSubscribedApi.bind(this), this.updatePage.bind(this));//update page
        app.delete(this.url('pages/:id'), this.isAuthAndSubscribedApi.bind(this), this.noop.bind(this));//delete page

        app.get(this.url('pages/:id/template'), this.isAuthAndSubscribedApi.bind(this), this.noop.bind(this));//get page template
        app.post(this.url('pages/:id/template/:templateId'), this.isAuthAndSubscribedApi.bind(this), this.noop.bind(this));//set page template

        app.get(this.url('pages/:id/versions'), this.isAuthAndSubscribedApi.bind(this), this.noop.bind(this));//get page versions
        app.post(this.url('pages/:id/version/:versionId'), this.isAuthAndSubscribedApi.bind(this), this.noop.bind(this));//revert page to version


        // COMPONENTS
        app.get(this.url('components'), this.isAuthAndSubscribedApi.bind(this), this.noop.bind(this)); //get components


    },

    noop: function(req, resp) {
        var self = this;
        self.log.debug('>> noop');
        var accountId = parseInt(self.accountId(req));
        self.log.debug('<< noop');
        self.sendResult(resp, {msg:'method not implemented'});
    },

    listTemplates: function(req, resp) {
        var self = this;
        self.log.debug('>> listTemplates');
        var accountId = parseInt(self.accountId(req));

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed){
            if(isAllowed !== true) {
                return self.send403(resp);
            } else {
                ssbManager.listTemplates(accountId, function(err, list){
                    self.log.debug('<< listTemplates');
                    return self.sendResultOrError(resp, err, list, "Error listing templates");
                });
            }
        });

    },

    getTemplate: function(req, resp) {
        var self = this;
        self.log.debug('>> getTemplate');
        var accountId = parseInt(self.accountId(req));
        var templateId = req.params.id;
        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed){
            if(isAllowed !== true) {
                return self.send403(resp);
            } else {
                ssbManager.getTemplate(templateId, function(err, template){
                    self.log.debug('<< getTemplate');
                    return self.sendResultOrError(resp, err, template, "Error getting template");
                });
            }
        });
    },

    listThemes: function(req, resp) {
        var self = this;
        self.log.debug('>> listThemes');
        var accountId = parseInt(self.accountId(req));
        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed){
            if(isAllowed !== true) {
                return self.send403(resp);
            } else {
                ssbManager.listThemes(accountId, function(err, themes){
                    self.log.debug('<< listThemes');
                    return self.sendResultOrError(resp, err, themes, "Error listing themes");
                });
            }
        });
    },

    getTheme: function(req, resp) {
        var self = this;
        self.log.debug('>> getTheme');
        var accountId = parseInt(self.accountId(req));
        var themeId = req.params.id;

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed){
            if(isAllowed !== true) {
                return self.send403(resp);
            } else {
                ssbManager.getTheme(themeId, function(err, theme){
                    self.log.debug('<< getTheme');
                    return self.sendResultOrError(resp, err, theme, "Error getting theme");
                });
            }
        });
    },

    createWebsite: function(req, resp) {

    },

    createPage: function(req, resp) {
        var self = this;
        self.log.debug('>> createPage');

        var templateId = req.body.templateId;
        var websiteId = req.params.id;
        var accountId = parseInt(self.accountId(req));

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed){
            if(isAllowed !== true) {
                return self.send403(resp);
            } else {
                var created = {date: new Date(), by:self.userId(req)};
                ssbManager.createPage(accountId, websiteId, templateId, created, function(err, page){
                    self.log.debug('<< createPage');
                    return self.sendResultOrError(resp, err, page, "Error creating page");
                });
            }
        });

    },

    getPage: function(req, resp) {
        var self = this;
        self.log.debug('>> getPage');
        var accountId = parseInt(self.accountId(req));
        var pageId = req.params.id;

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                ssbManager.getPage(accountId, pageId, function(err, page){
                    self.log.debug('<< getPage');
                    return self.sendResultOrError(resp, err, page, "Error fetching page");
                });
            }
        });
    },

    updatePage: function(req, resp) {
        var self = this;
        self.log.debug('>> updatePage');
        var accountId = parseInt(self.accountId(req));
        var pageId = req.params.id;
        var updatedPage = new $$.m.ssb.Page(req.body);
        updatedPage.set('_id', pageId);//make sure we don't change the ID

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                var modified = {date: new Date(), by:self.userId(req)};
                ssbManager.updatePage(accountId, pageId, updatedPage, modified, function(err, page){
                    self.log.debug('<< getPage');
                    return self.sendResultOrError(resp, err, page, "Error fetching page");
                });
            }
        });
    }



});

module.exports = new api({version:'2.0'});

