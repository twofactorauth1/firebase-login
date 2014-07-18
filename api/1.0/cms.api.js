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
        app.get(this.url(':accountid/cms/website', "account"), this.isAuthApi, this.getWebsiteForAccountId.bind(this));
        app.post(this.url('website'), this.saveOrUpdateWebsite.bind(this));
        app.put(this.url('website'), this.saveOrUpdateWebsite.bind(this));

        // PAGE
        app.get(this.url('website/:websiteid/page/:handle'), this.getPageByHandle.bind(this));
        app.get(this.url('page/:id'), this.getPageById.bind(this));
        app.post(this.url('page'), this.saveOrUpdatePage.bind(this));
        app.put(this.url('page'), this.saveOrUpdatePage.bind(this));

        // THEME
        app.get(this.url('theme/:id'), this.isAuthApi, this.getThemeConfigById.bind(this));
        app.get(this.url(':accountid/cms/theme', "account"), this.isAuthApi, this.getThemeConfigForAccountId.bind(this));
        app.get(this.url('themes'), this.isAuthApi, this.getAllThemes.bind(this));

        // BLOG POSTS
        app.post(this.url('website/:id/blog'), this.isAuthApi, this.createBlogPost.bind(this));
        app.get(this.url('website/:id/blog'), this.isAuthApi, this.listBlogPosts.bind(this));
        app.get(this.url('website/:id/blog/:postId'), this.isAuthApi, this.getBlogPost.bind(this));
        app.post(this.url('website/:id/blog/:postId'), this.isAuthApi, this.updateBlogPost.bind(this));
        app.delete(this.url('website/:id/blog/:postId'), this.isAuthApi, this.deleteBlogPost.bind(this));
        app.get(this.url('website/:id/blog/author/:author'), this.isAuthApi, this.getPostsByAuthor.bind(this));
        app.get(this.url('website/:id/blog/title/:title'), this.isAuthApi, this.getPostsByTitle.bind(this));
        app.get(this.url('website/:id/blog/content/:content'), this.isAuthApi, this.getPostsByContent.bind(this));
        app.get(this.url('website/:id/blog/category/:category'), this.isAuthApi, this.getPostsByCategory.bind(this));
        app.get(this.url('website/:id/blog/tag/:tag'), this.isAuthApi, this.getPostsByTag.bind(this));

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
    //endregion


    //region PAGE
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


    saveOrUpdatePage: function(req, resp) {
        //TODO: Add Security
        var self = this;
        var _page = req.body;

        var page = new Page(_page);
        cmsDao.saveOrUpdate(page, function(err, value) {
            self.sendResultOrError(resp, err, value, "Error saving website Page");
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
        var accountId = req.params.accountid;

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
    //endregion


    //BLOG POSTS
    createBlogPost: function(req, res) {
        //TODO: Add Security
        var self = this;
        self.log.debug('>> createBlogPost');
        var blogPost = new $$.m.BlogPost(req.body);
        self.log.debug('got a blogPost:');
        console.dir(blogPost);
        var websiteId = req.params.id;

        //accountID needs to be a number for authentication
        var accountId = parseInt(self.accountId(req));

        //accountID needs to be a string for blog post
        blogPost.set('accountId', accountId.toString());
        blogPost.set('websiteId', websiteId);

        cmsManager.createBlogPost(accountId, blogPost, function(err, value){
            self.log.debug('<< createBlogPost');
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
        var accountId = self.accountId(req);
        blogPost.set('accountId', accountId);
        blogPost.set('_id', postId);

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
        self.log.debug('deleting post with id: ' + blogPostId);

        cmsManager.deleteBlogPost(accountId, blogPostId, function(err, value){
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
    }

});

module.exports = new api();

