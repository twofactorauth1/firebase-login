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

        app.get(this.url('themes'), this.isAuthAndSubscribedApi.bind(this), this.listThemes.bind(this));//list
        app.get(this.url('themes/:id'), this.isAuthAndSubscribedApi.bind(this), this.getTheme.bind(this));//get
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
        app.get(this.url('websites'), this.isAuthAndSubscribedApi.bind(this), this.listWebsites.bind(this));//get default (0th) website for current account
        app.get(this.url('websites/:id'), this.isAuthAndSubscribedApi.bind(this), this.getWebsite.bind(this));//get
        app.post(this.url('websites'), this.isAuthAndSubscribedApi.bind(this), this.createWebsite.bind(this));//create
        app.post(this.url('websites/:id'), this.isAuthAndSubscribedApi.bind(this), this.updateWebsite.bind(this));//update
        app.delete(this.url('websites/:id'), this.isAuthAndSubscribedApi.bind(this), this.noop.bind(this));//delete

        app.get(this.url('websites/:id/theme'), this.isAuthAndSubscribedApi.bind(this), this.noop.bind(this));//get theme

        //PAGE
        app.get(this.url('websites/:id/pages'), this.isAuthAndSubscribedApi.bind(this), this.listPages.bind(this));//get pages
        app.post(this.url('websites/:id/page'), this.isAuthAndSubscribedApi.bind(this), this.createPage.bind(this));//create page
        app.get(this.url('pages/:id'), this.isAuthAndSubscribedApi.bind(this), this.getPage.bind(this));//get page
        app.post(this.url('pages/:id'), this.isAuthAndSubscribedApi.bind(this), this.updatePage.bind(this));//update page
        app.delete(this.url('pages/:id'), this.isAuthAndSubscribedApi.bind(this), this.noop.bind(this));//delete page

        app.get(this.url('pages/:id/template'), this.isAuthAndSubscribedApi.bind(this), this.noop.bind(this));//get page template
        //app.post(this.url('pages/:id/template/:templateId'), this.isAuthAndSubscribedApi.bind(this), this.noop.bind(this));//set page template

        app.get(this.url('pages/:id/versions'), this.isAuthAndSubscribedApi.bind(this), this.noop.bind(this));//get page versions
        app.post(this.url('pages/:id/version/:versionId'), this.isAuthAndSubscribedApi.bind(this), this.noop.bind(this));//revert page to version


        // COMPONENTS
        app.get(this.url('components'), this.isAuthAndSubscribedApi.bind(this), this.listComponents.bind(this)); //get components

        // SECTIONS
        app.get(this.url('sections'), this.isAuthAndSubscribedApi.bind(this), this.listAllSections.bind(this)); // list sections
        app.get(this.url('sections/all'), this.isAuthAndSubscribedApi.bind(this), this.listAllSections.bind(this));
        app.get(this.url('sections/platform'), this.isAuthAndSubscribedApi.bind(this), this.listPlatformSections.bind(this));
        app.get(this.url('sections/user'), this.isAuthAndSubscribedApi.bind(this), this.listAccountSections.bind(this));
        app.get(this.url('sections/:id'), this.isAuthAndSubscribedApi.bind(this), this.getSection.bind(this));
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

    listWebsites: function(req, resp) {
        var self = this;
        self.log.debug('>> listWebsites');
        var accountId = parseInt(self.accountId(req));

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed){
            if(isAllowed !== true) {
                return self.send403(resp);
            } else {
                ssbManager.listWebsites(accountId, function(err, websites){
                    self.log.debug('<< listWebsites');
                    return self.sendResultOrError(resp, err, websites, "Error getting websites");
                });
            }
        });
    },

    getWebsite: function(req, resp) {
        var self = this;
        self.log.debug('>> getWebsite');
        var accountId = parseInt(self.accountId(req));
        var websiteId = req.params.id;

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed){
            if(isAllowed !== true) {
                return self.send403(resp);
            } else {
                ssbManager.getWebsite(accountId, websiteId, function(err, website){
                    self.log.debug('<< getWebsite');
                    return self.sendResultOrError(resp, err, website, "Error getting websites");
                });
            }
        });
    },

    updateWebsite: function(req, resp) {
        var self = this;
        self.log.debug('>> updateWebsite');
        var accountId = parseInt(self.accountId(req));
        var websiteId = req.params.id;
        var modifiedWebsite = req.body;
        var modified = {date: new Date(), by: self.userId(req)};

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                ssbManager.updateWebsite(accountId, websiteId, modified, modifiedWebsite, function(err, website){
                    self.log.debug('<< updateWebsite');
                    return self.sendResultOrError(resp, err, website, "Error updating website");
                });
            }
        });
    },

    listPages: function(req, resp) {
        var self = this;
        self.log.debug('>> listPages');
        var accountId = parseInt(self.accountId(req));
        var websiteId = req.params.id;

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                ssbManager.listPages(accountId, websiteId, function(err, pages){
                    self.log.debug('<< listPages');
                    return self.sendResultOrError(resp, err, pages, "Error listing pages");
                });
            }
        });
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
    },



    listAccountSections: function(req, resp) {
        var self = this;
        self.log.debug('>> listSections');

        var accountId = parseInt(self.accountId(req));
        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                ssbManager.listAccountSectionSummaries(accountId, function(err, sections){
                    self.log.debug('<< listSections');
                    return self.sendResultOrError(resp, err, sections, "Error listing sections");
                });
            }
        });
    },

    getSection: function(req, resp) {
        var self = this;
        self.log.debug('>> getSection');

        var accountId = parseInt(self.accountId(req));
        var sectionId = req.params.id;
        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                ssbManager.getSection(accountId, sectionId, function(err, sections){
                    self.log.debug('<< getSection');
                    return self.sendResultOrError(resp, err, sections, "Error getting section");
                });
            }
        });
    },

    listAllSections: function(req, resp) {
        var self = this;
        self.log.debug('>> listAllSections');

        var accountId = parseInt(self.accountId(req));
        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                ssbManager.listAllSectionSummaries(accountId, function(err, sections){
                    self.log.debug('<< listAllSections');
                    return self.sendResultOrError(resp, err, sections, "Error listing sections");
                });
            }
        });
    },

    listPlatformSections: function(req, resp) {
        var self = this;
        self.log.debug('>> listPlatformSections');

        var accountId = parseInt(self.accountId(req));
        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                ssbManager.listPlatformSectionSummaries(accountId, function(err, sections){
                    self.log.debug('<< listPlatformSections');
                    return self.sendResultOrError(resp, err, sections, "Error listing sections");
                });
            }
        });
    },

    listComponents: function(req, resp) {
        var self = this;
        self.log.debug('>> listComponents');

        var accountId = parseInt(self.accountId(req));
        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                ssbManager.listComponents(accountId, function(err, components){
                    self.log.debug('<< listComponents');
                    return self.sendResultOrError(resp, err, components, "Error listing components");
                });
            }
        });
    }



});

module.exports = new api({version:'2.0'});

