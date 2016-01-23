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
var pageCacheManager = require('../../cms/pagecache_manager');

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

        // SITE TEMPLATES
        app.get(this.url('sitetemplates'), this.isAuthAndSubscribedApi.bind(this), this.listSiteTemplates.bind(this));
        app.get(this.url('sitetemplates/:id'), this.isAuthAndSubscribedApi.bind(this), this.getSiteTemplate.bind(this));

        // WEBSITE - work with website objects
        app.get(this.url('websites'), this.isAuthAndSubscribedApi.bind(this), this.listWebsites.bind(this));//get default (0th) website for current account
        app.get(this.url('websites/:id'), this.isAuthAndSubscribedApi.bind(this), this.getWebsite.bind(this));//get
        app.post(this.url('websites'), this.isAuthAndSubscribedApi.bind(this), this.createWebsite.bind(this));//create
        app.post(this.url('websites/:id'), this.isAuthAndSubscribedApi.bind(this), this.updateWebsite.bind(this));//update
        app.delete(this.url('websites/:id'), this.isAuthAndSubscribedApi.bind(this), this.noop.bind(this));//delete

        app.get(this.url('websites/:id/theme'), this.isAuthAndSubscribedApi.bind(this), this.noop.bind(this));//get theme
        app.post(this.url('websites/:id/sitetemplates/:siteTemplateId'), this.isAuthAndSubscribedApi.bind(this), this.setSiteTemplate.bind(this));

        //PAGE
        app.get(this.url('websites/:id/pages'), this.isAuthAndSubscribedApi.bind(this), this.listPages.bind(this));//get pages
        app.post(this.url('websites/:id/page'), this.isAuthAndSubscribedApi.bind(this), this.createPage.bind(this));//create page
        app.get(this.url('pages/:id'), this.isAuthAndSubscribedApi.bind(this), this.getPage.bind(this));//get page
        app.post(this.url('pages/:id'), this.isAuthAndSubscribedApi.bind(this), this.updatePage.bind(this));//update page
        app.delete(this.url('pages/:id'), this.isAuthAndSubscribedApi.bind(this), this.deletePage.bind(this));//delete page
        app.post(this.url('websites/:websiteId/duplicate/page'), this.isAuthAndSubscribedApi.bind(this), this.createDuplicatePage.bind(this));//create duplicate page

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


        //LEGACY SUPPORT
        app.get(this.url('website/:id/page/:handle'), this.setup.bind(this), this.getPageByHandle.bind(this));
        app.get(this.url('website/:id/pages'), this.setup.bind(this), this.listPagesWithSections.bind(this));//get pages
    },

    noop: function(req, resp) {
        var self = this;
        self.log.debug('>> noop');
        var accountId = parseInt(self.accountId(req));
        self.log.debug('<< noop');
        self.sendResult(resp, {msg:'method not implemented'});
    },

    deletePage: function(req, resp) {

        var self = this;
        self.log.debug('>> deletePage');
        var accountId = parseInt(self.accountId(req));

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                var pageId = req.params.id;
                
                ssbManager.deletePage(pageId, accountId, function (err, page) {
                    if(err) {
                        self.wrapError(resp, 500, err, "Error deleting page");
                    } else {
                        self.send200(resp);
                    }
                });
            }
        });
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
        self.log.debug('themeId:', themeId);
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
        var modifiedWebsite = new $$.m.ssb.Website(req.body);
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

        ssbManager.listPages(accountId, websiteId, function(err, pages){
            self.log.debug('<< listPages');
            return self.sendResultOrError(resp, err, pages, "Error listing pages");
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

    createDuplicatePage: function(req, resp) {
        var self = this;
        self.log.debug('>> createDuplicatePage');
        var _page = req.body;
        // Delete _id of the existing page;
        delete _page._id;
        var duplicatePage = new $$.m.ssb.Page(req.body);
        var accountId = parseInt(self.accountId(req));

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed){
            if(isAllowed !== true) {
                return self.send403(resp);
            } else {
                var created = {date: new Date(), by:self.userId(req)};
                ssbManager.createDuplicatePage(accountId, duplicatePage, created, function(err, page){
                    self.log.debug('<< createDuplicatePage');
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
                    self.log.debug('<< updatePage');
                    self.sendResultOrError(resp, err, page, "Error fetching page");
                    pageCacheManager.updateS3Template(accountId, null, pageId, function(err, value){});
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
    },

    getPageByHandle: function(req, resp) {
        var self = this;
        self.log.debug('>> getPageByHandle');
        var websiteId = req.params.id;
        var pageHandle = req.params.handle;
        var accountId = parseInt(self.currentAccountId(req));

        ssbManager.getPageByHandle(accountId, pageHandle, websiteId, function(err, value){
            if (!value) {
                err = $$.u.errors._404_PAGE_NOT_FOUND;
            }

            self.log.debug('<< getPageByHandle');
            self.sendResultOrError(resp, err, value, "Error Retrieving Page for Website", err);
            self = null;
        });

    },

    listPagesWithSections: function(req, resp) {
        var self = this;
        self.log.debug('>> listPagesWithSections');
        var accountId = parseInt(self.accountId(req));
        var websiteId = req.params.id;

        ssbManager.listPagesWithSections(accountId, websiteId, function(err, pages){
            self.log.debug('<< listPagesWithSections');
            return self.sendResultOrError(resp, err, pages, "Error listing pages");
        });
    },

    listSiteTemplates: function(req, resp) {
        var self = this;
        self.log.debug('>> listSiteTemplates');
        var accountId = parseInt(self.accountId(req));

        ssbManager.listSiteTemplates(accountId, function(err, templates){
            self.log.debug('<< listSiteTemplates');
            return self.sendResultOrError(resp, err, templates, "Error listing Site Templates");
        });
    },

    getSiteTemplate: function(req, resp) {
        var self = this;
        self.log.debug('>> getSiteTemplate');
        var accountId = parseInt(self.accountId(req));
        var siteTemplateId = req.params.id;

        ssbManager.getSiteTemplate(accountId, siteTemplateId, function(err, template){
            self.log.debug('<< getSiteTemplate');
            return self.sendResultOrError(resp, err, template, "Error getting Site Template");
        });
    },

    setSiteTemplate: function(req, resp) {
        var self = this;
        self.log.debug('>> setSiteTemplate');
        var accountId = parseInt(self.accountId(req));
        var websiteId = req.params.id;
        var siteTemplateId = req.params.siteTemplateId;
        var siteThemeId = req.params.siteThemeId;
        var created = {
            date: new Date(),
            by: self.userId(req)
        };

        self.log.debug('siteThemeId', siteThemeId)

        ssbManager.setSiteTemplate(accountId, siteTemplateId, siteThemeId, websiteId, created, function(err, value){
            self.log.debug('<< setSiteTemplate');
            return self.sendResultOrError(resp, err, value, "Error setting Site Template");
        });
    }



});

module.exports = new api({version:'2.0'});

