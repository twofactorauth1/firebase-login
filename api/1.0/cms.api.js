/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../base.api.js');

//TODO: there shouldn't be DAO references here

var cmsDao = require('../../cms/dao/cms.dao.js');

var Page = require('../../cms/model/page');
//var Components = require('../../cms/model/components');


var cmsManager = require('../../cms/cms_manager');

var api = function () {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "cms",

    dao: cmsDao,

    initialize: function () {
        // WEBSITE
        //app.get(this.url('website/:id'), this.isAuthApi, this.getWebsiteById.bind(this));
        app.get(this.url('website/:id'), this.getWebsiteById.bind(this)); //Temp Added
        app.get(this.url(':accountid/cms/website', "account"), this.isAuthApi, this.getWebsiteForAccountId.bind(this));
        app.post(this.url('website'), this.isAuthAndSubscribedApi.bind(this), this.saveOrUpdateWebsite.bind(this));
        app.put(this.url('website'), this.isAuthAndSubscribedApi.bind(this), this.saveOrUpdateWebsite.bind(this));

        // WEBSITE LINKS
        app.get(this.url('website/:id/linklists'), this.isAuthApi, this.getWebsiteLinklists.bind(this));
        app.get(this.url('website/:id/linklists/:handle'), this.isAuthApi, this.getWebsiteLinklistsByHandle.bind(this));
        app.post(this.url('website/:id/linklists'), this.isAuthApi, this.addWebsiteLinklists.bind(this));
        app.post(this.url('website/:id/linklists/:handle'), this.isAuthAndSubscribedApi.bind(this), this.updateWebsiteLinklists.bind(this));
        app.delete(this.url('website/:id/linklists/:handle'), this.isAuthAndSubscribedApi.bind(this), this.deleteWebsiteLinklists.bind(this));

        // PAGE
        app.get(this.url('website/:websiteid/page/:handle'), this.getPageByHandle.bind(this));
        app.get(this.url('page/:id'), this.getPageById.bind(this));
        app.put(this.url('page'), this.isAuthApi, this.saveOrUpdatePage.bind(this));


        //consistent URLs

        app.get(this.url('website/:websiteId/pages/:id'), this.getPagesById.bind(this));
        app.get(this.url('website/:websiteId/pages'), this.getAllPages.bind(this));
        app.get(this.url('website/:websiteId/page/:id'), this.getPageById.bind(this));
        app.post(this.url('website/:websiteId/page'), this.isAuthAndSubscribedApi.bind(this), this.createPage.bind(this));
        app.post(this.url('website/:websiteId/page/:id'), this.isAuthAndSubscribedApi.bind(this), this.updatePage.bind(this));
        app.put(this.url('website/:websiteId/page'), this.isAuthAndSubscribedApi.bind(this), this.createPage.bind(this));
        app.put(this.url('website/:websiteId/page/:id'), this.isAuthAndSubscribedApi.bind(this), this.updatePage.bind(this));
        app.delete(this.url('website/:websiteId/page/:id/:label'), this.isAuthAndSubscribedApi.bind(this), this.deletePage.bind(this));


        //THEME Updated URLs

        app.get(this.url('theme'), this.isAuthApi, this.listThemes.bind(this));
        app.get(this.url('theme/:id'), this.isAuthApi, this.getThemeById.bind(this));
        app.get(this.url('theme/name/:name'), this.isAuthApi, this.getThemeByName.bind(this));
        app.post(this.url('theme'), this.isAuthAndSubscribedApi.bind(this), this.createTheme.bind(this));
        app.post(this.url('theme/website/:websiteId'), this.isAuthAndSubscribedApi.bind(this), this.createThemeFromWebsite.bind(this));
        app.post(this.url('theme/:id'), this.isAuthAndSubscribedApi.bind(this), this.updateTheme.bind(this));
        app.delete(this.url('theme/:id'), this.isAuthAndSubscribedApi.bind(this), this.deleteTheme.bind(this));
        app.put(this.url('theme/:id/website'), this.isAuthAndSubscribedApi.bind(this), this.createWebsiteFromTheme.bind(this));
        app.post(this.url('theme/:id/website/:websiteId/page/:handle'), this.isAuthAndSubscribedApi.bind(this), this.createPageFromTheme.bind(this));
        app.post(this.url('theme/:themeId/website/:websiteId'), this.isAuthApi, this.setTheme.bind(this));


        // COMPONENTS
        app.get(this.url('page/:id/components'), this.isAuthAndSubscribedApi.bind(this), this.getComponentsByPage.bind(this));
        app.get(this.url('page/:id/components/type/:type'), this.isAuthAndSubscribedApi.bind(this), this.getComponentsByType.bind(this));
        app.post(this.url('page/:id/components'), this.isAuthAndSubscribedApi.bind(this), this.addComponentToPage.bind(this));
        app.post(this.url('page/:id/components/all'), this.isAuthAndSubscribedApi.bind(this), this.updateAllComponents.bind(this));
        app.put(this.url('page/:id/components/:componentId'), this.isAuthAndSubscribedApi.bind(this), this.updateComponent.bind(this));
        app.post(this.url('page/:id/components/:componentId'), this.isAuthAndSubscribedApi.bind(this), this.updateComponent.bind(this));
        app.delete(this.url('page/:id/components/:componentId'), this.isAuthAndSubscribedApi.bind(this), this.deleteComponent.bind(this));
        app.post(this.url('page/:id/components/:componentId/order/:newOrder'), this.isAuthAndSubscribedApi.bind(this), this.updateComponentOrder.bind(this));
        app.get(this.url('component/:type/versions'), this.isAuthAndSubscribedApi.bind(this), this.getAvailableComponentVersions.bind(this));

        // BLOG POSTS
        app.post(this.url('page/:id/blog'), this.isAuthAndSubscribedApi.bind(this), this.createBlogPost.bind(this));
        app.get(this.url('page/:id/blog'), this.setup, this.listBlogPostsByPageId.bind(this));
        app.get(this.url('blog'), this.setup, this.listBlogPosts.bind(this));
        app.get(this.url('page/:id/blog/:postId'), this.setup, this.getBlogPost.bind(this));
        app.post(this.url('page/:id/blog/:postId'), this.isAuthAndSubscribedApi.bind(this), this.updateBlogPost.bind(this));
        app.put(this.url('page/:id/blog/:postId'), this.isAuthAndSubscribedApi.bind(this), this.updateBlogPost.bind(this));
        app.delete(this.url('page/:id/blog/:postId'), this.isAuthAndSubscribedApi.bind(this), this.deleteBlogPost.bind(this));
        app.get(this.url('page/:id/blog/author/:author'), this.setup, this.getPostsByAuthor.bind(this));
        app.get(this.url('page/:id/blog/title/:title'), this.setup, this.getPostsByTitle.bind(this));
        app.get(this.url('page/:id/blog/content/:content'), this.setup, this.getPostsByContent.bind(this));
        app.get(this.url('page/:id/blog/category/:category'), this.setup, this.getPostsByCategory.bind(this));
        app.get(this.url('page/:id/blog/tag/:tag'), this.setup, this.getPostsByTag.bind(this));
        app.post(this.url('page/:id/blog/posts/reorder'), this.isAuthAndSubscribedApi.bind(this), this.reorderPosts.bind(this));
        app.post(this.url('page/:id/blog/:postId/reorder/:newOrder'), this.isAuthAndSubscribedApi.bind(this), this.reorderBlogPost.bind(this));
    },


    //region WEBSITE
    getWebsiteById: function(req, resp) {

        var self = this;
        var websiteId = req.params.id;
        var accountId = self.accountId(req);
        //TODO: Add security - VIEW_WEBSITE - *CURRENTLY GLOBAL READ*

        cmsDao.getWebsiteById(websiteId, function (err, value) {
            self.sendResultOrError(resp, err, value, "Error Retrieving Website by Id");
            self = null;
        });
    },

    saveOrUpdateWebsite: function(req, resp) {

        var self = this;
        var settings = req.body.settings;
        var accountId = req.body.accountId;
        var websiteId = req.body._id;
        //console.log('Other Data: '+JSON.stringify(req.body));

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed){
            if(isAllowed !== true) {
                return self.send403(req);
            } else {
                cmsDao.updateWebsiteSettings(settings, accountId, websiteId, function (err, value) {
                    self.sendResultOrError(resp, err, value, "Error retrieving website by account id");
                    self = value = null;
                });
            }
        });



    },

    getWebsiteForAccountId: function(req, resp) {

        var self = this;
        var accountId = parseInt(req.params.accountid);

        self.checkPermissionForAccount(req, self.sc.privs.VIEW_WEBSITE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(req);
            } else {
                cmsDao.getOrCreateWebsiteByAccountId(accountId, req.user.id(), true, function (err, value) {
                    self.sendResultOrError(resp, err, value, "Error retrieving website by account id");
                    self = value = null;
                });
            }
        });

    },

    getWebsiteLinklists: function(req, res) {

        var self = this;
        self.log.debug('>> getWebsiteLinklists');
        var accountId = parseInt(self.accountId(req));

        self.checkPermissionForAccount(req, self.sc.privs.VIEW_WEBSITE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(req);
            } else {
                var websiteId = req.params.id;
                cmsManager.getWebsiteLinklists(websiteId, function (err, value) {
                    self.log.debug('<< getWebsiteLinklists');
                    self.sendResultOrError(res, err, value, "Error retrieving website Linklists");
                    self = value = null;
                });
            }
        });



    },

    getWebsiteLinklistsByHandle: function(req, res) {

        var self = this;
        self.log.debug('>> getWebsiteLinklistsByHandle');
        var websiteId = req.params.id;
        var handle = req.params.handle;

        var accountId = parseInt(self.accountId(req));

        self.checkPermissionForAccount(req, self.sc.privs.VIEW_WEBSITE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(req);
            } else {
                cmsManager.getWebsiteLinklistsByHandle(websiteId, handle, function (err, value) {
                    self.log.debug('<< getWebsiteLinklistsByHandle');
                    self.sendResultOrError(res, err, value, "Error retrieving website Linklists");
                    self = value = null;
                });
            }
        });


    },

    addWebsiteLinklists: function(req, res) {

        var self = this;
        self.log.debug('>> addWebsiteLinklists');
        var websiteId = req.params.id;
        var linkLists = req.body;
        var accountId = parseInt(self.accountId(req));

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(req);
            } else {
                cmsManager.addWebsiteLinklists(websiteId, linkLists, function (err, value) {
                    self.log.debug('<< addWebsiteLinklists');
                    self.sendResultOrError(res, err, value, "Error adding website Linklists");
                    self = value = null;
                });
            }
        });


    },

    updateWebsiteLinklists: function(req, res) {

        var self = this;
        self.log.debug('>> updateWebsiteLinklists');
        var websiteId = req.params.id;
        var handle = req.params.handle;
        var linkLists = req.body;
        var accountId = parseInt(self.accountId(req));

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(req);
            } else {
                cmsManager.updateWebsiteLinklists(websiteId, handle, linkLists, function (err, value) {
                    self.log.debug('<< updateWebsiteLinklists');
                    self.sendResultOrError(res, err, value, "Error adding website Linklists");
                    self = value = null;
                });
            }
        });


    },

    deleteWebsiteLinklists: function(req, res) {

        var self = this;
        self.log.debug('>> deleteWebsiteLinklists');
        var websiteId = req.params.id;
        var handle = req.params.handle;
        var accountId = parseInt(self.accountId(req));

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(req);
            } else {
                cmsManager.deleteWebsiteLinklists(websiteId, handle, function (err, value) {
                    self.log.debug('<< deleteWebsiteLinklists');
                    self.sendResultOrError(res, err, value, "Error adding website Linklists");
                    self = value = null;
                });
            }
        });


    },

    //endregion


    //region PAGE

    /**
     * This method may be called by unauthenticated users.  No security is needed.
     * @param req
     * @param resp
     */
    getPageByHandle: function(req, resp) {

        var self = this;
        var websiteId = req.params.websiteid;
        var pageHandle = req.params.handle;
        self.log.debug('>> getPageByHandle Website Id: '+websiteId+' Handle: '+pageHandle);
        var accountId = parseInt(self.accountId(req));

        cmsDao.getPageForWebsite(websiteId, pageHandle, function (err, value) {
            self.sendResultOrError(resp, err, value, "Error Retrieving Page for Website");
            self = null;
        });
    },

    /**
     * This method may be called by unauthenticated users.  No security is needed.
     * @param req
     * @param resp
     */
    getPagesById: function (req, resp) {
        var self = this;
        var pageId = req.params.id;
        var accountId = parseInt(self.accountId(req));
        self.log.debug('>> getPagesById');

        cmsDao.getPagesById(accountId, function (err, value) {
            self.sendResultOrError(resp, err, value, "Error Retrieving Page by Id");
            self = null;
        });
    },

    /**
     * This method may be called by unauthenticated users.  No security is needed.
     * @param req
     * @param resp
     */
    getPageById: function(req, resp) {

        var self = this;
        var pageId = req.params.id;

        self.log.debug('>> getPageById');
        var accountId = parseInt(self.accountId(req));

        cmsDao.getPageById(pageId, function (err, value) {
            self.sendResultOrError(resp, err, value, "Error Retrieving Page by Id");
            self = null;
        });
    },


    saveOrUpdatePage: function (req, resp) {
        var self = this;
        self.log.debug('>> saveOrUpdatePage');
        var _page = req.body;
        var accountId = parseInt(self.accountId(req));

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(req);
            } else {
                var page = new Page(_page);
                cmsDao.saveOrUpdate(page, function (err, value) {
                    self.sendResultOrError(resp, err, value, "Error saving website Page");
                    self = null;
                });
            }
        });


    },

    createPage: function (req, res) {
        var self = this;
        self.log.debug('>> createPage');

        var websiteId = req.params.websiteId;
        var accountId = parseInt(self.accountId(req));

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(req);
            } else {
                var pageObj = req.body;
                self.log.debug('>> page body');
                var page = require('../../cms/model/page');
                var temp = $$.u.idutils.generateUUID();
                if (page != null) {
                    self.log.debug('>> page not null');
                    page = new Page({
                        _id: temp,
                        title: pageObj.title,
                        handle: pageObj.handle,
                        mainmenu: pageObj.mainmenu
                    });
                    page.set('websiteId', websiteId);
                    page.set('accountId', accountId);
                    self.log.debug('>> page created');
                    cmsManager.createPage(page, function (err, value) {
                        self.log.debug('<< createPage');
                        self.sendResultOrError(res, err, value, "Error creating Page");
                        self = null;
                    });
                } else {
                    self.log.error('Cannot create null page.');
                    self.wrapError(res, 400, 'Bad Parameter', 'Cannot create a null page.');
                    self = null;
                }
            }
        });

    },

    updatePage: function (req, res) {
        var self = this;
        self.log.debug('>> updatePage');

        var accountId = parseInt(self.accountId(req));

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(req);
            } else {
                var pageId = req.params.id;
                var _page = req.body;
                var pageObj = new Page(_page);
                cmsManager.updatePage(pageId, pageObj, function (err, value) {
                    self.log.debug('<< updatePage');
                    self.sendResultOrError(res, err, value, "Error updating Page");
                    self = null;
                });
            }
        });


    },

    deletePage: function(req, res) {

        var self = this;
        self.log.debug('>> deletePage');
        var accountId = parseInt(self.accountId(req));

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(req);
            } else {
                var pageId = req.params.id;
                var websiteId = req.params.websiteId;
                var label = req.params.label;

                cmsManager.deletePage(pageId, function (err, value) {
                    self.log.debug('<< deletePage');
                    self.sendResultOrError(res, err, value, "Error deleting Page");
                    self = null;
                });
            }
        });



    },

    /**
     * Currently no security.
     * @param req
     * @param res
     */
    getAllPages: function(req, res) {
        var self = this;
        self.log.debug('>> getAllPages');
        var websiteId = req.params.websiteId;
        var accountId = parseInt(self.accountId(req));

        cmsManager.getPagesByWebsiteId(websiteId, accountId, function(err, map){
            self.log.debug('<< getAllPages');
            self.sendResultOrError(res, err, map, 'Error getting all pages for account');
            self = null;
        });

    },
    //endregion


    //region THEME

    /*
     app.get(this.url('theme'), this.isAuthApi, this.listThemes.bind(this));
     app.get(this.url('theme/:id'), this.isAuthApi, this.getThemeById.bind(this));
     app.get(this.url('theme/name/:name'), this.isAuthApi, this.getThemeByName.bind(this));
     app.post(this.url('theme'), this.isAuthApi, this.createTheme.bind(this));
     app.post(this.url('theme/website/:websiteId'), this.isAuthApi, this.createThemeFromWebsite.bind(this));
     app.post(this.url('theme/:id'), this.isAuthApi, this.updateTheme.bind(this));
     app.delete(this.url('theme/:id'), this.isAuthApi, this.deleteTheme.bind(this));
     app.post(this.url('website/theme/:id'), this.isAuthApi, this.createWebsiteFromTheme.bind(this));
     app.post(this.url('website/:websiteId/theme/:themeId'), this.isAuthApi, this.setTheme.bind(this));
     */

    listThemes: function(req, res) {
        var self = this;
        self.log.debug('>> listThemes');
        var accountId = parseInt(self.accountId(req));

        self.checkPermissionForAccount(req, self.sc.privs.VIEW_THEME, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(req);
            } else {
                cmsManager.getAllThemes(accountId, function(err, value){
                    self.log.debug('<< listThemes');
                    self.sendResultOrError(res, err, value, 'Error retrieving all themes.');
                });
            }
        });

    },

    getThemeById: function(req, res) {
        var self = this;
        self.log.debug('>> getThemeById');

        var themeId = req.params.id;
        var accountId = parseInt(self.accountId(req));

        self.checkPermissionForAccount(req, self.sc.privs.VIEW_THEME, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(req);
            } else {
                cmsManager.getThemeById(themeId, function(err, value){
                    self.log.debug('<< getThemeById');
                    self.sendResultOrError(res, err, value, 'Error retrieving theme by id.');
                });
            }
        });


    },

    getThemeByName: function(req, res) {
        var self = this;
        self.log.debug('>> getThemeByName');
        var themeName = req.params.name;
        var accountId = parseInt(self.accountId(req));
        self.checkPermissionForAccount(req, self.sc.privs.VIEW_THEME, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(req);
            } else {
                cmsManager.getThemeByName(themeName, function(err, value){
                    self.log.debug('<< getThemeByName');
                    self.sendResultOrError(res, err, value, 'Error retrieving theme by name.');
                });
            }
        });

    },

    createTheme: function(req, res) {
        var self = this;

        self.log.debug('>> createTheme');
        var accountId = parseInt(self.accountId(req));
        var themeObj = new $$.m.cms.Theme(req.body);
        themeObj.set('accountId', accountId);
        themeObj.set('created.by', self.userId(req));

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_THEME, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(req);
            } else {
                cmsManager.createTheme(themeObj, function(err, value){
                    self.log.debug('<< createTheme');
                    self.sendResultOrError(res, err, value, 'Error creating theme.');
                });
            }
        });


    },

    /**
     * This function creates a new theme from an existing website object.
     * @param {websiteId} websiteID in URL
     * @param {theme} theme object in body of POST.  The name field MUST be populated.
     */
    createThemeFromWebsite: function(req, res) {
        var self = this;
        self.log.debug('>> createThemeFromWebsite');

        self.checkPermission(req, self.sc.privs.MODIFY_THEME, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(req);
            } else {
                var websiteId = req.params.websiteId;
                var accountId = parseInt(self.accountId(req));
                var themeObj = new $$.m.cms.Theme(req.body);
                if(themeObj.get('name') === '') {
                    self.wrapError(res, 400, 'Invalid Parameter', 'Invalid parameter provided for Theme Name');
                }
                themeObj.set('accountId', accountId);
                themeObj.set('created.by', self.userId(req));

                cmsManager.createThemeFromWebsite(themeObj, websiteId, null, function(err, value){
                    self.log.debug('<< createThemeFromWebsite');
                    self.sendResultOrError(res, err, value, 'Error creating theme from website.');
                });
            }
        });


    },


    updateTheme: function(req, res) {
        var self = this;
        self.log.debug('>> updateTheme');
        self.checkPermission(req, self.sc.privs.MODIFY_THEME, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(req);
            } else {
                var themeId = req.params.id;
                var accountId = parseInt(self.accountId(req));
                var themeObj = new $$.m.cms.Theme(req.body);
                themeObj.set('modified.by', self.userId(req));
                themeObj.set('modified.date', new Date());
                themeObj.set('_id', themeId);

                cmsManager.updateTheme(themeObj, function(err, value){
                    self.log.debug('<< updateTheme');
                    self.sendResultOrError(res, err, value, 'Error updating theme.');

                });
            }
        });



    },


    deleteTheme: function(req, res) {
        var self = this;
        self.log.debug('>> deleteTheme');
        self.checkPermission(req, self.sc.privs.MODIFY_THEME, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(req);
            } else {
                var themeId = req.params.id;
                var accountId = parseInt(self.accountId(req));

                cmsManager.deleteTheme(themeId, function(err, value){
                    self.log.debug('<< deleteTheme');
                    self.sendResultOrError(res, err, value, 'Error deleting theme.');
                });
            }
        });


    },

    createWebsiteFromTheme: function(req, res) {
        var self = this;

        self.log.debug('>> createWebsiteFromTheme');
        self.checkPermission(req, self.sc.privs.MODIFY_WEBSITE, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(req);
            } else {
                var themeId = req.params.id;
                var accountId = parseInt(self.accountId(req));

                cmsManager.createWebsiteAndPageFromTheme(accountId, themeId, self.userId(req), null, null, function(err, websiteAndPage){
                    self.log.debug('<< createWebsiteFromTheme');
                    self.sendResultOrError(res, err, websiteAndPage.website, 'Error creating website from theme.');
                });
            }
        });


    },

    createPageFromTheme: function(req, res) {
        var self = this;
        self.log.debug('>> createPageFromTheme');
        self.checkPermission(req, self.sc.privs.MODIFY_WEBSITE, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(req);
            } else {
                var themeId = req.params.id;
                var websiteId = req.params.websiteId;
                var accountId = parseInt(self.accountId(req));

                var handle = req.params.handle;
                cmsManager.createWebsiteAndPageFromTheme(accountId, themeId, self.userId(req), websiteId, handle, function(err, websiteAndPage){
                    self.log.debug('<< createWebsiteFromTheme');
                    self.sendResultOrError(res, err, websiteAndPage.page, 'Error creating website from theme.');
                });
            }
        });

    },

    setTheme: function(req, res) {
        var self = this;
        self.log.debug('>> setTheme');
        self.checkPermission(req, self.sc.privs.MODIFY_ACCOUNT, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(req);
            } else {
                var themeId = req.params.themeId;
                var websiteId = req.params.websiteId;
                var accountId = parseInt(self.accountId(req));

                //TODO: validate this method.
                cmsManager.setThemeForAccount(accountId, themeId, function(err, value){
                    self.log.debug('<< setTheme');
                    self.sendResultOrError(res, err, value, 'Error setting theme on account.');
                });
            }
        });


    },

    //endregion

    //COMPONENTS

    getComponentsByPage: function(req, res) {

        var self = this;
        self.log.debug('>> getComponentsByPage');
        var accountId = parseInt(self.accountId(req));

        var pageId = req.params.id;

        accountId = parseInt(accountId);

        self.checkPermissionForAccount(req, self.sc.privs.VIEW_WEBSITE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(req);
            } else {
                cmsManager.getPageComponents(pageId, function (err, value) {
                    self.log.debug('<< getComponentsByPage');
                    self.sendResultOrError(res, err, value, "Error retrieving components");
                    self = null;
                });
            }
        });


    },

    getComponentsByType: function(req, res) {

        var self = this;
        self.log.debug('>> getComponentsByType');
        var accountId = parseInt(self.accountId(req));

        var pageId = req.params.id;
        var type = req.params.type;

        accountId = parseInt(accountId);
        self.checkPermissionForAccount(req, self.sc.privs.VIEW_WEBSITE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(req);
            } else {
                cmsManager.getPageComponentsByType(pageId, type, function (err, value) {
                    self.log.debug('<< getComponentsByType');
                    self.sendResultOrError(res, err, value, "Error retrieving components by type");
                    self = null;
                });
            }
        });


    },

    addComponentToPage: function (req, res) {

        var self = this;
        self.log.debug('>> addComponentToPage', req.body);
        var componentObj = req.body;
        //var componentObj = $$.m.cms.modules[req.body.type];

        var pageId = req.params.id;
        var accountId = parseInt(self.accountId(req));


        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(req);
            } else {
                var component = require('../../cms/model/components/' + componentObj.type);
                var temp = $$.u.idutils.generateUUID();
                if (component != null) {
                    component = new component({
                        _id: temp,
                        anchor: temp,
                        // title: componentObj.title,
                        visibility : true
                    });
                    if(componentObj.cmpVersion && componentObj.cmpVersion !== null) {
                        component.attributes.version = componentObj.cmpVersion;
                    }

                }

                cmsManager.addPageComponent(pageId, component.attributes, function (err, value) {
                    self.log.debug('<< addComponentToPageID' + pageId);
                    self.log.debug('<< addComponentToPageComponent' + componentObj);
                    self.sendResultOrError(res, err, value, "Error adding components to page");
                    self = null;
                });
            }

        });

    },

    updateComponent: function(req, res) {

        var self = this;
        self.log.debug('>> updateComponent');
        var componentObj = req.body;


        var pageId = req.params.id;
        var accountId = parseInt(self.accountId(req));

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(req);
            } else {
                //var componentId = req.params.componentId;

                cmsManager.updatePageComponent(pageId, componentObj, function (err, value) {
                    self.log.debug('<< updateComponent');
                    self.sendResultOrError(res, err, value, "Error updating a component on a page");
                    self = null;
                });
            }
        });


    },

    updateAllComponents: function(req, res) {

        var self = this;
        self.log.debug('>> updateAllComponents', req.body);
        var componentAry = req.body;

        var pageId = req.params.id;
        var accountId = parseInt(self.accountId(req));

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(req);
            } else {
                cmsManager.updateAllPageComponents(pageId, componentAry, function (err, value) {
                    self.log.debug('<< updateAllComponents');
                    self.sendResultOrError(res, err, value, "Error updating components");
                    self = null;
                });
            }
        });


    },

    deleteComponent: function(req, res) {

        var self = this;
        self.log.debug('>> deleteComponent');

        var pageId = req.params.id;
        var accountId = parseInt(self.accountId(req));

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(req);
            } else {
                var componentId = req.params.componentId;

                cmsManager.deleteComponent(pageId, componentId, function (err, value) {
                    self.log.debug('<< deleteComponent');
                    self.sendResultOrError(res, err, value, "Error deleting component");
                    self = null;
                });
            }
        });


    },

    updateComponentOrder: function(req, res) {

        var self = this;
        self.log.debug('>> updateComponentOrder');

        var pageId = req.params.id;
        var accountId = parseInt(self.accountId(req));

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(req);
            } else {
                var componentId = req.params.componentId;
                var newOrder = req.params.newOrder;

                cmsManager.modifyComponentOrder(pageId, componentId, newOrder, function (err, value) {
                    self.log.debug('<< updateComponentOrder');
                    self.sendResultOrError(res, err, value, "Error deleting component");
                    self = null;
                });
            }
        });



    },

    getAvailableComponentVersions: function(req, res) {
        var self = this;
        self.log.debug('>> getAvailableComponentVersions');
        var type = req.params.type;
        self.checkPermission(req, self.sc.privs.VIEW_WEBSITE, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(req);
            } else {
                cmsManager.getComponentVersions(type, function(err, value){
                    self.log.debug('<< getAvailableComponentVersions');
                    self.sendResultOrError(res, err, value, "Error getting component versions");
                    self = null;
                });
            }
        });

    },


    //BLOG POSTS
    createBlogPost: function(req, res) {

        var self = this;
        self.log.debug('>> createBlogPost');
        var blog=req.body;
        if(!Array.isArray(blog.post_tags))
            blog.post_tags=blog.post_tags.split(',');

        var blogPost = new $$.m.BlogPost(blog);
        //var blogPost = new $$.m.BlogPost(req.body);

        var pageId = req.params.id;
        var accountId = parseInt(self.accountId(req));

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(req);
            } else {
                blogPost.set('accountId', accountId);
                blogPost.set('pageId', pageId);

                cmsManager.createBlogPost(accountId, blogPost, function (err, value) {
                    self.log.debug('<< createBlogPost' + JSON.stringify(blogPost));
                    self.sendResultOrError(res, err, value, "Error creating Blog Post");
                    self = null;
                });
            }
        });


    },

    /**
     * The method may be called by unauthenticated user.  No security is needed.
     * @param req
     * @param res
     */
    getBlogPost: function(req, res) {

        var self = this;
        self.log.debug('>> getBlogPost');
        var accountId = parseInt(self.accountId(req));
        var blogPostId = req.params.postId;
        self.log.debug('Account ID: ' + accountId + ' Blog Post ID: ' + blogPostId);
        cmsManager.getBlogPost(accountId, blogPostId, function (err, value) {
            self.log.debug('<< getBlogPost');
            self.sendResultOrError(res, err, value, "Error getting Blog Post");
            self = null;
        });
    },

    updateBlogPost: function(req, res) {

        var self = this;
        self.log.debug('>> updateBlogPost');
        var blogPost = new $$.m.BlogPost(req.body);
        var postId = req.params.postId;
        var pageId = req.params.id;

        var accountId = self.accountId(req);
        blogPost.set('accountId', parseInt(accountId));
        blogPost.set('_id', postId);
        blogPost.set('pageId', pageId);

        console.dir(req.body);

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(req);
            } else {
                blogPost.set('accountId', accountId.toString());
                blogPost.set('_id', postId);
                blogPost.set('pageId', pageId);

                console.dir(req.body);

                cmsManager.updateBlogPost(accountId, blogPost, function (err, value) {
                    self.log.debug('<< updateBlogPost');
                    self.sendResultOrError(res, err, value, "Error updating Blog Post");
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
                return self.send403(req);
            } else {
                var blogPostId = req.params.postId;
                var pageId = req.params.id;
                self.log.debug('deleting post with id: ' + blogPostId);

                cmsManager.deleteBlogPost(accountId, pageId, blogPostId, function (err, value) {
                    self.log.debug('<< deleteBlogPost');
                    self.sendResultOrError(res, err, value, "Error deleting Blog Post");
                    self = null;
                });
            }
        });

    },

    /**
     * This method may be called by unauthenticated users.  No security is needed.
     * @param req
     * @param res
     */
    listBlogPosts: function (req, res) {
        var self = this;
        self.log.debug('>> listBlogPosts');
        var accountId = parseInt(self.accountId(req));
        var limit = parseInt(req.query['limit'] || 0);//suitable default?
        var skip = parseInt(req.query['skip'] || 0);//TODO: use skip for paging

        cmsManager.listBlogPosts(accountId, limit, function (err, value) {
            self.log.debug('<< listBlogPosts '+value);
            self.sendResultOrError(res, err, value, "Error listing Blog Posts");
            self = null;
        });
    },

    /**
     * This method may be called by unauthenticated users.  No security is needed.
     * @param req
     * @param res
     */
    listBlogPostsByPageId: function (req, res) {
        var self = this;
        self.log.debug('>> listBlogPostsByPageId');
        var pageId = req.params.id;
        var limit = parseInt(req.query['limit'] || 0); //suitable default?
        var skip = parseInt(req.query['skip'] || 0);   //TODO: use skip for paging

        cmsManager.listBlogPostsByPageId(pageId, limit, function (err, value) {
            self.log.debug('<< listBlogPostsByPageId ' + value);
            self.sendResultOrError(res, err, value, "Error listing Blog Posts");
            self = null;
        });
    },

    /**
     * This method may be called by unauthenticated users.  No security is needed.
     * @param req
     * @param res
     */
    getPostsByAuthor: function(req, res){

        var self = this;
        self.log.debug('>> getPostsByAuthor');
        var accountId = parseInt(self.accountId(req));
        var author = req.params.author;

        cmsManager.getPostsByAuthor(accountId, author, function (err, value) {
            self.log.debug('<< getPostsByAuthor');
            self.sendResultOrError(res, err, value, "Error getting Blog Posts by author");
            self = null;
        });

    },

    /**
     * This method may be called by unauthenticated users.  No security is needed.
     * @param req
     * @param res
     */
    getPostsByTitle: function(req, res) {

        var self = this;
        self.log.debug('>> getPostsByTitle');
        var accountId = parseInt(self.accountId(req));
        var title = req.params.title;

        cmsManager.getPostsByTitle(accountId, title, function (err, value) {
            self.log.debug('<< getPostsByTitle');
            self.sendResultOrError(res, err, value, "Error getting Blog Posts by title");
            self = null;
        });
    },

    /**
     * This method may be called by unauthenticated users.  No security is needed.
     * @param req
     * @param res
     */
    getPostsByContent: function(req, res) {

        var self = this;
        self.log.debug('>> getPostsByContent');
        var accountId = parseInt(self.accountId(req));
        var content = req.params.content;

        cmsManager.getPostsByData(accountId, content, function (err, value) {
            self.log.debug('<< getPostsByContent');
            self.sendResultOrError(res, err, value, "Error getting Blog Posts by content");
            self = null;
        });
    },

    /**
     * This method may be called by unauthenticated users.  No security is needed.
     * @param req
     * @param res
     */
    getPostsByCategory: function(req, res) {

        var self = this;
        self.log.debug('>> getPostsByCategory');
        var accountId = parseInt(self.accountId(req));
        var category = req.params.category;

        cmsManager.getPostsByCategory(accountId, category, function (err, value) {
            self.log.debug('<< getPostsByCategory');
            self.sendResultOrError(res, err, value, "Error getting Blog Posts by category");
            self = null;
        });
    },

    /**
     * This method may be called by unauthenticated users.  No security is needed.
     * @param req
     * @param res
     */
    getPostsByTag: function(req, res) {

        var self = this;
        self.log.debug('>> getPostsByTag');
        var accountId = parseInt(self.accountId(req));
        var tag = req.params.tag;

        cmsManager.getPostsByTag(accountId, [tag], function (err, value) {
            self.log.debug('<< getPostsByTag');
            self.sendResultOrError(res, err, value, "Error getting Blog Posts by tag");
            self = null;
        });
    },

    reorderPosts: function(req, res) {

        var self = this;
        self.log.debug('>> reorderPosts');
        var accountId = parseInt(self.accountId(req));

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(req);
            } else {
                var pageId = req.params.id;

                var blogComponent = new $$.m.cms.components.Blog(req.body);

                cmsManager.updatePageComponent(pageId, blogComponent, function (err, value) {
                    self.log.debug('<< reorderPosts');
                    self.sendResultOrError(res, err, value, "Error reordering Blog Posts");
                    self = null;
                });
            }
        });


    },

    reorderBlogPost: function(req, res) {

        var self = this;
        self.log.debug('>> reorderBlogPost');
        var accountId = parseInt(self.accountId(req));
        
        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(req);
            } else {
                var pageId = req.params.id;
                var postId = "" + req.params.postId;
                var newOrder = req.params.newOrder;

                cmsManager.modifyPostOrder(accountId, postId, pageId, newOrder, function (err, value) {
                    self.log.debug('<< reorderBlogPost');
                    self.sendResultOrError(res, err, value, "Error reordering Blog Posts");
                    self = null;
                });
            }
        });

    }

});

module.exports = new api();

