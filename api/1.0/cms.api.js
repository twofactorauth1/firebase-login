/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../base.api.js');

//TODO: there shouldn't be DAO references here

var cmsDao = require('../../cms/dao/cms.dao.js');
var mandrillHelper = require('../../utils/mandrillhelper');
var Page = require('../../cms/model/page');
var Topic = require('../../cms/model/topic');
require('../../cms/model/email');
//var Components = require('../../cms/model/components');


var cmsManager = require('../../cms/cms_manager');
var preRenderConfig = require('../../configs/prerender.config');
var request = require('request');

var api = function () {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "cms",

    dao: cmsDao,

    initialize: function () {
        // WEBSITE
        //app.get(this.url('website/:id'), this.isAuthApi, this.getWebsiteById.bind(this));
        app.get(this.url('website/:id'), this.setup.bind(this), this.getWebsiteById.bind(this)); //Temp Added
        app.get(this.url(':accountid/cms/website', "account"), this.isAuthApi.bind(this), this.getWebsiteForAccountId.bind(this));
        app.post(this.url('website'), this.isAuthAndSubscribedApi.bind(this), this.saveOrUpdateWebsite.bind(this));
        app.put(this.url('website'), this.isAuthAndSubscribedApi.bind(this), this.saveOrUpdateWebsite.bind(this));

        // WEBSITE LINKS
        app.get(this.url('website/:id/linklists'), this.isAuthApi.bind(this), this.getWebsiteLinklists.bind(this));
        app.get(this.url('website/:id/linklists/:handle'), this.isAuthApi.bind(this), this.getWebsiteLinklistsByHandle.bind(this));
        app.post(this.url('website/:id/linklists'), this.isAuthApi.bind(this), this.addWebsiteLinklists.bind(this));
        app.post(this.url('website/:id/linklists/:handle'), this.isAuthAndSubscribedApi.bind(this), this.updateWebsiteLinklists.bind(this));
        app.delete(this.url('website/:id/linklists/:handle'), this.isAuthAndSubscribedApi.bind(this), this.deleteWebsiteLinklists.bind(this));

        // PAGE
        app.get(this.url('website/:websiteid/page/:handle'), this.setup.bind(this), this.getPageByHandle.bind(this));
        app.get(this.url('page/:id'), this.setup.bind(this), this.getPageById.bind(this));
        app.get(this.url('page/:id/versions'), this.isAuthAndSubscribedApi.bind(this), this.getPageVersionsById.bind(this));
        app.get(this.url('page/:id/versions/:version'), this.isAuthAndSubscribedApi.bind(this), this.getPageVersionsById.bind(this));
        app.delete(this.url('page/:id/versions/:version'), this.isAuthAndSubscribedApi.bind(this), this.deletePageVersionById.bind(this));
        app.post(this.url('page/:id/revert'), this.isAuthAndSubscribedApi.bind(this), this.revertPage.bind(this));
        app.post(this.url('page/:id/revert/:version'), this.isAuthAndSubscribedApi.bind(this), this.revertPage.bind(this));
        app.put(this.url('page'), this.isAuthApi.bind(this), this.saveOrUpdatePage.bind(this));
        app.get(this.url('page/:handle/screenshot'), this.isAuthApi.bind(this), this.generateScreenshot.bind(this));
        app.get(this.url('page/:handle/savedscreenshot'), this.isAuthApi.bind(this), this.getScreenshot.bind(this));
        app.get(this.url('website/:id/page/secure/:handle'), this.isAuthApi.bind(this), this.getSecurePage.bind(this));
        app.get(this.url('page/secure/:handle'), this.isAuthApi.bind(this), this.getSecurePage.bind(this));
        ///api/1.0/cms/website/{id}/page/secure/{handle} and at /api/1.0/cms/page/secure/{handle}


        //consistent URLs

        app.get(this.url('website/:websiteId/pages/:id'), this.setup.bind(this), this.getPagesById.bind(this));
        app.get(this.url('website/:websiteId/pages'), this.setup.bind(this), this.getAllPages.bind(this));
        app.get(this.url('website/:websiteId/pagesheartbeat'), this.setup.bind(this), this.getPageHeartbeat.bind(this));
        app.get(this.url('website/:websiteId/page/:id'), this.setup.bind(this), this.getPageById.bind(this));
        app.post(this.url('website/:websiteId/page'), this.isAuthAndSubscribedApi.bind(this), this.createPage.bind(this));
        app.post(this.url('website/:websiteId/duplicate/page'), this.isAuthAndSubscribedApi.bind(this), this.createDuplicatePage.bind(this));
        app.post(this.url('website/:websiteId/page/:id'), this.isAuthAndSubscribedApi.bind(this), this.updatePage.bind(this));
        app.put(this.url('website/:websiteId/page'), this.isAuthAndSubscribedApi.bind(this), this.createPage.bind(this));
        app.put(this.url('website/:websiteId/page/:id'), this.isAuthAndSubscribedApi.bind(this), this.updatePage.bind(this));
        app.delete(this.url('website/:websiteId/page/:id/:label'), this.isAuthAndSubscribedApi.bind(this), this.deletePage.bind(this));

        app.get(this.url('website/:websiteId/emails'), this.setup.bind(this), this.getAllEmails.bind(this));
        app.get(this.url('email/:id'), this.setup.bind(this), this.getEmailById.bind(this));
        app.post(this.url('email'), this.isAuthAndSubscribedApi.bind(this), this.createEmail.bind(this));
        app.post(this.url('testemail'), this.isAuthAndSubscribedApi.bind(this), this.testEmail.bind(this));
        app.put(this.url('email/:id'), this.isAuthAndSubscribedApi.bind(this), this.updateEmail.bind(this));
        app.delete(this.url('email/:id'), this.isAuthAndSubscribedApi.bind(this), this.deleteEmail.bind(this));

        // TEMPLATES
        app.get(this.url('template'), this.isAuthApi.bind(this), this.listTemplates.bind(this));
        // app.get(this.url('template/:id'), this.isAuthApi.bind(this), this.getTemplateById.bind(this));
        // app.get(this.url('template/name/:name'), this.isAuthApi.bind(this), this.getTemplateByName.bind(this));
        // app.post(this.url('template'), this.isAuthAndSubscribedApi.bind(this), this.createTemplate.bind(this));
        // app.post(this.url('template/website/:websiteId'), this.isAuthAndSubscribedApi.bind(this), this.createTemplateFromWebsite.bind(this));
        app.post(this.url('template/:id'), this.isAuthAndSubscribedApi.bind(this), this.updateTemplate.bind(this));
        // app.delete(this.url('template/:id'), this.isAuthAndSubscribedApi.bind(this), this.deleteTemplate.bind(this));
        // app.put(this.url('template/:id/website'), this.isAuthAndSubscribedApi.bind(this), this.createWebsiteFromTemplate.bind(this));
        app.post(this.url('template/:id/website/:websiteId/page'), this.isAuthAndSubscribedApi.bind(this), this.createPageFromTemplate.bind(this));
        // app.post(this.url('template/:themeId/website/:websiteId'), this.isAuthApi.bind(this), this.setTemplate.bind(this));

        // TOPICS
        app.get(this.url('topic'), this.isAuthApi.bind(this), this.listTopics.bind(this));
        app.post(this.url('topic'), this.isAuthAndSubscribedApi.bind(this), this.createTopic.bind(this));
        app.put(this.url('topic/:id'), this.isAuthAndSubscribedApi.bind(this), this.updateTopic.bind(this));
        app.delete(this.url('topic/:id'), this.isAuthAndSubscribedApi.bind(this), this.deleteTopic.bind(this));

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
        app.post(this.url('component/:type'), this.isAuthAndSubscribedApi.bind(this), this.addNewComponent.bind(this));

        // BLOG POSTS
        app.post(this.url('page/:id/blog'), this.isAuthAndSubscribedApi.bind(this), this.createBlogPost.bind(this));
        app.get(this.url('page/:id/blog'), this.setup.bind(this), this.listBlogPostsByPageId.bind(this));
        app.get(this.url('blog'), this.setup.bind(this), this.listBlogPosts.bind(this));
        app.get(this.url('editor/blog'), this.isAuthAndSubscribedApi.bind(this), this.listAllBlogPosts.bind(this));
        app.get(this.url('website/:id/blog/:handle'), this.setup.bind(this), this.getBlogPostByUrl.bind(this));
        app.get(this.url('website/:websiteid/page/:handle'), this.setup.bind(this), this.getPageByHandle.bind(this));
        app.get(this.url('editor/blog/:postId'), this.isAuthAndSubscribedApi.bind(this), this.getEditableBlogPost.bind(this));
        app.get(this.url('website/:id/page/blog/:title'), this.setup.bind(this), this.getBlogPostByTitle.bind(this));
        app.get(this.url('page/:id/blog/:postId'), this.setup.bind(this), this.getBlogPost.bind(this));
        app.post(this.url('page/:id/blog/:postId'), this.isAuthAndSubscribedApi.bind(this), this.updateBlogPost.bind(this));
        app.put(this.url('page/:id/blog/:postId'), this.isAuthAndSubscribedApi.bind(this), this.updateBlogPost.bind(this));
        app.delete(this.url('page/:id/blog/:postId'), this.isAuthAndSubscribedApi.bind(this), this.deleteBlogPost.bind(this));
        app.post(this.url('page/:id/blogposts'), this.isAuthAndSubscribedApi.bind(this), this.bulkDeleteBlogPost.bind(this));
        app.get(this.url('page/:id/blog/author/:author'), this.setup.bind(this), this.getPostsByAuthor.bind(this));
        app.get(this.url('page/:id/blog/title/:title'), this.setup.bind(this), this.getPostsByTitle.bind(this));
        app.get(this.url('page/:id/blog/content/:content'), this.setup.bind(this), this.getPostsByContent.bind(this));
        app.get(this.url('page/:id/blog/category/:category'), this.setup.bind(this), this.getPostsByCategory.bind(this));
        app.get(this.url('page/:id/blog/tag/:tag'), this.setup.bind(this), this.getPostsByTag.bind(this));
        app.post(this.url('page/:id/blog/posts/reorder'), this.isAuthAndSubscribedApi.bind(this), this.reorderPosts.bind(this));
        app.post(this.url('page/:id/blog/:postId/reorder/:newOrder'), this.isAuthAndSubscribedApi.bind(this), this.reorderBlogPost.bind(this));
        app.put(this.url('page/:id/blog/status/:postId'), this.isAuthAndSubscribedApi.bind(this), this.publishPost.bind(this));

        //authors, tags, categories, titles
        app.get(this.url('blog/authors'), this.setup.bind(this), this.getBlogAuthors.bind(this));
        app.get(this.url('blog/tags'), this.setup.bind(this), this.getBlogTags.bind(this));
        app.get(this.url('blog/categories'), this.setup.bind(this), this.getBlogCategories.bind(this));
        app.get(this.url('blog/titles'), this.setup.bind(this), this.getBlogTitles.bind(this));
    },


    //region WEBSITE
    getWebsiteById: function(req, resp) {

        var self = this;
        var websiteId = req.params.id;
        var accountId = self.currentAccountId(req);
        //TODO: Add security - VIEW_WEBSITE - *CURRENTLY GLOBAL READ*

        cmsDao.getWebsiteById(websiteId, function (err, value) {
            self.sendResultOrError(resp, err, value, "Error Retrieving Website by Id");
            self = null;
        });
    },

    saveOrUpdateWebsite: function(req, resp) {

        var self = this;
        self.log.debug('>> saveOrUpdateWebsite');
        var settings = req.body;
        var accountId = req.body.accountId;
        var websiteId = req.body._id;
        //console.log('Other Data: '+JSON.stringify(req.body));

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed){
            if(isAllowed !== true) {
                return self.send403(resp);
            } else {
                cmsDao.updateWebsiteSettings(settings, accountId, websiteId, function (err, value) {
                    self.log.debug('<< saveOrUpdateWebsite');
                    self.sendResultOrError(resp, err, value, "Error retrieving website by account id");
                    self.createUserActivity(req, 'UPDATE_WEBSITE_SETTINGS', null, null, function(){});
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
                return self.send403(resp);
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
                return self.send403(res);
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
                return self.send403(res);
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
                return self.send403(res);
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
                return self.send403(res);
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
                return self.send403(res);
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
        var accountId = parseInt(self.currentAccountId(req));

        cmsDao.getLatestPageForWebsite(websiteId, pageHandle, accountId, function (err, value) {
            if (!value) {
                err = $$.u.errors._404_PAGE_NOT_FOUND;
            }
            self.sendResultOrError(resp, err, value, "Error Retrieving Page for Website", err);
            self = null;
        });
    },

    testEmail: function(req, resp) {
        var self = this;
        self.log.debug('testEmail >>> ');

        self.log.debug('testEmail >>> req.body', req.body);

        var emailDataObj = req.body;
        self.log.debug('emailAddress.email >>> ', emailDataObj.address.email);
        self.log.debug('emailContent.fromEmail >>> ', emailDataObj.content.fromEmail);
        self.log.debug('emailContent.fromName >>> ', emailDataObj.content.fromName);
        self.log.debug('emailContent.replyTo >>> ', emailDataObj.content.replyTo);
        self.log.debug('emailContent.subject >>> ', emailDataObj.content.subject);
        var accountId = parseInt(self.currentAccountId(req));
        
        var components = [];
        var keys = ['logo','title','text','text1','text2','text3'];
        var regex = new RegExp('src="//s3.amazonaws', "g");

        emailDataObj.content.components.forEach(function(component){
            if(component.visibility){
                for (var i = 0; i < keys.length; i++) {
                    if (component[keys[i]]) {
                        component[keys[i]] = component[keys[i]].replace(regex, 'src="http://s3.amazonaws');
                    }
                }
                if (!component.bg.color) {
                    component.bg.color = '#ffffff';
                }
                if (!component.emailBg) {
                    component.emailBg = '#ffffff';
                }
                if (component.bg.img && component.bg.img.show && component.bg.img.url) {
                    component.emailBgImage = component.bg.img.url.replace('//s3.amazonaws', 'http://s3.amazonaws');
                }
                if (!component.txtcolor) {
                    component.txtcolor = '#000000';
                }
                components.push(component);
            }
        });
        
        self.log.debug('components >>> ', components);
        
        app.render('emails/base_email_v2', { components: components }, function(err, html){
            if(err) {
                self.log.error('error rendering html: ' + err);
                self.log.warn('email will not be sent.');
            } else {
                //fromAddress, fromName, toAddress, toName, subject, html, accountId, vars, emailId, fn)
                mandrillHelper.sendBasicEmail(
                    emailDataObj.content.fromEmail,
                    emailDataObj.content.fromName,
                    emailDataObj.address.email,
                    emailDataObj.address.name || "tester's name",
                    emailDataObj.content.subject,
                    // '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/><meta property="og:title" content="*|MC:SUBJECT|*"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/><title>*|MC:SUBJECT|*</title><meta http-equiv="X-UA-Compatible" content="IE=edge"/></head><body><div style="width: 100%; -webkit-text-size-adjust: 100% !important; -ms-text-size-adjust: 100% !important; margin: 0; padding: 0;"><table width="100%" align="center" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;"><tr><td><table width="100%" align="center" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;background-color:#eaeaea;"><tr><td align="center" width="100%"><table align="center" width="640" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;background-color:#ffffff;margin-top: 45px; margin-bottom: 45px;" class="device-width"><tr><td width="100%" style="padding-left: 20px; padding-right: 20px;" class="wrapper"><table width="640" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;" class="device-width"><tr><td width="100%" style="padding-top: 30px;" class="device-width"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;" class="device-width"><tr><td width="100%" style="text-align: center; padding-bottom: 15px; padding-left:20px;padding-right:20px" class="device-width"><div><img alt="" src="http://s3.amazonaws.com/indigenous-digital-assets/account_1047/unnamed (1)_1442509762427.png"/></div></td></tr></table><hr/></td></tr></table><table width="640" align="center" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;" ng-if="component.title" class="device-width"><tr><td align="center" width="100%"><table align="center" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;" class="device-width"><tr><td width="100%" style="padding-left: 20px; padding-right: 20px; padding-top: 45px; padding-bottom: 45px;" class="wrapper"><div><span style="color:#333333;"><span style="font-size:48px;"><span style="font-family:arial,helvetica,sans-serif;">Hero Title</span></span></span></div></td></tr></table></td></tr></table><table width="640" align="center" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;" ng-if="component.title" class="device-width"><tr><td align="center" width="100%"><table align="center" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;" class="device-width"><tr><td width="100%" style="padding-left: 20px; padding-right: 20px; padding-top: 45px; padding-bottom: 45px;" class="wrapper"><div><div style="text-align: center;"><img alt="" src="http://s3.amazonaws.com/indigenous-digital-assets/account_1047/design-your-website_1442510188642.png"/></div><br/><br/><br/><span style="line-height:1.5;"><span style="font-size:16px;"><span style="font-family:arial,helvetica,sans-serif;">A afas dfa dsf asddddd adsf dsafd fasd.&nbsp;A afas dfa dsf asddddd adsf dsafd fasd. &nbsp; A afas dfa dsf asddddd adsf asd dddddddd d sf ss df dsfd dsafd fasd. A afas dfa dsf asddddd adsf dsafd fasd.&nbsp;&nbsp;A afas dfa dsf asddddd adsf dsafd fasd.&nbsp;&nbsp;&nbsp;A afas dfa dsf asddddd adsf asd dddddddd d sf ss df dsfd dsafd fasd.&nbsp; A afas dfa dsf asddddd adsf dsafd fasd.&nbsp;&nbsp;&nbsp;A afas dfa dsf asddddd adsf asd dddddddd d sf ss df dsfd dsafd fasd. A afas dfa dsf asddddd adsf dsafd fasd.</span></span></span></div></td></tr></table></td></tr></table><table width="640" align="center" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;" ng-if="component.title" class="device-width"><tr><td align="center" width="100%"><table align="center" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;" class="device-width"><tr><td width="100%" style="padding-left: 20px; padding-right: 20px; padding-top: 45px; padding-bottom: 45px;" class="wrapper"><div><span style="color:#333333;"><span style="font-size:48px;"><span style="font-family:arial,helvetica,sans-serif;">Hero Title</span></span></span></div></td></tr></table></td></tr></table><table width="640" align="center" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;" ng-if="component.title" class="device-width"><tr><td align="center" width="100%"><table align="center" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;" class="device-width"><tr><td width="100%" style="padding-left: 20px; padding-right: 20px; padding-top: 45px; padding-bottom: 45px;" class="wrapper"><div><div style="text-align:center"><img alt="" src="http://s3.amazonaws.com/indigenous-digital-assets/account_1047/design-your-website_1442510188642.png"/></div><br/><br/><br/><span style="line-height:1.5;"><span style="font-size:16px;"><span style="font-family:arial,helvetica,sans-serif;">A afas dfa dsf asddddd adsf dsafd fasd.&nbsp;A afas dfa dsf asddddd adsf dsafd fasd. &nbsp; A afas dfa dsf asddddd< adsf asd dddddddd d sf ss df dsfd dsafd fasd. A afas dfa dsf asddddd adsf dsafd fasd.&nbsp;&nbsp;A afas dfa dsf asddddd adsf dsafd fasd.&nbsp;&nbsp;&nbsp;A afas dfa dsf asddddd adsf asd dddddddd d sf ss df dsfd dsafd fasd.&nbsp; A afas dfa dsf asddddd adsf dsafd fasd.&nbsp;&nbsp;&nbsp;A afas dfa dsf asddddd adsf asd dddddddd d sf ss df dsfd dsafd fasd. A afas dfa dsf asddddd adsf dsafd fasd.dfsgfds gs dfgdfs gfsd gfdsg sdfg fdsg fdsg sfdg fdsgfsdgfsdgfdsg sfdgsdfg.<br/><br/><br/>&nbsp;sdfgsdgdfsgsfdg.</span></span></span><br/><br/>&nbsp;<div class="ckeditor-button-wrap" data-href="http://yahoo.com" data-text-value="Download123" style="margin: 0; font-size: inherit;"><table align="center" style="width: 100%;" unselectable="on" contendeditable="false"><tbody><tr unselectable="on" contendeditable="false"><td style="-moz-box-shadow: 0px 1px 0px 0px #ffe0b5;-webkit-box-shadow: 0px 1px 0px 0px #ffe0b5;box-shadow: 0px 1px 0px 0px #ffe0b5;background:-webkit-gradient(linear, left top, left bottom, color-stop(0.05, #fbb450), color-stop(1, #f89306));background:-moz-linear-gradient(top, #fbb450 5%, #f89306 100%);background:-webkit-linear-gradient(top, #fbb450 5%, #f89306 100%);background:-o-linear-gradient(top, #fbb450 5%, #f89306 100%);background:-ms-linear-gradient(top, #fbb450 5%, #f89306 100%);background:linear-gradient(to bottom, #fbb450 5%, #f89306 100%);filter:progid:DXImageTransform.Microsoft.gradient(startColorstr=\'#fbb450\', endColorstr=\'#f89306\',GradientType=0);background-color:#fbb450;-moz-border-radius:7px;-webkit-border-radius:7px;border-radius:7px;border:1px solid #c97e1c;display:inline-block;color:#ffffff;font-family:trebuchet ms;font-size:17px;font-weight:normal;font-style:%1;padding:6px 11px;text-decoration:none;text-shadow:0px 1px 0px #8f7f24;" class="myButton" unselectable="on" contendeditable="false"><a style="color: inherit;" href="http://yahoo.com">DEFAULT - Download123</a></td></tr></tbody></table></div><div class="ckeditor-button-wrap" data-href="http://yahoo.com" data-text-value="Download123" style="margin: 0; font-size: inherit;"><table align="center" style="width: 100%;" unselectable="on" contendeditable="false"><tbody><tr unselectable="on" contendeditable="false"><td style="-moz-box-shadow: 0px 1px 0px 0px #ffe0b5;-webkit-box-shadow: 0px 1px 0px 0px #ffe0b5;box-shadow: 0px 1px 0px 0px #ffe0b5;background-color:#fbb450;-moz-border-radius:7px;-webkit-border-radius:7px;border-radius:7px;border:1px solid #c97e1c;display:inline-block;color:#ffffff;font-family:trebuchet ms;font-size:17px;font-weight:normal;padding:6px 11px;text-decoration:none;text-shadow:0px 1px 0px #8f7f24;" class="myButton" unselectable="on" contendeditable="false"><a style="color: inherit;" href="http://yahoo.com">NO GRADIENT - Download123</a></td></tr></tbody></table></div><div class="ckeditor-button-wrap" data-href="http://yahoo.com" data-text-value="Download123" style="margin: 0; font-size: inherit;"><table align="center" style="width: 100%;" unselectable="on" contendeditable="false"><tbody><tr unselectable="on" contendeditable="false"><td style="background-color:#fbb450;-moz-border-radius:7px;-webkit-border-radius:7px;border-radius:7px;border:1px solid #c97e1c;display:inline-block;color:#ffffff;font-family:trebuchet ms;font-size:17px;font-weight:normal;padding:6px 11px;text-decoration:none;text-shadow:0px 1px 0px #8f7f24;" class="myButton" unselectable="on" contendeditable="false"><a style="color: inherit;" href="http://yahoo.com">NO GRADIENT OR BOX SHADOW - Download123</a></td></tr></tbody></table></div><div class="ckeditor-button-wrap" data-href="http://yahoo.com" data-text-value="Download123" style="margin: 0; font-size: inherit;"><table align="center" style="width: 100%;" unselectable="on" contendeditable="false"><tbody><tr unselectable="on" contendeditable="false"><td style="background-color:#fbb450;border:1px solid #c97e1c;display:inline-block;color:#ffffff;font-family:trebuchet ms;font-size:17px;font-weight:normal;padding:6px 11px;text-decoration:none;text-shadow:0px 1px 0px #8f7f24;" class="myButton" unselectable="on" contendeditable="false"><a style="color: inherit;" href="http://yahoo.com">NO CSS3 except text-shadow - Download123</a></td></tr></tbody></table></div><div class="ckeditor-button-wrap" data-href="http://yahoo.com" data-text-value="Download123" style="margin: 0; font-size: inherit;"><table align="center" style="width: 100%;" unselectable="on" contendeditable="false"><tbody><tr unselectable="on" contendeditable="false"><td style="background-color:#fbb450;"><a style="color: inherit;" href="http://yahoo.com">JUST BG=Download123</a></td></tr></tbody></table></div><span style="line-height:1.5;"><span style="font-size:16px;"><span style="font-family:arial,helvetica,sans-serif;"></span></span></span><br/>&nbsp;</div></td></tr></table></td></tr></table><table width="640" align="center" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;" ng-if="component.title" class="device-width"><tr><td align="center" width="100%"><table align="center" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;" class="device-width"><tr><td width="100%" style="padding-left: 20px; padding-right: 20px; padding-top: 45px; padding-bottom: 45px;" class="wrapper"><div>1 column Title</div></td></tr></table></td></tr></table><table width="640" align="center" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;" ng-if="component.title" class="device-width"><tr><td align="center" width="100%"><table align="center" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;" class="device-width"><tr><td width="100%" style="padding-left: 20px; padding-right: 20px; padding-top: 45px; padding-bottom: 45px;" class="wrapper"><div>text1</div></td></tr></table></td></tr></table><table width="640" align="center" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;" ng-if="component.title" class="device-width"><tr><td align="center" width="100%"><table align="center" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;" class="device-width"><tr><td width="100%" style="padding-left: 20px; padding-right: 20px; padding-top: 45px; padding-bottom: 45px;" class="wrapper"><div>text2</div></td></tr></table></td></tr></table><table width="640" align="center" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;" ng-if="component.title" class="device-width"><tr><td align="center" width="100%"><table align="center" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;" class="device-width"><tr><td width="100%" style="padding-left: 20px; padding-right: 20px; padding-top: 45px; padding-bottom: 45px;" class="wrapper"><div>EMAIL FOOTER</div></td></tr></table></td></tr></table><table width="640" align="center" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;" ng-if="component.title" class="device-width"><tr><td align="center" width="100%"><table align="center" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;" class="device-width"><tr><td width="100%" style="padding-left: 20px; padding-right: 20px; padding-top: 45px; padding-bottom: 45px;" class="wrapper"><div>3-col-text1</div></td></tr></table></td></tr></table><table width="640" align="center" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;" ng-if="component.title" class="device-width"><tr><td align="center" width="100%"><table align="center" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;" class="device-width"><tr><td width="100%" style="padding-left: 20px; padding-right: 20px; padding-top: 45px; padding-bottom: 45px;" class="wrapper"><div>3-col-text2</div></td></tr></table></td></tr></table><table width="640" align="center" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;" ng-if="component.title" class="device-width"><tr><td align="center" width="100%"><table align="center" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;" class="device-width"><tr><td width="100%" style="padding-left: 20px; padding-right: 20px; padding-top: 45px; padding-bottom: 45px;" class="wrapper"><div>3-col-text3</div></td></tr></table></td></tr></table></td></tr></table></td></tr></table></td></tr></table></div></body></html>',
                    html,
                    accountId,
                    [],
                    null,
                    function(err, result){
                      self.log.debug('mandrill return');
                      self.sendResultOrError(resp, err, result, "Error Sending Test Email");
                });
            }
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
        var accountId = parseInt(self.currentAccountId(req));
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
        var accountId = parseInt(self.currentAccountId(req));

        cmsDao.getPageById(pageId, function (err, value) {
            self.sendResultOrError(resp, err, value, "Error Retrieving Page by Id");
            self = null;
        });
    },

    /**
     * This method requires security.  It expects up to two url params: :id and :version
     * @param req
     * @param resp
     */
    getPageVersionsById: function(req, resp) {
        var self = this;
        self.log.debug('>> getPageVersionsById');
        var pageId = req.params.id;
        var version = 'all';
        var accountId = parseInt(self.accountId(req));
        if(req.params.version) {
            version = parseInt(req.params.version);
        }
        self.checkPermissionForAccount(req, self.sc.privs.VIEW_WEBSITE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                cmsManager.getPageVersions(pageId, version, function(err, pages){
                    self.log.debug('<< getPageVersionsById');
                    self.sendResultOrError(resp, err, pages, "Error Retrieving Page Versions");
                    self = null;
                    return;
                });
            }
        });

    },

    deletePageVersionById: function(req, resp) {
        var self = this;
        self.log.debug('>> deletePageVersionById');
        var pageId = req.params.id;
        var version = parseInt(req.params.version);
        var accountId = parseInt(self.accountId(req));

        if(!pageId || !version) {
            self.log.error('pageId or version not specified');
            return self.wrapError(resp, 400, 'Bad Request', 'Both pageId and version are required');
        }

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                cmsManager.deletePageVersion(pageId, version, function(err, result){
                    self.log.debug('<< deletePageVersionById');
                    if(!err) {
                        result = {success:true};
                    }
                    self.sendResultOrError(resp, err, result, "Error Deleting Page Versions");
                    self.createUserActivity(req, 'DELETE_PAGE_VERSION', null, {pageId: pageId, version: version}, function(){});
                    self = null;
                    return;
                });
            }
        });

    },

    /**
     * This method requires security.  It expects up to two url params: :id, and :version
     * @param req
     * @param resp
     */
    revertPage: function(req, resp) {
        var self = this;
        self.log.debug('>> revertPage');
        var pageId = req.params.id;
        var version = 'latest';
        var accountId = parseInt(self.accountId(req));
        if(req.params.version) {
            version = parseInt(req.params.version);
        }

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                cmsManager.revertPage(pageId, version, function(err, page){
                    self.log.debug('<< revertPage');
                    self.sendResultOrError(resp, err, page, "Error reverting page version");
                    self.createUserActivity(req, 'REVERT_PAGE', null, {pageId:pageId, version:version}, function(){});
                    self = null;
                    return;
                });
            }
        });

    },

    /**
     * This is only used to create pages.
     * @param req
     * @param resp
     */
    saveOrUpdatePage: function (req, resp) {
        var self = this;
        self.log.debug('>> saveOrUpdatePage');
        var _page = req.body;
        var accountId = parseInt(self.accountId(req));

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                var page = new Page(_page);
                //set screenshot to null so it will refresh properly.
                page.set('screenshot', null);
                cmsDao.saveOrUpdate(page, function (err, updatedPage) {
                    self.sendResultOrError(resp, err, updatedPage, "Error saving website Page");
                    cmsManager.updatePageScreenshot(updatedPage.id(), function(err, value){
                        if(err) {self.log.warn('Error updating screenshot for pageId ' + updatedPage.id() + ': ' + err);}
                        self = null;
                    });
                    var pageUrl = self._buildPageUrl(req, page.get('handle'));
                    self._updatePageCache(pageUrl);
                    self.createUserActivity(req, 'CREATE_PAGE', null, null, function(){});
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
                return self.send403(res);
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
                    page.attributes.modified.date = new Date();
                    page.attributes.created.date = new Date();
                    page.set('websiteId', websiteId);
                    page.set('accountId', accountId);
                    self.log.debug('>> page created');
                    cmsManager.createPage(page, function (err, value) {
                        self.log.debug('<< createPage');
                        self.sendResultOrError(res, err, value, "Error creating Page");
                        cmsManager.updatePageScreenshot(value.id(), function(err, value){
                            if(err) {self.log.warn('Error updating screenshot for pageId ' + value.id() + ': ' + err);}
                            self = null;
                        });
                        var pageUrl = self._buildPageUrl(req, page.get('handle'));
                        self._updatePageCache(pageUrl);
                        self.createUserActivity(req, 'CREATE_PAGE', null, null, function(){});
                    });
                } else {
                    self.log.error('Cannot create null page.');
                    self.wrapError(res, 400, 'Bad Parameter', 'Cannot create a null page.');
                    self = null;
                }
            }
        });

    },

    createDuplicatePage: function (req, res) {
        var self = this;
        self.log.debug('>> createDuplicatePage');

        var websiteId = req.params.websiteId;
        var accountId = parseInt(self.accountId(req));

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
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
                        mainmenu: pageObj.mainmenu,
                        components: pageObj.components,
                        type: pageObj.type
                    });
                    page.attributes.modified.date = new Date();
                    page.attributes.created.date = new Date();
                    page.set('websiteId', websiteId);
                    page.set('accountId', accountId);
                    self.log.debug('>> page created');
                    cmsManager.createPageFromPage(page, function (err, value) {
                        self.log.debug('<< createPage');
                        self.sendResultOrError(res, err, value, "Error creating Page");
                        cmsManager.updatePageScreenshot(value.id(), function(err, value){
                            if(err) {self.log.warn('Error updating screenshot for pageId ' + value.id() + ': ' + err);}
                            self = null;
                        });
                        var pageUrl = self._buildPageUrl(req, page.get('handle'));
                        self._updatePageCache(pageUrl);
                        self.createUserActivity(req, 'CREATE_PAGE', null, null, function(){});
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
                return self.send403(res);
            } else {
                var pageId = req.params.id;
                var _page = req.body;
                var pageObj = new Page(_page);
                console.dir(pageObj);
                pageObj.attributes.modified.date = new Date();
                pageObj.set('screenshot', null);
                cmsManager.updatePage(pageId, pageObj, function (err, value) {
                    self.log.debug('<< updatePage');
                    self.sendResultOrError(res, err, value, "Error updating Page");
                    cmsManager.updatePageScreenshot(pageId, function(err, value){
                        if(err) {self.log.warn('Error updating screenshot for pageId ' + pageId + ': ' + err);}
                        self = null;
                    });
                    var pageUrl = self._buildPageUrl(req, value.get('handle'));
                    self._updatePageCache(pageUrl);
                    self.createUserActivity(req, 'UPDATE_PAGE', null, {pageId: pageId}, function(){});
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
                return self.send403(res);
            } else {
                var pageId = req.params.id;
                var websiteId = req.params.websiteId;
                var label = req.params.label;

                cmsManager.deletePage(pageId, function (err, value) {
                    self.log.debug('<< deletePage');
                    self.log.debug('err:', err);
                    self.log.debug('value:', value);
                    if(err) {
                        self.wrapError(res, 500, err, "Error deleting page");
                    } else {
                        self.send200(res);
                    }
                    //self.sendResultOrError(res, err, value, "Error deleting Page");
                    self.createUserActivity(req, 'DELETE_PAGE', null, {pageId: pageId}, function(){});
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
        var accountId = parseInt(self.currentAccountId(req));
        if(req.query['limit']) {
            var skip = parseInt(req.query['skip'] || 0);
            var limit = parseInt(req.query['limit'] || 0);
            self.log.debug('>> getAllPages with Limit');
            cmsManager.getPagesByWebsiteIdWithLimit(websiteId, accountId, skip, limit, function(err, map){
                self.log.debug('<< getAllPages');
                self.sendResultOrError(res, err, map, 'Error getting all pages for account');
                self = null;
            });
        } else {
            self.log.debug('>> getAllPages without Limit');
            cmsManager.getPagesByWebsiteId(websiteId, accountId, function(err, map){
                self.log.debug('<< getAllPages');
                self.sendResultOrError(res, err, map, 'Error getting all pages for account');
                self = null;
            });
        }
        

    },

    /**
     * Currently no security.
     * @param req
     * @param res
     */
    getPageHeartbeat: function(req, res) {
        var self = this;
        self.log.debug('>> getPageHeartbeat');
        var websiteId = req.params.websiteId;
        var accountId = parseInt(self.currentAccountId(req));
        cmsManager.getPagesLengthByWebsiteId(websiteId, accountId, function(err, value){
            self.log.debug('<< getPageHeartbeat ', value);
            self.sendResultOrError(res, err, {'pagelength': value}, 'Error getting pages heartbeat for account');
            self = null;
        });

    },

    /**
     * Currently no security.
     * @param req
     * @param res
     */
    getAllEmails: function(req, res) {
        var self = this;
        self.log.debug('>> getAllEmails');
        var accountId = parseInt(self.currentAccountId(req));
        self.log.debug('>> getAllEmails without Limit');
            cmsManager.getEmailsByAccountId(accountId, function(err, map){
                self.log.debug('<< getAllEmails');
                self.sendResultOrError(res, err, map, 'Error getting all emails for account');
                self = null;
            });

    },

    /**
     * This method may be called by unauthenticated users.  No security is needed.
     * @param req
     * @param resp
     */
    getEmailById: function (req, resp) {
        var self = this;
        var emailId = req.params.id;
        var accountId = parseInt(self.currentAccountId(req));
        self.log.debug('>> getEmailById');

        cmsDao.getEmailById(emailId, function (err, value) {
            self.sendResultOrError(resp, err, value, "Error Retrieving Email by Id");
            self = null;
        });
    },

    createEmail: function (req, res) {
        var self = this;
        self.log.debug('>> createEmail');

        var accountId = parseInt(self.accountId(req));

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                var emailObj = req.body;
                self.log.debug('>> email body');
                var email = new $$.m.cms.Email(emailObj);
                var temp = $$.u.idutils.generateUUID();
                if (email != null) {

                    email.set('_id', temp);
                    var userId = self.userId(req);
                    email.attributes.modified.date = new Date();
                    email.attributes.modified.by = userId;
                    email.attributes.created.date = new Date();
                    email.attributes.created.by = userId;
                    email.set('accountId', accountId);
                    self.log.debug('>> email created');
                    cmsManager.createEmail(email, function (err, value) {
                        self.log.debug('<< createEmail');
                        self.sendResultOrError(res, err, value, "Error creating Email");

                        self.createUserActivity(req, 'CREATE_EMAIL', null, null, function(){});
                    });
                } else {
                    self.log.error('Cannot create null email.');
                    self.wrapError(res, 400, 'Bad Parameter', 'Cannot create a null email.');
                    self = null;
                }
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
                    cmsManager.updateEmail(email, emailId, function (err, value) {
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

    },

     deleteEmail: function(req, res) {

        var self = this;
        self.log.debug('>> deleteEmail');
        var accountId = parseInt(self.accountId(req));

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                var emailId = req.params.id;

                cmsManager.deleteEmail(emailId, function (err, value) {
                    self.log.debug('<< deleteEmail');
                    self.log.debug('err:', err);
                    self.log.debug('value:', value);
                    if(err) {
                        self.wrapError(res, 500, err, "Error deleting email");
                    } else {
                        self.send200(res);
                    }
                    self.createUserActivity(req, 'DELETE_EMAIL', null, {emailId: emailId}, function(){});
                    self = null;
                });
            }
        });
    },
    //endregion

    //region TEMPLATES

    /*
     app.get(this.url('template'), this.isAuthApi.bind(this), this.listTemplates.bind(this));
    app.get(this.url('template/:id'), this.isAuthApi.bind(this), this.getTemplateById.bind(this));
    app.get(this.url('template/name/:name'), this.isAuthApi.bind(this), this.getTemplateByName.bind(this));
    app.post(this.url('template'), this.isAuthAndSubscribedApi.bind(this), this.createTemplate.bind(this));
    app.post(this.url('template/website/:websiteId'), this.isAuthAndSubscribedApi.bind(this), this.createTemplateFromWebsite.bind(this));
    app.post(this.url('template/:id'), this.isAuthAndSubscribedApi.bind(this), this.updateTemplate.bind(this));
    app.delete(this.url('template/:id'), this.isAuthAndSubscribedApi.bind(this), this.deleteTemplate.bind(this));
    app.put(this.url('template/:id/website'), this.isAuthAndSubscribedApi.bind(this), this.createWebsiteFromTemplate.bind(this));
    app.post(this.url('template/:id/website/:websiteId/page/:handle'), this.isAuthAndSubscribedApi.bind(this), this.createPageFromTemplate.bind(this));
    app.post(this.url('template/:themeId/website/:websiteId'), this.isAuthApi.bind(this), this.setTemplate.bind(this));
     */

    listTemplates: function(req, res) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        self.log.debug('>> listTemplates accountId ', accountId);

        self.checkPermissionForAccount(req, self.sc.privs.VIEW_THEME, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                cmsManager.getAllTemplates(accountId, function(err, value){
                    self.log.debug('<< listTemplates');
                    self.sendResultOrError(res, err, value, 'Error retrieving all templates.');
                });
            }
        });

    },

    // getThemeById: function(req, res) {
    //     var self = this;
    //     self.log.debug('>> getThemeById');

    //     var themeId = req.params.id;
    //     var accountId = parseInt(self.accountId(req));

    //     self.checkPermissionForAccount(req, self.sc.privs.VIEW_THEME, accountId, function(err, isAllowed) {
    //         if (isAllowed !== true) {
    //             return self.send403(res);
    //         } else {
    //             cmsManager.getThemeById(themeId, function(err, value){
    //                 self.log.debug('<< getThemeById');
    //                 self.sendResultOrError(res, err, value, 'Error retrieving theme by id.');
    //             });
    //         }
    //     });


    // },

    // getThemeByName: function(req, res) {
    //     var self = this;
    //     self.log.debug('>> getThemeByName');
    //     var themeName = req.params.name;
    //     var accountId = parseInt(self.accountId(req));
    //     self.checkPermissionForAccount(req, self.sc.privs.VIEW_THEME, accountId, function(err, isAllowed) {
    //         if (isAllowed !== true) {
    //             return self.send403(res);
    //         } else {
    //             cmsManager.getThemeByName(themeName, function(err, value){
    //                 self.log.debug('<< getThemeByName');
    //                 self.sendResultOrError(res, err, value, 'Error retrieving theme by name.');
    //             });
    //         }
    //     });

    // },

    // createTemplate: function(req, res) {
    //     var self = this;

    //     self.log.debug('>> createTemplate');
    //     var accountId = parseInt(self.accountId(req));
    //     var templateObj = new $$.m.cms.Template(req.body);
    //     templateObj.set('accountId', accountId);
    //     templateObj.set('created.by', self.userId(req));

    //     self.checkPermissionForAccount(req, self.sc.privs.MODIFY_THEME, accountId, function(err, isAllowed) {
    //         if (isAllowed !== true) {
    //             return self.send403(res);
    //         } else {
    //             cmsManager.createTemplate(templateObj, function(err, value){
    //                 self.log.debug('<< createTemplate');
    //                 self.sendResultOrError(res, err, value, 'Error creating template.');
    //             });
    //         }
    //     });


    // },

    /**
     * This function creates a new theme from an existing website object.
     * @param {websiteId} websiteID in URL
     * @param {theme} theme object in body of POST.  The name field MUST be populated.
     */
    // createThemeFromWebsite: function(req, res) {
    //     var self = this;
    //     self.log.debug('>> createThemeFromWebsite');

    //     self.checkPermission(req, self.sc.privs.MODIFY_THEME, function(err, isAllowed) {
    //         if (isAllowed !== true) {
    //             return self.send403(res);
    //         } else {
    //             var websiteId = req.params.websiteId;
    //             var accountId = parseInt(self.accountId(req));
    //             var themeObj = new $$.m.cms.Theme(req.body);
    //             if(themeObj.get('name') === '') {
    //                 self.wrapError(res, 400, 'Invalid Parameter', 'Invalid parameter provided for Theme Name');
    //             }
    //             themeObj.set('accountId', accountId);
    //             themeObj.set('created.by', self.userId(req));

    //             cmsManager.createThemeFromWebsite(themeObj, websiteId, null, function(err, value){
    //                 self.log.debug('<< createThemeFromWebsite');
    //                 self.sendResultOrError(res, err, value, 'Error creating theme from website.');
    //             });
    //         }
    //     });


    // },


    updateTemplate: function(req, res) {
        var self = this;
        self.log.debug('>> updateTemplate');
        self.checkPermission(req, self.sc.privs.MODIFY_THEME, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                var templateId = req.params.id;
                var accountId = parseInt(self.accountId(req));
                var templateObj = new $$.m.cms.Template(req.body);
                templateObj.attributes.modified.by = self.userId(req);
                templateObj.attributes.modified.date = new Date();
                templateObj.set('_id', templateId);

                self.log.debug('templateObj ', templateObj);
                cmsManager.updateTemplate(templateObj, function(err, value){
                    self.log.debug('<< updateTemplate ', value.components);
                    self.sendResultOrError(res, err, value, 'Error updating template.');

                });
            }
        });



    },


    // deleteTheme: function(req, res) {
    //     var self = this;
    //     self.log.debug('>> deleteTheme');
    //     self.checkPermission(req, self.sc.privs.MODIFY_THEME, function(err, isAllowed) {
    //         if (isAllowed !== true) {
    //             return self.send403(res);
    //         } else {
    //             var themeId = req.params.id;
    //             var accountId = parseInt(self.accountId(req));

    //             cmsManager.deleteTheme(themeId, function(err, value){
    //                 self.log.debug('<< deleteTheme');
    //                 self.sendResultOrError(res, err, value, 'Error deleting theme.');
    //             });
    //         }
    //     });


    // },

    // createWebsiteFromTheme: function(req, res) {
    //     var self = this;

    //     self.log.debug('>> createWebsiteFromTheme');
    //     self.checkPermission(req, self.sc.privs.MODIFY_WEBSITE, function(err, isAllowed) {
    //         if (isAllowed !== true) {
    //             return self.send403(res);
    //         } else {
    //             var themeId = req.params.id;
    //             var accountId = parseInt(self.accountId(req));

    //             cmsManager.createWebsiteAndPageFromTheme(accountId, themeId, self.userId(req), null, null, function(err, websiteAndPage){
    //                 self.log.debug('<< createWebsiteFromTheme');
    //                 self.sendResultOrError(res, err, websiteAndPage.website, 'Error creating website from theme.');
    //             });
    //         }
    //     });


    // },

    createPageFromTemplate: function(req, res) {
        var self = this;
        self.log.debug('>> createPageFromTemplate');

        self.checkPermission(req, self.sc.privs.MODIFY_WEBSITE, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                var pageData = req.body;
                var templateId = req.params.id;
                var websiteId = req.params.websiteId;
                var accountId = parseInt(self.accountId(req));

                var title = pageData.title;
                var handle = pageData.handle;
                var mainmenu = pageData.mainmenu;
                self.log.debug('>> Page Data: ' + pageData);
                cmsManager.createWebsiteAndPageFromTemplate(accountId, templateId, self.userId(req), websiteId, title, handle, mainmenu, function(err, websiteAndPage){
                    self.log.debug('<< createPageFromTemplate');
                    self.sendResultOrError(res, err, websiteAndPage ? websiteAndPage.page : null, 'Error creating page from template.');
                    if(websiteAndPage)
                        cmsManager.updatePageScreenshot(websiteAndPage.page.id(), function(err, value){
                            if(err) {self.log.warn('Error updating screenshot for pageId ' + websiteAndPage.page.id() + ': ' + err);}
                            self = null;
                        });
                });
            }
        });

    },

    // setTheme: function(req, res) {
    //     var self = this;
    //     self.log.debug('>> setTheme');
    //     self.checkPermission(req, self.sc.privs.MODIFY_ACCOUNT, function(err, isAllowed) {
    //         if (isAllowed !== true) {
    //             return self.send403(res);
    //         } else {
    //             var themeId = req.params.themeId;
    //             var websiteId = req.params.websiteId;
    //             var accountId = parseInt(self.accountId(req));

    //             //TODO: validate this method.
    //             cmsManager.setThemeForAccount(accountId, themeId, function(err, value){
    //                 self.log.debug('<< setTheme');
    //                 self.sendResultOrError(res, err, value, 'Error setting theme on account.');
    //             });
    //         }
    //     });


    // },

    //endregion

    //TOPICS
    listTopics: function(req, res) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        self.log.debug('>> listTopics accountId ', accountId);

        self.checkPermissionForAccount(req, self.sc.privs.VIEW_THEME, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                cmsManager.getAllTopics(accountId, function(err, value){
                    self.log.debug('<< listTopics');
                    self.sendResultOrError(res, err, value, 'Error retrieving all topics.');
                });
            }
        });

    },

    createTopic: function(req, res) {
        var self = this;
        self.log.debug('>> createTopic');

        self.checkPermission(req, self.sc.privs.MODIFY_WEBSITE, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                var topicData = req.body;
                var topic = require('../../cms/model/topic');
                var temp = $$.u.idutils.generateUUID();
                if (topic != null) {
                    self.log.debug('>> topic not null');
                    topic = new Topic({
                        _id: temp,
                        title: topicData.title,
                        category: topicData.category
                    });
                    topic.attributes.modified.date = new Date();
                    topic.attributes.created.date = new Date();
                }
                cmsManager.createTopic(topic, function(err, createdTopic){
                    self.log.debug('<< createTopic');
                    self.sendResultOrError(res, err, createdTopic, 'Error creating topic.');
                });
            }
        });

    },

    updateTopic: function(req, res) {
        var self = this;
        self.log.debug('>> updateTopic');

        self.checkPermission(req, self.sc.privs.MODIFY_WEBSITE, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                var topicId = req.params.id;
                var topicObj = new $$.m.cms.Topic(req.body);
                topicObj.attributes.modified.by = self.userId(req);
                topicObj.attributes.modified.date = new Date();
                topicObj.set('_id', topicId);

                self.log.debug('topicObj ', topicObj);
                cmsManager.updateTopic(topicObj, function(err, value){
                    self.log.debug('<< updateTopic ', value.components);
                    self.sendResultOrError(res, err, value, 'Error updating topic.');

                });
            }
        });

    },

    deleteTopic: function(req, res) {

        var self = this;
        self.log.debug('>> deleteTopic');
        var accountId = parseInt(self.accountId(req));

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                var topicId = req.params.id;

                cmsManager.deleteTopic(topicId, function (err, value) {
                    self.log.debug('<< deleteTopic');
                    self.log.debug('err:', err);
                    self.log.debug('value:', value);
                    if(err) {
                        self.wrapError(res, 500, err, "Error deleting topic");
                    } else {
                        self.send200(res);
                    }
                    self = null;
                });
            }
        });
    },

    //COMPONENTS

    getComponentsByPage: function(req, res) {

        var self = this;
        self.log.debug('>> getComponentsByPage');
        var accountId = parseInt(self.accountId(req));

        var pageId = req.params.id;

        accountId = parseInt(accountId);

        self.checkPermissionForAccount(req, self.sc.privs.VIEW_WEBSITE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
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
                return self.send403(res);
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
                return self.send403(res);
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
                    cmsManager.updatePageScreenshot(pageId, function(err, value){
                        if(err) {self.log.warn('Error updating screenshot for pageId ' + pageId + ': ' + err);}
                        self = null;
                    });
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
                return self.send403(res);
            } else {
                //var componentId = req.params.componentId;

                cmsManager.updatePageComponent(pageId, componentObj, function (err, value) {
                    self.log.debug('<< updateComponent');
                    self.sendResultOrError(res, err, value, "Error updating a component on a page");
                    cmsManager.updatePageScreenshot(pageId, function(err, value){
                        if(err) {self.log.warn('Error updating screenshot for pageId ' + pageId + ': ' + err);}
                        self = null;
                    });
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
                return self.send403(res);
            } else {
                cmsManager.updateAllPageComponents(pageId, componentAry, function (err, value) {
                    self.log.debug('<< updateAllComponents');
                    self.sendResultOrError(res, err, value, "Error updating components");
                    cmsManager.updatePageScreenshot(pageId, function(err, value){
                        if(err) {self.log.warn('Error updating screenshot for pageId ' + pageId + ': ' + err);}
                        self = null;
                    });
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
                return self.send403(res);
            } else {
                var componentId = req.params.componentId;

                cmsManager.deleteComponent(pageId, componentId, function (err, value) {
                    self.log.debug('<< deleteComponent');
                    self.sendResultOrError(res, err, value, "Error deleting component");
                    cmsManager.updatePageScreenshot(pageId, function(err, value){
                        if(err) {self.log.warn('Error updating screenshot for pageId ' + pageId + ': ' + err);}
                        self = null;
                    });
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
                return self.send403(res);
            } else {
                var componentId = req.params.componentId;
                var newOrder = req.params.newOrder;

                cmsManager.modifyComponentOrder(pageId, componentId, newOrder, function (err, value) {
                    self.log.debug('<< updateComponentOrder');
                    self.sendResultOrError(res, err, value, "Error deleting component");
                    cmsManager.updatePageScreenshot(pageId, function(err, value){
                        if(err) {self.log.warn('Error updating screenshot for pageId ' + pageId + ': ' + err);}
                        self = null;
                    });

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
                return self.send403(res);
            } else {
                cmsManager.getComponentVersions(type, function(err, value){
                    self.log.debug('<< getAvailableComponentVersions');
                    self.sendResultOrError(res, err, value, "Error getting component versions");
                    self = null;
                });
            }
        });

    },

    addNewComponent: function(req, res) {
        var self = this;
        self.log.debug('>> addNewComponent');
        var type = req.params.type;


        self.checkPermission(req, self.sc.privs.VIEW_WEBSITE, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                var componentClass = require('../../cms/model/components/' + type);
                if(componentClass != null) {
                    var temp = $$.u.idutils.generateUUID();
                    var componentObj = req.body || {};
                    componentObj._id = temp;
                    componentObj.anchor = temp;
                    componentObj.visibility = true;
                    if(componentObj.version) {
                        componentObj.version = parseInt(componentObj.version);
                    }

                    var component = new componentClass(componentObj);
                    self.log.debug('<< addNewComponent');
                    return self.sendResult(res, component);

                } else {
                    self.log.debug('<< addNewComponent (404)');
                    return self.wrapError(res, 404, 'Component type not found', 'Could not find component for type ' + type);
                }

            }
        });
    },


    //BLOG POSTS
    createBlogPost: function(req, res) {

        var self = this;
        self.log.debug('>> createBlogPost');
        var blog=req.body;
        //if(blog.post_tags && !Array.isArray(blog.post_tags))
            //blog.post_tags=blog.post_tags.split(',');

        var blogPost = new $$.m.BlogPost(blog);
        //var blogPost = new $$.m.BlogPost(req.body);

        var pageId = req.params.id;
        var accountId = parseInt(self.accountId(req));

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                blogPost.set('accountId', accountId);
                blogPost.set('pageId', pageId);
                blogPost.attributes.modified.date = new Date();
                blogPost.attributes.created.date = new Date();
                if(!blogPost.attributes.publish_date)
                    blogPost.attributes.publish_date = moment().format('MM/DD/YYYY');
                self.log.debug('<< Publish Date is' + blogPost.attributes.publish_date);
                cmsManager.createBlogPost(accountId, blogPost, function (err, value) {
                    self.log.debug('<< createBlogPost' + JSON.stringify(blogPost));
                    self.sendResultOrError(res, err, value, "Error creating Blog Post");
                    self.createUserActivity(req, 'CREATE_BLOGPOST', null, null, function(){});
                    self = null;
                });
            }
        });


    },

    /**
     * The method may be called by unauthenticated user.  No security is needed. It will only return 'PUBLISHED' posts.
     * @param req
     * @param res
     */
    getBlogPost: function(req, res) {

        var self = this;
        self.log.debug('>> getBlogPost');
        var accountId = parseInt(self.currentAccountId(req));
        var blogPostId = req.params.postId;
        self.log.debug('Account ID: ' + accountId + ' Blog Post ID: ' + blogPostId);

        /*
         * If the request is from a logged in user, return posts in PRIVATE status as well as PUB
         */
        var statusAry = [$$.m.BlogPost.status.PUBLISHED];
        if(self.userId(req) !== null) {
            statusAry.push($$.m.BlogPost.status.PRIVATE);
        }

        cmsManager.getBlogPost(accountId, blogPostId, statusAry, function (err, value) {
            self.log.debug('<< getBlogPost');
            self.sendResultOrError(res, err, value, "Error getting Blog Post");
            self = null;
        });
    },

    /**
     * The method may be called by unauthenticated user.  No security is needed. It will only return 'PUBLISHED' posts.
     * @param req
     * @param res
     */
    getBlogPostByTitle: function(req, resp) {
        var self = this;
        self.log.debug('>> getBlogPostByTitle');
        var accountId = parseInt(self.currentAccountId(req));
        var blogPostTitle = req.params.title;

        /*
         * If the request is from a logged in user, return posts in PRIVATE status as well as PUB
         */
        var statusAry = [$$.m.BlogPost.status.PUBLISHED];
        if(self.userId(req) !== null) {
            statusAry.push($$.m.BlogPost.status.PRIVATE);
        }


        cmsManager.getBlogPostByUrl(accountId, blogPostTitle, statusAry, function(err, value){
            self.log.debug('<< getBlogPostByTitle');
            self.sendResultOrError(resp, err, value, "Error getting Blog Post");
            self = null;
        });
    },


    getBlogPostByUrl: function(req, resp) {
        var self = this;
        self.log.debug('>> getBlogPostByUrl');
        var accountId = parseInt(self.currentAccountId(req));
        var blogPostUrl = req.params.handle;

        var statusAry = [$$.m.BlogPost.status.PUBLISHED];        
            statusAry.push($$.m.BlogPost.status.PRIVATE);            
            statusAry.push($$.m.BlogPost.status.DRAFT);
            statusAry.push($$.m.BlogPost.status.FUTURE);  

        cmsManager.getBlogPostByUrl(accountId, blogPostUrl, statusAry, function(err, value){
            self.log.debug('<< getBlogPostByUrl');
            self.sendResultOrError(resp, err, value, "Error getting Blog Post");
            self = null;
        });
    },

    updateBlogPost: function(req, res) {

        var self = this;
        self.log.debug('>> updateBlogPost');
        var blogPost = new $$.m.BlogPost(req.body);
        var postId = req.params.postId;
        var pageId = req.params.id;
        var accountId = parseInt(self.accountId(req));

        blogPost.set('accountId', accountId);
        blogPost.set('_id', postId);
        blogPost.set('pageId', pageId);

        console.dir(req.body);

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                blogPost.set('accountId', accountId);
                blogPost.set('_id', postId);
                blogPost.set('pageId', pageId);
                blogPost.attributes.modified.date = new Date();
                console.dir(req.body);

                cmsManager.updateBlogPost(accountId, blogPost, function (err, value) {
                    self.log.debug('<< updateBlogPost');
                    self.sendResultOrError(res, err, value, "Error updating Blog Post");
                    var pageUrl = self._buildPageUrl(req, 'blog/' + value.get('post_url'));
                    self._updatePageCache(pageUrl);
                    self.createUserActivity(req, 'UPDATE_BLOGPOST', null, null, function(){});
                    self = null;
                });
            }
        });

    },

    publishPost: function(req, res) {
        var self = this;
        self.log.debug('>> publishPost');
        var accountId = parseInt(self.accountId(req));
        var postId = req.params.postId;
        var pageId = req.params.id;
        var userId = self.userId(req);

        self.checkPermission(req, self.sc.privs.MODIFY_WEBSITE, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
               cmsManager.publishPost(accountId, postId, pageId, userId, function (err, value) {
                    self.log.debug('<< publishPost');
                    self.sendResultOrError(res, err, value, "Error updating Blog Post Status");
                    self.createUserActivity(req, $$.m.BlogPost.status.PUBLISHED, null, {id: value.id()}, function(){});
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
                var pageId = req.params.id;
                self.log.debug('deleting post with id: ' + blogPostId);

                cmsManager.deleteBlogPost(accountId, pageId, blogPostId, function (err, value) {
                    self.log.debug('<< deleteBlogPost');
                    self.sendResultOrError(res, err, {deleted:true}, "Error deleting Blog Post");
                    self.createUserActivity(req, 'DELETE_BLOGPOST', null, null, function(){});
                    self = null;
                });
            }
        });

    },

    bulkDeleteBlogPost: function(req, res) {
        var self = this;
        self.log.debug('>> deleteBlogPost');
        var accountId = parseInt(self.accountId(req));

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                var blogPostIds = req.body.id;
                var pageId = req.params.id;                
                cmsManager.bulkDeleteBlogPost(accountId, pageId, blogPostIds, function (err, value) {
                    self.log.debug('<< bulkDeleteBlogPost');
                    self.sendResultOrError(res, err, {deleted:true}, "Error deleting Blog Post(s)");
                    self.createUserActivity(req, 'DELETE_BLOGPOST', null, null, function(){});
                    self = null;
                });
            }
        });

    },

    /**
     * This method may be called by unauthenticated users.  No security is needed.  It will only return 'PUBLISHED' posts.
     * @param req
     * @param res
     */
    listBlogPosts: function (req, res) {
        var self = this;
        self.log.debug('>> listBlogPosts');
        var accountId = parseInt(self.currentAccountId(req));
        var limit = parseInt(req.query['limit'] || 0);//suitable default?
        var skip = parseInt(req.query['skip'] || 0);//TODO: use skip for paging

        /*
         * If the request is from a logged in user, return posts in PRIVATE status as well as PUB
         */
        var statusAry = [$$.m.BlogPost.status.PUBLISHED];
        if(self.userId(req) !== null) {
            statusAry.push($$.m.BlogPost.status.PRIVATE);
            //For now, we will add future and draft.  Once the frontend is decoupled from backend, this needs to be removed.
            // statusAry.push($$.m.BlogPost.status.DRAFT);
            // statusAry.push($$.m.BlogPost.status.FUTURE);
        }

        if(req.query['limit']) {
                cmsManager.listBlogPostsWithLimit(accountId, limit, skip, statusAry, function (err, value) {
                    self.log.debug('<< listBlogPostsWithLimit '+ value);
                    self.sendResultOrError(res, err, value, "Error listing Blog Posts");
                    self = null;
                });
        } else{
            cmsManager.listBlogPosts(accountId, limit, statusAry, function (err, value) {
                self.log.debug('<< listBlogPosts '+ value);
                self.sendResultOrError(res, err, value, "Error listing Blog Posts");
                self = null;
            });
        }

    },

    /**
     * This method is called by the admin for authenticated users.
     * @param req
     * @param res
     */
    listAllBlogPosts: function(req, res) {
        var self = this;
        self.log.debug('>> listAllBlogPosts');
        var accountId = parseInt(self.accountId(req));
        var limit = parseInt(req.query['limit'] || 0);
        var skip = parseInt(req.query['skip'] || 0);
        var statusAry = $$.m.BlogPost.allStatus;

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                cmsManager.listBlogPostsWithLimit(accountId, limit, skip, statusAry, function (err, value) {
                    self.log.debug('<< listAllBlogPosts');
                    self.sendResultOrError(res, err, value, "Error listing All Blog Posts");
                    self = null;
                });
            }
        });
    },

    /**
     * This method is called by the admin for authenticated users.
     * @param req
     * @param res
     */
    getEditableBlogPost: function(req, res) {

        var self = this;
        self.log.debug('>> getEditableBlogPost');
        var accountId = parseInt(self.accountId(req));
        var blogPostId = req.params.postId;
        var statusAry = $$.m.BlogPost.allStatus;

        self.checkPermissionForAccount(req, self.sc.privs.VIEW_WEBSITE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                cmsManager.getBlogPost(accountId, blogPostId, statusAry, function (err, value) {
                    self.log.debug('<< getEditableBlogPost');
                    self.sendResultOrError(res, err, value, "Error getting Blog Post");
                    self = null;
                });
            }
        });

    },

    /**
     * This method may be called by unauthenticated users.  No security is needed. It will only return 'PUBLISHED posts.
     * @param req
     * @param res
     */
    listBlogPostsByPageId: function (req, res) {
        var self = this;
        self.log.debug('>> listBlogPostsByPageId');
        var pageId = req.params.id;
        var limit = parseInt(req.query['limit'] || 0); //suitable default?
        var skip = parseInt(req.query['skip'] || 0);   //TODO: use skip for paging

        /*
         * If the request is from a logged in user, return posts in PRIVATE status as well as PUB
         */
        var statusAry = [$$.m.BlogPost.status.PUBLISHED];
        if(self.userId(req) !== null) {
            statusAry.push($$.m.BlogPost.status.PRIVATE);
        }

        cmsManager.listBlogPostsByPageId(pageId, limit, statusAry, function (err, value) {
            self.log.debug('<< listBlogPostsByPageId ' + value);
            self.sendResultOrError(res, err, value, "Error listing Blog Posts");
            self = null;
        });
    },

    /**
     * This method may be called by unauthenticated users.  No security is needed.  It will only return PUBLISHED posts.
     * @param req
     * @param res
     */
    getPostsByAuthor: function(req, res){

        var self = this;
        self.log.debug('>> getPostsByAuthor');
        var accountId = parseInt(self.currentAccountId(req));
        var author = req.params.author;

        /*
         * If the request is from a logged in user, return posts in PRIVATE status as well as PUB
         */
        var statusAry = [$$.m.BlogPost.status.PUBLISHED];
        if(self.userId(req) !== null) {
            statusAry.push($$.m.BlogPost.status.PRIVATE);
        }

        cmsManager.getPostsByAuthor(accountId, author, statusAry, function (err, value) {
            self.log.debug('<< getPostsByAuthor');
            self.sendResultOrError(res, err, value, "Error getting Blog Posts by author");
            self = null;
        });

    },

    /**
     * This method may be called by unauthenticated users.  No security is needed.  It will only return PUBLISHED posts.
     * @param req
     * @param res
     */
    getPostsByTitle: function(req, res) {

        var self = this;
        self.log.debug('>> getPostsByTitle');
        var accountId = parseInt(self.currentAccountId(req));
        var title = req.params.title;

        /*
         * If the request is from a logged in user, return posts in PRIVATE status as well as PUB
         */
        var statusAry = [$$.m.BlogPost.status.PUBLISHED];
        if(self.userId(req) !== null) {
            statusAry.push($$.m.BlogPost.status.PRIVATE);
        }


        cmsManager.getPostsByTitle(accountId, title, statusAry, function (err, value) {
            self.log.debug('<< getPostsByTitle');
            self.sendResultOrError(res, err, value, "Error getting Blog Posts by title");
            self = null;
        });
    },

    /**
     * This method may be called by unauthenticated users.  No security is needed.  It will only return PUBLISHED posts.
     * @param req
     * @param res
     */
    getPostsByContent: function(req, res) {

        var self = this;
        self.log.debug('>> getPostsByContent');
        var accountId = parseInt(self.currentAccountId(req));
        var content = req.params.content;

        /*
         * If the request is from a logged in user, return posts in PRIVATE status as well as PUB
         */
        var statusAry = [$$.m.BlogPost.status.PUBLISHED];
        if(self.userId(req) !== null) {
            statusAry.push($$.m.BlogPost.status.PRIVATE);
        }

        cmsManager.getPostsByData(accountId, content, statusAry, function (err, value) {
            self.log.debug('<< getPostsByContent');
            self.sendResultOrError(res, err, value, "Error getting Blog Posts by content");
            self = null;
        });
    },

    /**
     * This method may be called by unauthenticated users.  No security is needed.  It will only return PUBLISHED posts.
     * @param req
     * @param res
     */
    getPostsByCategory: function(req, res) {

        var self = this;
        self.log.debug('>> getPostsByCategory');
        var accountId = parseInt(self.currentAccountId(req));
        var category = req.params.category;
        /*
         * If the request is from a logged in user, return posts in PRIVATE status as well as PUB
         */
        var statusAry = [$$.m.BlogPost.status.PUBLISHED];
        if(self.userId(req) !== null) {
            statusAry.push($$.m.BlogPost.status.PRIVATE);
        }


        cmsManager.getPostsByCategory(accountId, category, statusAry, function (err, value) {
            self.log.debug('<< getPostsByCategory');
            self.sendResultOrError(res, err, value, "Error getting Blog Posts by category");
            self = null;
        });
    },

    /**
     * This method may be called by unauthenticated users.  No security is needed.  It will only return PUBLISHED posts.
     * @param req
     * @param res
     */
    getPostsByTag: function(req, res) {

        var self = this;
        self.log.debug('>> getPostsByTag');
        var accountId = parseInt(self.currentAccountId(req));
        var tag = req.params.tag;
        /*
         * If the request is from a logged in user, return posts in PRIVATE status as well as PUB
         */
        var statusAry = [$$.m.BlogPost.status.PUBLISHED];
        if(self.userId(req) !== null) {
            statusAry.push($$.m.BlogPost.status.PRIVATE);
        }

        cmsManager.getPostsByTag(accountId, [tag], statusAry, function (err, value) {
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
                return self.send403(res);
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
                return self.send403(res);
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

    },

    /**
     *
     * @param req
     * @param res
     */
    generateScreenshot: function(req, res) {
        var self = this;
        self.log.debug('>> generateScreenshot');
        var accountId = parseInt(self.accountId(req));
        var pageHandle = req.params.handle;

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                cmsManager.generateScreenshot(accountId, pageHandle, function(err, url){
                    self.log.debug('<< generateScreenshot');
                    self.sendResultOrError(res, err, url, "Error generating screenshot.");
                    self = null;
                });
            }
        });
    },

    getScreenshot: function(req, res) {
        var self = this;
        self.log.debug('>> getScreenshot');
        var accountId = parseInt(self.accountId(req));
        var pageHandle = req.params.handle;

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_WEBSITE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {

                cmsManager.getSavedScreenshot(accountId, pageHandle, function(err, url){
                    self.log.debug('<< getScreenshot');
                    self.sendResultOrError(res, err, url, "Error getting screenshot.");
                    self = null;
                });
            }
        });
    },

    /**
     *
     * @param req
     * @param resp
     * @param req.params.id -- websiteId (optional)
     * @param req.params.handle -- page handle
     */
    getSecurePage: function(req, resp) {
        var self = this;
        self.log.debug('>> getSecurePage');
        var accountId = parseInt(self.accountId(req));
        var pageHandle = req.params.handle;
        var websiteId = req.params.id;

        cmsManager.getSecurePage(accountId, pageHandle, websiteId, function(err, page){
            self.log.debug('<< getSecurePage');
            self.sendResultOrError(resp, err, page, 'Error getting secure page');
            self = null;
        });
    },

    getBlogAuthors: function(req, resp) {
        var self = this;
        self.log.debug('>> getBlogAuthors');
        var accountId = parseInt(self.currentAccountId(req));

        cmsManager.getDistinctBlogPostAuthors(accountId, function(err, value){
            self.log.debug('<< getBlogAuthors');
            self.sendResultOrError(resp, err, value, 'Error getting blog authors');
            self = null;
        });
    },

    getBlogTags: function(req, resp) {
        var self = this;
        self.log.debug('>> getBlogTags');
        var accountId = parseInt(self.currentAccountId(req));

        cmsManager.getDistinctBlogPostTags(accountId, function(err, value){
            self.log.debug('<< getBlogTags');
            self.sendResultOrError(resp, err, value, 'Error getting blog tags');
            self = null;
        });
    },

    getBlogCategories: function(req, resp) {
        var self = this;
        self.log.debug('>> getBlogCategories');
        var accountId = parseInt(self.currentAccountId(req));

        cmsManager.getDistinctBlogPostCategories(accountId, function(err, value){
            self.log.debug('<< getBlogCategories');
            self.sendResultOrError(resp, err, value, 'Error getting blog categories');
            self = null;
        });
    },

    getBlogTitles: function(req, resp) {
        var self = this;
        self.log.debug('>> getBlogTitles');
        var accountId = parseInt(self.currentAccountId(req));

        cmsManager.getDistinctBlogPostTitles(accountId, function(err, value){
            self.log.debug('<< getBlogTitles');
            self.sendResultOrError(resp, err, value, 'Error getting blog titles');
            self = null;
        });
    },

    _buildPageUrl: function(req, handle) {
        var host = req.host;
        //replace main with www on for main site
        if(host.indexOf('main.') != -1) {
            host = host.replace('main.', 'www.');
        }

        return host + '/page/' + handle;
    },

    _updatePageCache: function(url) {
        var self = this;
        self.log.debug('>> _updatePageCache(' + url + ')');
        var params = {
            prerenderToken: preRenderConfig.PRERENDER_TOKEN,
            url:url
        };

        var options = {
            json: true,
            body: params
        };

        request.post(preRenderConfig.RECACHE_URL, options, function(err, resp, body){

            if(err) {
                self.log.error('Error sending recache request: ', err);
                return fn(err, null);
            } else {
                self.log.debug('<< _updatePageCache', body);
                return;
            }
        });
    }

});

module.exports = new api();

