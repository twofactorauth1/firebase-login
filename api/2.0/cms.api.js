/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2015
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../base.api.js');



var request = require('request');
var ssbManager = require('../../ssb/ssb_manager');
var pageDao = require('../../ssb/dao/page.dao');


var api = function () {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "cms",

    version: "2.0",

    dao: pageDao,

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
        app.post(this.url('pages/:id/publish'), this.isAuthAndSubscribedApi.bind(this), this.publishPage.bind(this));//publish page
        app.delete(this.url('pages/:id'), this.isAuthAndSubscribedApi.bind(this), this.deletePage.bind(this));//delete page
        app.post(this.url('websites/:websiteId/duplicate/page'), this.isAuthAndSubscribedApi.bind(this), this.createDuplicatePage.bind(this));//create duplicate page

        app.get(this.url('pages/:id/template'), this.isAuthAndSubscribedApi.bind(this), this.noop.bind(this));//get page template
        //app.post(this.url('pages/:id/template/:templateId'), this.isAuthAndSubscribedApi.bind(this), this.noop.bind(this));//set page template

        app.get(this.url('pages/:id/versions'), this.isAuthAndSubscribedApi.bind(this), this.getPageVersions.bind(this));//get page versions
        app.post(this.url('pages/:id/version/:versionId'), this.isAuthAndSubscribedApi.bind(this), this.revertPage.bind(this));//revert page to version


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

        // ssb blog posts
        app.post(this.url('blog/post'), this.isAuthAndSubscribedApi.bind(this), this.createBlogPost.bind(this));
        app.put(this.url('blog/post/:postId'), this.isAuthAndSubscribedApi.bind(this), this.updateBlogPost.bind(this));
        app.delete(this.url('blog/post/:postId'), this.isAuthAndSubscribedApi.bind(this), this.deleteBlogPost.bind(this));
        app.post(this.url('blog/duplicate/post'), this.isAuthAndSubscribedApi.bind(this), this.createDuplicatePost.bind(this));
        app.get(this.url('blog/post/:postId'), this.setup.bind(this), this.getBlogPost.bind(this));

        app.post(this.url('websites/:id/updateBlogPages'), this.isAuthAndSubscribedApi.bind(this), this.updateBlogPages.bind(this));

        app.post(this.url('websites/:id/userScripts'), this.isAuthAndSubscribedApi.bind(this), this.updateScriptResource.bind(this));

        app.put(this.url('email/:id'), this.isAuthAndSubscribedApi.bind(this), this.updateEmail.bind(this));

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
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> deletePage');
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
                        self.log.debug(accountId, userId, '<< deletePage');
                        self.send200(resp);
                        self.createUserActivity(req, 'DELETE_PAGE', null, {pageId: pageId}, function(){});
                    }
                });
            }
        });
    },

    listTemplates: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> listTemplates');


        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed){
            if(isAllowed !== true) {
                return self.send403(resp);
            } else {
                ssbManager.listTemplates(accountId, function(err, list){
                    self.log.debug(accountId, userId, '<< listTemplates');
                    return self.sendResultOrError(resp, err, list, "Error listing templates");
                });
            }
        });

    },

    getTemplate: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> getTemplate');

        var templateId = req.params.id;
        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed){
            if(isAllowed !== true) {
                return self.send403(resp);
            } else {
                ssbManager.getTemplate(accountId, userId, templateId, function(err, template){
                    self.log.debug(accountId, userId, '<< getTemplate');
                    return self.sendResultOrError(resp, err, template, "Error getting template");
                });
            }
        });
    },

    listThemes: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> listThemes');

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed){
            if(isAllowed !== true) {
                return self.send403(resp);
            } else {
                ssbManager.listThemes(accountId, function(err, themes){
                    self.log.debug(accountId, userId, '<< listThemes');
                    return self.sendResultOrError(resp, err, themes, "Error listing themes");
                });
            }
        });
    },

    getTheme: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> getTheme');

        var themeId = req.params.id;
        self.log.debug('themeId:', themeId);
        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed){
            if(isAllowed !== true) {
                return self.send403(resp);
            } else {
                ssbManager.getTheme(accountId, userId, themeId, function(err, theme){
                    self.log.debug(accountId, userId, '<< getTheme');
                    return self.sendResultOrError(resp, err, theme, "Error getting theme");
                });
            }
        });
    },

    createWebsite: function(req, resp) {

    },

    listWebsites: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> listWebsites');


        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed){
            if(isAllowed !== true) {
                return self.send403(resp);
            } else {
                ssbManager.listWebsites(accountId, function(err, websites){
                    self.log.debug(accountId, userId, '<< listWebsites');
                    return self.sendResultOrError(resp, err, websites, "Error getting websites");
                });
            }
        });
    },

    getWebsite: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> getWebsite');

        var websiteId = req.params.id;

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed){
            if(isAllowed !== true) {
                return self.send403(resp);
            } else {
                ssbManager.getWebsite(accountId, websiteId, function(err, website){
                    self.log.debug(accountId, userId, '<< getWebsite');
                    return self.sendResultOrError(resp, err, website, "Error getting websites");
                });
            }
        });
    },

    updateWebsite: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> updateWebsite');

        var websiteId = req.params.id;
        var modifiedWebsite = new $$.m.ssb.Website(req.body);
        var modified = {date: new Date(), by: userId};

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                ssbManager.updateWebsite(accountId, websiteId, modified, modifiedWebsite, function(err, website){
                    self.log.debug(accountId, userId, '<< updateWebsite');
                    self.sendResultOrError(resp, err, website, "Error updating website");
                    return self.createUserActivity(req, 'UPDATE_WEBSITE', null, {_id:websiteId}, function(){});
                });
            }
        });
    },

    listPages: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> listPages');

        var websiteId = req.params.id;

        ssbManager.listPages(accountId, websiteId, function(err, pages){
            self.log.debug(accountId, userId, '<< listPages');
            return self.sendResultOrError(resp, err, pages, "Error listing pages");
        });
    },

    createPage: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> createPage');

        var templateId = req.body.templateId;
        var websiteId = req.params.id;


        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed){
            if(isAllowed !== true) {
                return self.send403(resp);
            } else {
                var created = {date: new Date(), by:userId};
                ssbManager.createPage(accountId, websiteId, templateId, created, function(err, page){
                    self.log.debug(accountId, userId, '<< createPage');
                    self.sendResultOrError(resp, err, page, "Error creating page");
                    self.createUserActivity(req, 'CREATE_PAGE', null, {pageId: page._id}, function(){});
                });
            }
        });

    },

    createDuplicatePage: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> createDuplicatePage');
        var _page = req.body;
        // Delete _id of the existing page;
        delete _page._id;
        var duplicatePage = new $$.m.ssb.Page(req.body);


        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed){
            if(isAllowed !== true) {
                return self.send403(resp);
            } else {
                var created = {date: new Date(), by:self.userId(req)};
                ssbManager.createDuplicatePage(accountId, duplicatePage, created, function(err, page){
                    self.log.debug(accountId, userId, '<< createDuplicatePage');
                    self.sendResultOrError(resp, err, page, "Error creating page");
                    self.createUserActivity(req, 'CREATE_DUPLICATE_PAGE', null, {pageId: page._id}, function(){});
                });
            }
        });

    },

    getPage: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> getPage');

        var pageId = req.params.id;

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                ssbManager.getPage(accountId, pageId, function(err, page){
                    self.log.debug(accountId, userId, '<< getPage');
                    return self.sendResultOrError(resp, err, page, "Error fetching page");
                });
            }
        });
    },

    updatePage: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> updatePage');

        var pageId = req.params.id;
        var _page = req.body;
        var homePage = _page.homePage;
        delete _page.homePage;
        var updatedPage = new $$.m.ssb.Page(_page);

        updatedPage.set('_id', pageId);//make sure we don't change the ID

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                var modified = {date: new Date(), by:self.userId(req)};
                var now = moment();
                ssbManager.updatePage(accountId, pageId, updatedPage, modified, homePage, self.userId(req), function(err, page){
                    var duration = moment().diff(now);
                    self.log.debug(accountId, userId, '<< updatePage [' + duration + ']');
                    self.sendResultOrError(resp, err, page, "Error updating page");
                    self.createUserActivity(req, 'UPDATE_PAGE', null, {pageId: pageId}, function(){});
                });
            }
        });
    },

    publishPage: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> publishPage');

        var pageId = req.params.id;
        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                ssbManager.publishPage(accountId, pageId, self.userId(req), function(err, page){
                    self.log.debug(accountId, userId, '<< publishPage');
                    self.sendResultOrError(resp, err, page, "Error publishing page");
                    self.createUserActivity(req, 'PUBLISH_PAGE', null, {pageId: pageId}, function(){});
                });
            }
        });

    },

    listAccountSections: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> listSections');


        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                ssbManager.listAccountSectionSummaries(accountId, function(err, sections){
                    self.log.debug(accountId, userId, '<< listSections');
                    return self.sendResultOrError(resp, err, sections, "Error listing sections");
                });
            }
        });
    },

    getSection: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> getSection');


        var sectionId = req.params.id;
        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                ssbManager.getSection(accountId, sectionId, function(err, sections){
                    self.log.debug(accountId, userId, '<< getSection');
                    return self.sendResultOrError(resp, err, sections, "Error getting section");
                });
            }
        });
    },

    listAllSections: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> listAllSections');


        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                ssbManager.listAllSectionSummaries(accountId, function(err, sections){
                    self.log.debug(accountId, userId, '<< listAllSections');
                    return self.sendResultOrError(resp, err, sections, "Error listing sections");
                });
            }
        });
    },

    listPlatformSections: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> listPlatformSections');


        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                ssbManager.listPlatformSectionSummaries(accountId, function(err, sections){
                    self.log.debug(accountId, userId, '<< listPlatformSections');
                    return self.sendResultOrError(resp, err, sections, "Error listing sections");
                });
            }
        });
    },

    listComponents: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> listComponents');


        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                ssbManager.listComponents(accountId, function(err, components){
                    self.log.debug(accountId, userId, '<< listComponents');
                    return self.sendResultOrError(resp, err, components, "Error listing components");
                });
            }
        });
    },

    getPageByHandle: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.currentAccountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> getPageByHandle');
        var websiteId = req.params.id;
        var pageHandle = req.params.handle;

        ssbManager.getPageByHandle(accountId, pageHandle, websiteId, function(err, value){
            if (!value) {
                err = $$.u.errors._404_PAGE_NOT_FOUND;
            }

            self.log.debug(accountId, userId, '<< getPageByHandle');
            self.sendResultOrError(resp, err, value, "Error Retrieving Page for Website", err);
        });

    },

    listPagesWithSections: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> listPagesWithSections');
        var websiteId = req.params.id;

        ssbManager.listPagesWithSections(accountId, websiteId, function(err, pages){
            self.log.debug(accountId, userId, '<< listPagesWithSections');
            return self.sendResultOrError(resp, err, pages, "Error listing pages");
        });
    },

    listSiteTemplates: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> listSiteTemplates');

        ssbManager.listSiteTemplates(accountId, function(err, templates){
            self.log.debug(accountId, userId, '<< listSiteTemplates');
            return self.sendResultOrError(resp, err, templates, "Error listing Site Templates");
        });
    },

    getSiteTemplate: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> getSiteTemplate');
        var siteTemplateId = req.params.id;

        ssbManager.getSiteTemplate(accountId, siteTemplateId, function(err, template){
            self.log.debug(accountId, userId, '<< getSiteTemplate');
            return self.sendResultOrError(resp, err, template, "Error getting Site Template");
        });
    },

    setSiteTemplate: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> setSiteTemplate');
        var websiteId = req.params.id;
        var siteTemplateId = req.params.siteTemplateId;
        var siteThemeId = req.body.siteThemeId;
        var siteThemeOverrides = req.body.siteThemeOverrides;
        var created = {
            date: new Date(),
            by: userId
        };

        self.log.debug(accountId, userId, 'siteThemeId', siteThemeId);

        ssbManager.setSiteTemplate(accountId, siteTemplateId, siteThemeId, siteThemeOverrides, websiteId, created, function(err, value){
            self.log.debug(accountId, userId, '<< setSiteTemplate');
            return self.sendResultOrError(resp, err, value, "Error setting Site Template");
        });
    },

    getPageVersions: function (req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> getPageVersions');
        var pageId = req.params.id;
        ssbManager.getPageVersions(pageId, 'all', function (err, versions) {
            self.log.debug(accountId, userId, '<< getPageVersions');
            return self.sendResultOrError(resp, err, versions, "Error getting versions of a page");
        });
    },

    revertPage: function (req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> revertPage');
        var pageId = req.params.id;
        var versionId = parseInt(req.params.versionId);
        //accountId, pageId, version, userId
        ssbManager.revertPage(accountId, pageId, versionId, userId, function (err, revertedPage) {
            self.log.debug(accountId, userId, '<< getPageVersions');
            self.sendResultOrError(resp, err, revertedPage, "Error reverting page");
            self.createUserActivity(req, 'REVERT_PAGE', null, {pageId: pageId}, function(){});
        });
    },

    //BLOG POSTS
    createBlogPost: function(req, res) {

        var self = this;
        self.log.debug('>> createBlogPost');
        var blog=req.body;

        var userId = self.userId(req);

        var blogPost = new $$.m.BlogPost(blog);

        var accountId = parseInt(self.accountId(req));

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                blogPost.set('accountId', accountId);
                var created = {date: new Date(), by:self.userId(req)};
                blogPost.set('created', created);
                blogPost.set('modified', created);
                if(!blogPost.attributes.publish_date)
                    blogPost.attributes.publish_date = moment().format('MM/DD/YYYY');
                self.log.debug('<< Publish Date is' + blogPost.attributes.publish_date);
                ssbManager.createBlogPost(accountId, userId, blogPost, function (err, value) {
                    self.log.debug('<< createBlogPost' + JSON.stringify(blogPost));
                    self.sendResultOrError(res, err, value, "Error creating Blog Post");
                    self.createUserActivity(req, 'CREATE_BLOGPOST', null, null, function(){});
                    self = null;
                });
            }
        });


    },
    updateBlogPost: function(req, res) {

        var self = this;
        self.log.debug('>> updateBlogPost');
        var blogPost = new $$.m.BlogPost(req.body);
        var postId = req.params.postId;
        var accountId = parseInt(self.accountId(req));

        blogPost.set('accountId', accountId);
        blogPost.set('_id', postId);

        var userId = self.userId(req);


        // console.dir(req.body);

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                blogPost.set('accountId', accountId);
                blogPost.set('_id', postId);
                var modified = {date: new Date(), by:self.userId(req)};
                blogPost.set('modified', modified);
                // console.dir(req.body);

                ssbManager.updateBlogPost(accountId, userId, blogPost, function (err, value) {
                    self.log.debug('<< updateBlogPost');
                    self.sendResultOrError(res, err, value, "Error updating Blog Post");
                    self.createUserActivity(req, 'UPDATE_BLOGPOST', null, null, function(){});
                    self = null;
                });
            }
        });

    },

    deleteBlogPost: function(req, res) {
        var self = this;
        self.log.debug('>> deleteBlogPost');
        var accountId = parseInt(self.accountId(req));

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                var blogPostId = req.params.postId;
                self.log.debug('deleting post with id: ' + blogPostId);

                ssbManager.deleteBlogPost(accountId, blogPostId, function (err, value) {
                    self.log.debug('<< deleteBlogPost');
                    self.sendResultOrError(res, err, {deleted:true}, "Error deleting Blog Post");
                    self.createUserActivity(req, 'DELETE_BLOGPOST', null, null, function(){});
                    self = null;
                });
            }
        });
    },

    createDuplicatePost: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> createDuplicatePage');
        var blog = req.body;
        // Delete _id of the existing post;
        delete blog._id;
        var blogPost = new $$.m.BlogPost(blog);
        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed) {
            if(isAllowed !== true) {
                return self.send403(resp);
            } else {
                var created = {date: new Date(), by:self.userId(req)};
                blogPost.set('accountId', accountId);
                blogPost.set('created', created);
                blogPost.set('modified', created);
                ssbManager.createDuplicatePost(accountId, blogPost, function(err, post){
                    self.log.debug(accountId, userId, '<< createDuplicatePost');
                    self.sendResultOrError(resp, err, post, "Error creating post");
                    self.createUserActivity(req, 'CREATE_BLOGPOST', null, {postId: post._id}, function(){});
                });
            }
        });

    },

    getBlogPost: function(req, res) {

        var self = this;
        self.log.debug('>> getBlogPost');
        var accountId = parseInt(self.accountId(req));
        var blogPostId = req.params.postId;
        self.log.debug('Account ID: ' + accountId + ' Blog Post ID: ' + blogPostId);



        ssbManager.getBlogPost(accountId, blogPostId, function (err, value) {
            self.log.debug('<< getBlogPost');
            self.sendResultOrError(res, err, value, "Error getting Blog Post");
            self = null;
        });
    },

    updateBlogPages: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> updateBlogPages');

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed) {
            if(isAllowed !== true) {
                return self.send403(resp);
            } else {
                ssbManager.updateBlogPages(accountId, userId, function(err, account){
                    self.log.debug(accountId, userId, '<< updateBlogPages');
                    self.sendResultOrError(resp, err, account, "Error updating blog pages");
                });
            }
        });

    },

    updateScriptResource: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> updateScriptResource');

        var websiteId = req.params.id;
        var modifiedWebsite = new $$.m.ssb.Website(req.body);
        var modified = {date: new Date(), by: userId};

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                ssbManager.updateScriptResource(accountId, websiteId, modified, modifiedWebsite, function(err, website){
                    self.log.debug(accountId, userId, '<< updateScriptResource');
                    self.sendResultOrError(resp, err, website, "Error updating script resource");
                    return self.createUserActivity(req, 'UPDATE_WEBSITE_SCRIPT_RESOURCE', null, {_id:websiteId}, function(){});
                });
            }
        });
    },

    updateEmail: function (req, res) {
        var self = this;
        self.log.debug('>> updateEmail');

        var accountId = parseInt(self.accountId(req));

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                var emailObj = req.body;
                self.log.debug('>> email body');
                var email = require('../../cms/model/email');

                if (email != null) {
                    self.log.debug('>> email not null');
                    email = new $$.m.cms.Email(emailObj);
                    var emailId = req.params.id;
                    var accountId = parseInt(self.accountId(req));
                    email.set('accountId', accountId);
                    email.attributes.modified.date = new Date();
                    self.log.debug('>> email updated');
                    ssbManager.updateEmail(email, emailId, function (err, value) {
                        self.log.debug('<< updateEmail');
                        self.sendResultOrError(res, err, value, "Error updating Email");

                        self.createUserActivity(req, 'UPDATE_EMAIL', null, null, function(){});
                    });
                } else {
                    self.log.error('Cannot update null email.');
                    self.wrapError(res, 400, 'Bad Parameter', 'Cannot update a null email.');
                    self = null;
                }
            }
        });

    }

});

module.exports = new api({version:'2.0'});
