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

var api = function() {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "cms",

    dao: cmsDao,

    initialize: function() {
        // WEBSITE
        app.get(this.url('website/:id'), this.isAuthApi, this.getWebsiteById.bind(this));
        app.get(this.url('website/:id'), this.getWebsiteById.bind(this)); //Temp Added
        app.get(this.url(':accountid/cms/website', "account"), this.isAuthApi, this.getWebsiteForAccountId.bind(this));
        app.post(this.url('website'), this.saveOrUpdateWebsite.bind(this));
        app.put(this.url('website'), this.saveOrUpdateWebsite.bind(this));

        // WEBSITE LINKS
        app.get(this.url('website/:id/linklists'), this.isAuthApi, this.getWebsiteLinklists.bind(this));
        app.get(this.url('website/:id/linklists/:handle'), this.isAuthApi, this.getWebsiteLinklistsByHandle.bind(this));
        app.post(this.url('website/:id/linklists'), this.isAuthApi, this.addWebsiteLinklists.bind(this));
        app.post(this.url('website/:id/linklists/:handle'), this.isAuthApi, this.updateWebsiteLinklists.bind(this));
        app.delete(this.url('website/:id/linklists/:handle'), this.isAuthApi, this.deleteWebsiteLinklists.bind(this));

        // PAGE
        app.get(this.url('website/:websiteid/page/:handle'), this.getPageByHandle.bind(this));
        app.get(this.url('page/:id'), this.getPageById.bind(this));
        app.put(this.url('page'), this.saveOrUpdatePage.bind(this));



        //consistent URLs

        app.get(this.url('website/:websiteId/pages/:id'), this.getPagesById.bind(this));
        app.get(this.url('website/:websiteId/page/:id'), this.getPageById.bind(this));
        app.post(this.url('website/:websiteId/page'), this.createPage.bind(this));
        app.post(this.url('website/:websiteId/page/:id'), this.updatePage.bind(this));
        app.put(this.url('website/:websiteId/page'), this.createPage.bind(this));
        app.put(this.url('website/:websiteId/page/:id'), this.updatePage.bind(this));
        app.delete(this.url('website/:websiteId/page/:id/:label'), this.deletePage.bind(this));

        // THEME
        app.get(this.url('theme/:id'), this.isAuthApi, this.getThemeConfigById.bind(this));
        app.get(this.url(':accountId/cms/theme', "account"), this.isAuthApi, this.getThemeConfigForAccountId.bind(this));
        app.get(this.url('themes'), this.isAuthApi, this.getAllThemes.bind(this));
        app.get(this.url('theme/:id/preview'), this.isAuthApi, this.getThemePreview.bind(this));
        app.post(this.url('theme/:id'), this.isAuthApi, this.setTheme.bind(this));
        /*
        What it should be:
         */
        app.get(this.url('themeconfig/:id'), this.isAuthApi, this.getThemeConfigById.bind(this));
        app.get(this.url('themeconfig/account/:accountId'), this.isAuthApi, this.getThemeConfigForAccountId.bind(this));
        app.get(this.url('themes'), this.isAuthApi, this.getAllThemes.bind(this));
        app.get(this.url('themes/:id/preview'), this.isAuthApi, this.getThemePreview.bind(this));
        app.post(this.url('themes/:id'), this.isAuthApi, this.modifyTheme.bind(this));
        app.post(this.url('website/:websiteId/theme/:themeId'), this.isAuthApi, this.setTheme.bind(this));


        // COMPONENTS
        app.get(this.url('page/:id/components'), this.isAuthApi, this.getComponentsByPage.bind(this));
        app.get(this.url('page/:id/components/type/:type'), this.isAuthApi, this.getComponentsByType.bind(this));
        app.post(this.url('page/:id/components'), this.isAuthApi, this.addComponentToPage.bind(this));
        app.post(this.url('page/:id/components/all'), this.isAuthApi, this.updateAllComponents.bind(this));
        app.post(this.url('page/:id/components/:componentId'), this.isAuthApi, this.updateComponent.bind(this));
        app.delete(this.url('page/:id/components/:componentId'), this.isAuthApi, this.deleteComponent.bind(this));
        app.post(this.url('page/:id/components/:componentId/order/:newOrder'), this.isAuthApi, this.updateComponentOrder.bind(this));

        // BLOG POSTS
        app.post(this.url('page/:id/blog'), this.isAuthApi, this.createBlogPost.bind(this));
        app.get(this.url('page/:id/blog'), this.isAuthApi, this.listBlogPosts.bind(this));
        app.get(this.url('page/:id/blog/:postId'), this.isAuthApi, this.getBlogPost.bind(this));
        app.post(this.url('page/:id/blog/:postId'), this.isAuthApi, this.updateBlogPost.bind(this));
        app.put(this.url('page/:id/blog/:postId'), this.isAuthApi, this.updateBlogPost.bind(this));
        app.delete(this.url('page/:id/blog/:postId'), this.isAuthApi, this.deleteBlogPost.bind(this));
        app.get(this.url('page/:id/blog/author/:author'), this.isAuthApi, this.getPostsByAuthor.bind(this));
        app.get(this.url('page/:id/blog/title/:title'), this.isAuthApi, this.getPostsByTitle.bind(this));
        app.get(this.url('page/:id/blog/content/:content'), this.isAuthApi, this.getPostsByContent.bind(this));
        app.get(this.url('page/:id/blog/category/:category'), this.isAuthApi, this.getPostsByCategory.bind(this));
        app.get(this.url('page/:id/blog/tag/:tag'), this.isAuthApi, this.getPostsByTag.bind(this));
        app.post(this.url('page/:id/blog/posts/reorder'), this.isAuthApi, this.reorderPosts.bind(this));
        app.post(this.url('page/:id/blog/:postId/reorder/:newOrder'), this.isAuthApi, this.reorderBlogPost.bind(this));
    },


    //region WEBSITE
    getWebsiteById: function(req, resp) {
        //TODO: Add security
        var self = this;
        var websiteId = req.params.id;

        cmsDao.getWebsiteById(websiteId, function(err, value) {
            self.sendResultOrError(resp, err, value, "Error Retrieving Website by Id");
            self = null;
        });
    },

    saveOrUpdateWebsite: function(req, resp) {
        //TODO: Add Security
        var self = this;
        var settings = req.body.settings;
        var accountId = req.body.accountId;
        var websiteId = req.body._id;
        //console.log('Other Data: '+JSON.stringify(req.body));


        cmsDao.updateWebsiteSettings( settings, accountId, websiteId,function(err, value) {
            self.sendResultOrError(resp, err, value, "Error retrieving website by account id");
            self = value = null;
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

    getWebsiteLinklists: function(req, res) {
        //TODO: Add Security
        var self = this;
        self.log.debug('>> getWebsiteLinklists');

        var websiteId = req.params.id;
        cmsManager.getWebsiteLinklists(websiteId, function(err, value){
            self.log.debug('<< getWebsiteLinklists');
            self.sendResultOrError(res, err, value, "Error retrieving website Linklists");
            self = value = null;
        });

    },

    getWebsiteLinklistsByHandle: function(req, res) {
        //TODO: Add Security
        var self = this;
        self.log.debug('>> getWebsiteLinklistsByHandle');
        var websiteId = req.params.id;
        var handle = req.params.handle;
        cmsManager.getWebsiteLinklistsByHandle(websiteId, handle, function(err, value){
            self.log.debug('<< getWebsiteLinklistsByHandle');
            self.sendResultOrError(res, err, value, "Error retrieving website Linklists");
            self = value = null;
        });
    },

    addWebsiteLinklists: function(req, res) {
        //TODO: Add Security
        var self = this;
        self.log.debug('>> addWebsiteLinklists');
        var websiteId = req.params.id;
        var linkLists = req.body;

        cmsManager.addWebsiteLinklists(websiteId, linkLists, function(err, value){
            self.log.debug('<< addWebsiteLinklists');
            self.sendResultOrError(res, err, value, "Error adding website Linklists");
            self = value = null;
        });
    },

    updateWebsiteLinklists: function(req, res) {
        //TODO: Add Security
        var self = this;
        self.log.debug('>> updateWebsiteLinklists');
        var websiteId = req.params.id;
        var handle = req.params.handle;
        var linkLists = req.body;

        cmsManager.updateWebsiteLinklists(websiteId, handle, linkLists, function(err, value){
            self.log.debug('<< updateWebsiteLinklists');
            self.sendResultOrError(res, err, value, "Error adding website Linklists");
            self = value = null;
        });
    },

    deleteWebsiteLinklists: function(req, res) {
        //TODO: Add Security
        var self = this;
        self.log.debug('>> deleteWebsiteLinklists');
        var websiteId = req.params.id;
        var handle = req.params.handle;

        cmsManager.deleteWebsiteLinklists(websiteId, handle, function(err, value){
            self.log.debug('<< deleteWebsiteLinklists');
            self.sendResultOrError(res, err, value, "Error adding website Linklists");
            self = value = null;
        });
    },

    //endregion


    //region PAGE
    getPagesById: function(req, resp) {
        //TODO: Add security
        var self = this;
        var pageId = req.params.id;
        var accountId = parseInt(self.accountId(req));
        self.log.debug('>> getPagesById');

        cmsDao.getPagesById(accountId, function(err, value) {
            self.sendResultOrError(resp, err, value, "Error Retrieving Page by Id");
            self = null;
        });
    },

    getPageByHandle: function(req, resp) {
        //TODO: Add security
        var self = this;
        var websiteId = req.params.websiteid;
        var pageHandle = req.params.handle;

        self.log.debug('>> getPageByHandle Website Id: '+websiteId+' HAndle: '+pageHandle);

        cmsDao.getPageForWebsite(websiteId, pageHandle, function(err, value) {
            self.sendResultOrError(resp, err, value, "Error Retrieving Page for Website");
            self = null;
        });
    },


    getPageById: function(req, resp) {
        //TODO: Add security
        var self = this;
        var pageId = req.params.id;

        self.log.debug('>> getPageById');

        cmsDao.getPageById(pageId, function(err, value) {
            self.sendResultOrError(resp, err, value, "Error Retrieving Page by Id");
            self = null;
        });
    },


    saveOrUpdatePage: function(req, resp) {
        //TODO: Add Security
        var self = this;
        self.log.debug('>> saveOrUpdatePage');
        var _page = req.body;

        var page = new Page(_page);
        cmsDao.saveOrUpdate(page, function(err, value) {
            self.sendResultOrError(resp, err, value, "Error saving website Page");
            self = null;
        });
    },

    createPage: function(req, res) {
        var self = this;
        self.log.debug('>> createPage');

        var websiteId = req.params.websiteId;
        var accountId = parseInt(self.accountId(req));
        var _page = req.body;
        var pageObj = new Page(_page);
        pageObj.set('websiteId', websiteId);
        pageObj.set('accountId', accountId);
        cmsManager.createPage(pageObj, function(err, value){
            self.log.debug('<< createPage');
            self.sendResultOrError(res, err, value, "Error creating Page");
            self = null;
        });
    },

    updatePage: function(req, res) {
        var self = this;
        self.log.debug('>> updatePage');


        var pageId = req.params.id;
        var _page = req.body;
        var pageObj = new Page(_page);
        cmsManager.updatePage(pageId, pageObj, function(err, value){
            self.log.debug('<< updatePage');
            self.sendResultOrError(res, err, value, "Error updating Page");
            self = null;
        });
    },

    deletePage: function(req, res) {
        //TODO: Add Security
        var self = this;
        self.log.debug('>> deletePage');

        var pageId = req.params.id;
        var websiteId = req.params.websiteId;
        var label = req.params.label;

        cmsManager.deletePage(pageId, function(err, value){
            self.log.debug('<< deletePage');
            if(!err && value){

                cmsManager.getWebsiteLinklistsByHandle(websiteId,"head-menu",function(err,list){

              //      var links=  list["links"];

                    var spliceIndex = -1;
                    for(var i = 0; i<list.links.length; i++) {
                        if(list.links[i].label === label) {
                            spliceIndex = i;
                        }
                    }

                    if(spliceIndex > 0) {
                        list.links.splice(spliceIndex, 1);
                    }

                    cmsManager.updateWebsiteLinklists(websiteId, "head-menu", list, function(err, value){
                        if(err) {
                            console.log(err)
                        } else {
                            console.log(value)
                        }
                    });
                })
                /*
                cmsManager.deleteWebsiteLinklists(websiteId, "head-menu", function(err, value){
                    self.log.debug('<< deleteWebsiteLinklists');
                    self.sendResultOrError(res, err, value, "Error adding website Linklists");
                    self = value = null;
                });
                */
                /*
                cmsManager.updateWebsiteLinklists(websiteId, "head-menu", linkList, function(err, value){
                    self.log.debug('<< deletePageLink');
                    self.sendResultOrError(res, err, value, "Error deleting Page Link");
                    self = value = null;
                });
                */
            }
            else
               self.sendResultOrError(res, err, value, "Error deleting Page");
            self = null;
        });

    },
    //endregion


    //region THEME
    getThemeConfigById: function(req, resp) {
        //TODO: Add Security
        var self = this;
        var themeId = req.params.id;

        cmsDao.getThemeConfig(themeId, function(err, value) {
            self.sendResultOrError(resp, err, value, "Error retrieving Theme Config for ID: [" + themeId + "]");
            self = null;
        });
    },

    getAllThemes: function(req, res) {
        var self = this;

        cmsManager.getAllThemes(function(err, value) {
            if (err) {
                self.wrapError(res, 500, "Error retrieving all themes", err, value);
            } else {
                self.sendResult(res, value);
            }
        })
    },

    getThemeConfigForAccountId: function(req, resp) {
        //TODO: Add Security
        var self = this;
        var accountId = req.params.accountId;

        accountId = parseInt(accountId);

        if (isNaN(accountId)) {
            this.sendResultOrError(resp, "Account Id is not valid", "");
            self = null;
            return;
        }
        cmsDao.getThemeConfigSignedByAccountId(accountId, function(err, value) {
            self.sendResultOrError(resp, err, value, "Error retrieving Theme Config for AccountId: [" + accountId + "]");
            self = null;
        });
    },

    getThemePreview: function(req, res) {
        //TODO: Add Security
        var self = this;
        self.log.debug('>> getThemePreview');
        var accountId = parseInt(self.accountId(req));
        var themeId = req.params.id;

        cmsManager.getThemePreview(themeId, function(err, value){
            self.sendResultOrError(res, err, value, "Error retrieving Theme Preview for ThemeId: [" + themeId + "]");
            self = null;
        });

    },

    setTheme: function(req, res) {
        //TODO: Add Security
        var self = this;
        self.log.debug('>> setTheme');
        var accountId = parseInt(self.accountId(req));
        var themeId = req.params.themeId;
        var websiteId = req.params.websiteId;

        cmsManager.setThemeForAccount(accountId, themeId, function(err, value){
            self.sendResultOrError(res, err, value, "Error setting theme for account.");
            self = null;
        });

    },

    modifyTheme: function(req, res) {
      //TODO: implement if necessary
    },

    //endregion

    //COMPONENTS

    getComponentsByPage: function(req, res) {
        //TODO: Add Security
        var self = this;
        self.log.debug('>> getComponentsByPage');
        var accountId = req.params.accountid;
        var pageId = req.params.id;

        accountId = parseInt(accountId);

        cmsManager.getPageComponents(pageId, function(err, value){
            self.log.debug('<< getComponentsByPage');
            self.sendResultOrError(res, err, value, "Error retrieving components");
            self = null;
        });
    },

    getComponentsByType: function(req, res) {
        //TODO: Add Security
        var self = this;
        self.log.debug('>> getComponentsByType');
        var accountId = req.params.accountid;
        var pageId = req.params.id;
        var type = req.params.type;

        accountId = parseInt(accountId);

        cmsManager.getPageComponentsByType(pageId, type, function(err, value){
            self.log.debug('<< getComponentsByType');
            self.sendResultOrError(res, err, value, "Error retrieving components by type");
            self = null;
        });
    },

    addComponentToPage: function(req, res) {
        //TODO: Add Security
        var self = this;
        self.log.debug('>> addComponentToPage');
        var componentObj = req.body;
        //var componentObj = $$.m.cms.modules[req.body.type];

        var pageId = req.params.id;
        var accountId = parseInt(self.accountId(req));
        var component = require('../../cms/model/components/' + componentObj.type);
        var temp=$$.u.idutils.generateUUID();
        if (component != null) {
            component = new component({
                _id: temp,
                anchor: temp,
                title: componentObj.title

            });

        }

        cmsManager.addPageComponent(pageId, component.attributes, function(err, value){
            self.log.debug('<< addComponentToPageID'+pageId);
            self.log.debug('<< addComponentToPageComponent'+componentObj);
            self.sendResultOrError(res, err, value, "Error adding components to page");
            self = null;
        });
    },

    updateComponent: function(req, res) {
        //TODO: Add Security
        var self = this;
        self.log.debug('>> updateComponent');
        var componentObj = req.body;

        var pageId = req.params.id;
        var accountId = parseInt(self.accountId(req));
        var componentId = req.params.componentId;

        cmsManager.updatePageComponent(pageId, componentObj, function(err, value){
            self.log.debug('<< updateComponent');
            self.sendResultOrError(res, err, value, "Error updating a component on a page");
            self = null;
        });

    },

    updateAllComponents: function(req, res) {
        //TODO: Add Security
        var self = this;
        self.log.debug('>> updateAllComponents');
        var componentAry = req.body;

        var pageId = req.params.id;
        var accountId = parseInt(self.accountId(req));

        cmsManager.updateAllPageComponents(pageId, componentAry, function(err, value){
            self.log.debug('<< updateAllComponents');
            self.sendResultOrError(res, err, value, "Error updating components");
            self = null;
        });
    },


    deleteComponent: function(req, res) {
        //TODO: Add Security
        var self = this;
        self.log.debug('>> deleteComponent');

        var pageId = req.params.id;
        var accountId = parseInt(self.accountId(req));
        var componentId = req.params.componentId;

        cmsManager.deleteComponent(pageId, componentId, function(err, value){
            self.log.debug('<< deleteComponent');
            self.sendResultOrError(res, err, value, "Error deleting component");
            self = null;
        });

    },

    updateComponentOrder: function(req, res) {
        //TODO: Add Security
        var self = this;
        self.log.debug('>> updateComponentOrder');

        var pageId = req.params.id;
        var accountId = parseInt(self.accountId(req));
        var componentId = req.params.componentId;
        var newOrder = req.params.newOrder;

        cmsManager.modifyComponentOrder(pageId, componentId, newOrder, function(err, value){
            self.log.debug('<< updateComponentOrder');
            self.sendResultOrError(res, err, value, "Error deleting component");
            self = null;
        });

    },


    //BLOG POSTS
    createBlogPost: function(req, res) {
        //TODO: Add Security
        var self = this;
        self.log.debug('>> createBlogPost');
        var blogPost = new $$.m.BlogPost(req.body);

        var pageId = req.params.id;
        var accountId = parseInt(self.accountId(req));

        blogPost.set('accountId', accountId);
        blogPost.set('pageId', pageId);

        cmsManager.createBlogPost(accountId, blogPost, function(err, value){
            self.log.debug('<< createBlogPost'+JSON.stringify(blogPost));
            self.sendResultOrError(res, err, value, "Error creating Blog Post");
            self = null;
        });
    },

    getBlogPost: function(req, res) {
        //TODO: Add Security
        var self = this;
        self.log.debug('>> getBlogPost');
        var accountId = parseInt(self.accountId(req));
        var blogPostId = req.params.postId;
        self.log.debug('Account ID: '+accountId+' Blog Post ID: '+blogPostId);
        cmsManager.getBlogPost(accountId, blogPostId, function(err, value){
            self.log.debug('<< getBlogPost');
            self.sendResultOrError(res, err, value, "Error getting Blog Post");
            self = null;
        });
    },

    updateBlogPost: function(req, res) {
        //TODO: Add Security
        var self = this;
        self.log.debug('>> updateBlogPost');
        var blogPost = new $$.m.BlogPost(req.body);
        var postId = req.params.postId;
        var pageId = req.params.id;
        var accountId = self.accountId(req);
        blogPost.set('accountId', accountId.toString());
        blogPost.set('_id', postId);
        blogPost.set('pageId', pageId);

        console.dir(req.body);

        cmsManager.updateBlogPost(accountId, blogPost, function(err, value){
            self.log.debug('<< updateBlogPost');
            self.sendResultOrError(res, err, value, "Error updating Blog Post");
            self = null;
        });
    },

    deleteBlogPost: function(req, res) {
        //TODO: Add Security
        var self = this;
        self.log.debug('>> deleteBlogPost');
        var accountId = self.accountId(req);
        var blogPostId = req.params.postId;
        var pageId = req.params.id;
        self.log.debug('deleting post with id: ' + blogPostId);

        cmsManager.deleteBlogPost(accountId, pageId, blogPostId, function(err, value){
            self.log.debug('<< deleteBlogPost');
            self.sendResultOrError(res, err, value, "Error deleting Blog Post");
            self = null;
        });
    },

    listBlogPosts: function(req, res) {
        //TODO: Add Security
        //TODO: Need to find a way to iterate through posts
        var self = this;
        self.log.debug('>> listBlogPosts');
        var accountId = self.accountId(req);
        var limit = parseInt(req.query['limit'] || 10);//suitable default?

        cmsManager.listBlogPosts(accountId, limit, function(err, value){
            self.log.debug('<< listBlogPosts');
            self.sendResultOrError(res, err, value, "Error listing Blog Posts");
            self = null;
        });
    },

    getPostsByAuthor: function(req, res){
        //TODO: Add Security
        var self = this;
        self.log.debug('>> getPostsByAuthor');
        var accountId = self.accountId(req);
        var author = req.params.author;

        cmsManager.getPostsByAuthor(accountId, author, function(err, value){
            self.log.debug('<< getPostsByAuthor');
            self.sendResultOrError(res, err, value, "Error getting Blog Posts by author");
            self = null;
        });

    },

    getPostsByTitle: function(req, res) {
        //TODO: Add Security
        var self = this;
        self.log.debug('>> getPostsByTitle');
        var accountId = self.accountId(req);
        var title = req.params.title;

        cmsManager.getPostsByTitle(accountId, title, function(err, value){
            self.log.debug('<< getPostsByTitle');
            self.sendResultOrError(res, err, value, "Error getting Blog Posts by title");
            self = null;
        });
    },

    getPostsByContent: function(req, res) {
        //TODO: Add Security
        var self = this;
        self.log.debug('>> getPostsByContent');
        var accountId = self.accountId(req);
        var content = req.params.content;

        cmsManager.getPostsByData(accountId, content, function(err, value){
            self.log.debug('<< getPostsByContent');
            self.sendResultOrError(res, err, value, "Error getting Blog Posts by content");
            self = null;
        });
    },

    getPostsByCategory: function(req, res) {
        //TODO: Add Security
        var self = this;
        self.log.debug('>> getPostsByCategory');
        var accountId = self.accountId(req);
        var category = req.params.category;

        cmsManager.getPostsByCategory(accountId, category, function(err, value){
            self.log.debug('<< getPostsByCategory');
            self.sendResultOrError(res, err, value, "Error getting Blog Posts by category");
            self = null;
        });
    },

    getPostsByTag: function(req, res) {
        //TODO: Add Security
        var self = this;
        self.log.debug('>> getPostsByTag');
        var accountId = self.accountId(req);
        var tag = req.params.tag;

        cmsManager.getPostsByTag(accountId, [tag], function(err, value){
            self.log.debug('<< getPostsByTag');
            self.sendResultOrError(res, err, value, "Error getting Blog Posts by tag");
            self = null;
        });
    },

    reorderPosts: function(req, res) {
        //TODO: Add Security
        var self = this;
        self.log.debug('>> reorderPosts');
        var accountId = self.accountId(req);
        var pageId = req.params.id;

        var blogComponent = new $$.m.cms.components.Blog(req.body);

        cmsManager.updatePageComponent(pageId,  blogComponent, function(err, value){
            self.log.debug('<< reorderPosts');
            self.sendResultOrError(res, err, value, "Error reordering Blog Posts");
            self = null;
        });

    },

    reorderBlogPost: function(req, res) {
        //TODO: Add Security
        var self = this;
        self.log.debug('>> reorderBlogPost');
        var accountId = self.accountId(req);
        var pageId = req.params.id;
        var postId = "" + req.params.postId;
        var newOrder = req.params.newOrder;

        cmsManager.modifyPostOrder(accountId, postId, pageId, newOrder, function(err, value){
            self.log.debug('<< reorderBlogPost');
            self.sendResultOrError(res, err, value, "Error reordering Blog Posts");
            self = null;
        });
    }

});

module.exports = new api();

