require('./dao/cms.dao.js');

var blogPostDao = require('./dao/blogpost.dao.js');
var cmsDao = require('./dao/cms.dao.js');
var accountDao = require('../dao/account.dao.js');
var themeDao = require('./dao/theme.dao.js');
var templateDao = require('./dao/template.dao.js');
var topicDao = require('./dao/topic.dao.js');
var emailDao = require('./dao/email.dao.js');
var urlboxhelper = require('../utils/urlboxhelper');
var s3dao = require('../dao/integrations/s3.dao');
var fs = require('fs');
var request = require('request');
var tmp = require('temporary');
var awsConfig = require('../configs/aws.config');


var log = $$.g.getLogger("cms_manager");
var Blog = require('./model/components/blog');

module.exports = {

    /*
     * Theme
     */

    getThemeById: function(themeId, fn) {
        log.debug('>> getThemeById');
        themeDao.getById(themeId, $$.m.cms.Theme, function(err, value){
            if(err) {
                log.error('Exception thrown getting config: ' + err);
                fn(err, null);
            } else {
                log.debug('<< getThemeById');
                fn(null, value);
            }
        });
    },

    getThemeByName: function(name, fn) {
        log.debug('>> getThemeByName');
        themeDao.findOne({'name': name}, $$.m.cms.Theme, function(err, value){
            if(err) {
                log.error('Exception thrown getting theme: ' + err);
                fn(err, null);
            } else {
                log.debug('<< getThemeByName');
                fn(null, value);
            }
        });
    },

    getAllTemplates: function(accountId, fn) {
        log.debug('>> getAllTemplates');
        templateDao.findMany({$or : [{'accountId': accountId}, {'isPublic': true}, {'isPublic': 'true'}], 'ssb':{$ne:true}}, $$.m.cms.Template, function(err, list){
            if(err) {
                log.error('Exception thrown listing templates: ' + err);
                fn(err, null);
            } else {
                log.debug('<< getAllTemplates');
                fn(null, list);
            }
        });
    },

    createTheme: function(theme, fn) {
        log.debug('>> createTheme');
        //validate
        var nameCheckQuery = {'name': theme.get('name')};
        themeDao.exists(nameCheckQuery, $$.m.cms.Theme, function(err, value){
            if(err) {
                log.error('Exception thrown checking for uniqueness: ' + err);
                fn(err, null);
            } else if(value === true) {
                log.warn('Attempted to create a theme with a name that already exists.');
                fn('Name already exists', null);
            } else {
                themeDao.saveOrUpdate(theme, function(err, savedTheme){
                    log.debug('<< createTheme');
                    fn(null, savedTheme);
                });
            }
        });
    },

    updateTemplate: function(template, fn) {
        log.debug('>> updateTemplate ', template);
        templateDao.saveOrUpdate(template, function(err, value){
            if(err) {
                log.error('Exception thrown updating template: ' + err);
                fn(err, null);
            } else {
                log.debug('<< updateTemplate');
                fn(null, value);
            }
        });
    },

    deleteTheme: function(themeId, fn) {
        log.debug('>> deleteTheme');
        themeDao.removeById(themeId, $$.m.cms.Theme, function(err, value){
            if(err) {
                log.error('Exception thrown while deleting theme: ' + err);
            } else {
                log.debug('<< deleteTheme');
                fn(null, value);
            }
        });
    },

    createThemeFromWebsite: function(themeObj, websiteId, pageHandle, fn) {
        log.debug('>> createThemeFromWebsite');
        if(fn===null) {
            fn = pageHandle;
            pageHandle = null;
        }
        //use the index page if no handle is specified
        if(pageHandle === null) {
            pageHandle = 'index';
        }

        var p1 = $.Deferred(), p2 = $.Deferred();
        var website = null, componentAry = null;

        cmsDao.getWebsiteById(websiteId, function(err, _website){
            if(err) {
                log.error('Error getting website: ' + err);
                p1.reject();
            } else {
                website = _website;
                p1.resolve();
            }
        });

        cmsDao.getPageForWebsite(websiteId, pageHandle, function(err, page){
            if(err) {
                log.error('Error getting page[' + pageHandle + '] for websiteId[' + websiteId + ']: ' + err);
                fn(err, null);
            } else {
                log.debug('Got page.  Getting components.');
                cmsDao.getComponentsByPage(page.id(), function(err, _componentAry){
                    if(err) {
                        log.error('Error getting components for page: ' + err);
                        p2.reject();
                    } else {
                        log.debug('Got components.');
                        componentAry = _componentAry;
                        p2.resolve();
                    }
                });
            }
        });

        $.when(p1,p2).done(function(){
            log.debug('updating themeObj with settings and components');
            var config = {'settings': website.get('settings'), 'components': componentAry};
            themeObj.set('config', config);

            cmsDao.saveOrUpdate(themeObj, function(err, newTheme){
                if(err) {
                    log.error('Error saving theme: ' + err);
                    fn(err, null);
                } else {
                    log.debug('<< createThemeFromWebsite');
                    fn(null, newTheme);
                }
            });
        });

    },


    getThemePreview: function(themeId, fn) {
        cmsDao.getThemePreview(themeId, fn);
    },

    setThemeForAccount: function(accountId, themeId, fn) {
        log.debug('>> setThemeForAccount');
        //validateThemeId
        var p1 = $.Deferred();

        themeDao.getById(themeId, function(err, value){
            if(err) {
                p1.reject();
                fn(err, null);
            } else if(value === false) {
                p1.reject();
                fn('Theme with id [' + themeId + '] does not exist.');
            } else {
                p1.resolve();
            }
        });


        $.when(p1).done(function(){
            accountDao.getById(accountId, $$.m.Account, function(err, account){
                if(err) {
                    log.error('Error getting account by ID: ' + err);
                    return fn(err, null);
                }
                var website = account.get('website');
                website.themeId = themeId;
                accountDao.saveOrUpdate(account, function(err, value){
                    if(err) {
                        log.error('Error updating Account: ' + err);
                        return fn(err, null);
                    } else {
                        log.debug('<< setThemeForAccount');
                        fn(null, 'SUCCESS');
                    }

                });
            });
        });

    },

    createWebsiteAndPageFromTemplate: function(accountId, templateId, userId, websiteId, pageTitle, pageHandle, mainMenu, fn) {
        var self = this;
        log.debug('>> createWebsiteFromTheme');
        if(fn === null) {
            fn = pageHandle;
            pageHandle = null;
        }
        //default to index page if none is specified
        var title = pageTitle;
        var mainmenu = mainMenu;
        // if(pageHandle === null) {
        //     pageHandle = 'index';
        //     title = 'Home';
        // } else {
        //     title = pageHandle.charAt(0).toUpperCase() + pageHandle.substring(1);
        // }

        var template, website, page, account;

        var p0 = $.Deferred();

        cmsDao.getPageByHandle(accountId, websiteId, pageHandle, function(err, value){
            if (err) {
                log.error('Exception getting page: ' + err);
                p0.reject();
                return fn(err, null);
            } else if(value) {
                log.warn('Attempted to create an page with a handle that already exists.');
                p0.reject();
                fn('Page already exists', null);
            }
            else
            {
                log.debug('Good handle to create page.');
                p0.resolve();
            }
        });

        var p1 = $.Deferred();
        $.when(p0).done(function(){
            templateDao.getById(templateId, $$.m.cms.Template, function(err, _template) {
                if (err) {
                    log.error('Exception getting template: ' + err);
                    p1.reject();
                } else {
                    log.debug('Got Template.');
                    template = _template;

                    if(websiteId === null) {
                        log.debug('creating template');
                        //create it
                        var settings = template.get('config')['settings'];
                        website = new $$.m.cms.Website({
                            'accountId': accountId,
                            'settings': settings,
                            'created': {
                                'by': userId,
                                'date': new Date()
                            }
                        });
                        cmsDao.saveOrUpdate(website, function(err, savedWebsite) {
                            if (err) {
                                log.error('Exception saving new website: ' + err);
                                p1.reject();
                            } else {
                                log.debug('Created website.');
                                websiteId = savedWebsite.id();
                                website = savedWebsite;
                                p1.resolve();
                            }
                        });
                    } else {
                        //don't need to do anything.
                        log.debug('Skip website creation.');
                        p1.resolve();
                    }
                }
            });
        });
        var p2 = $.Deferred();
        $.when(p1).done(function(){

            accountDao.getById(accountId, $$.m.Account, function(err, _account){
                if(err) {
                    log.error('Error getting account by ID: ' + err);
                    p2.reject();
                    return fn(err, null);
                }
                account = _account;
                p2.resolve();
            });

        });


        $.when(p2).done(function(){
            //at this point we have the theme and website.
            log.debug('mainmenu ' + mainmenu);
            log.debug('Creating Page');
            var componentAry = template.get('config')['components'];
            var logo = account.get('business')['logo'];
            if (logo) {
                _.each(componentAry, function(component) {
                    if (component.type === 'navigation') {
                        component.logo = '<img src="'+logo+'"/>';
                    }
                });
            }

            var screenshot = template.get('previewUrl');
            page = new $$.m.cms.Page({
                'accountId': accountId,
                'handle': pageHandle,
                'screenshot': screenshot,
                'mainmenu': mainmenu,
                'title': title,
                'websiteId': websiteId,
                'components': componentAry,
                'templateId': templateId,
                'created': {
                    'by': userId,
                    'date': new Date()
                },
                'modified': {
                    'by': userId,
                    'date': new Date()
                },
                'latest': true
            });



            cmsDao.saveOrUpdate(page, function(err, savedPage){
                if(err) {
                    log.error('Exception saving new page: ' + err);
                    fn(err, null);
                } else {
                    log.debug('<< createWebsiteFromTheme');
                    if (savedPage.get('mainmenu') == true) {
                    self.getWebsiteLinklistsByHandle(savedPage.get('websiteId'),"head-menu",function(err,list){
                        if(err) {
                            self.log.error('Error getting website linklists by handle: ' + err);
                            fn(err, savedPage);
                        } else {
                            var link={
                                label:savedPage.get('title'),
                                type:"link",
                                linkTo:{
                                    type:"page",
                                    data:savedPage.get('handle')
                                }
                            };
                            list.links.push(link);
                            self.updateWebsiteLinklists(savedPage.get('websiteId'),"head-menu",list,function(err, linkLists){
                                if(err) {
                                    self.log.error('Error updating website linklists by handle: ' + err);
                                    fn(err, savedPage);
                                } else {
                                    self.log.debug('<< createPage');
                                    fn(null, {'website': website, 'page': savedPage});
                                }
                            });
                        }

                    });
                }
                else
                    fn(null, {'website': website, 'page': savedPage});
                }
            });

        });

    },

    createDefaultPageForAccount: function(accountId, websiteId, fn) {
        var self = this;
        cmsDao.createDefaultPageForAccount(accountId, websiteId, function(err, pageAry){
            if(err) {
                log.error('Error creating default page: ' + err);
                return fn(err, null);
            }
            fn(null, pageAry[0]);
            log.debug('creating screenshots for default pages');
            _.each(pageAry, function(page){
                if(page.get('handle') && page.get('type') != 'notification') {
                    self.updatePageScreenshot(page.id(), function(err, value){
                        if(err) {
                            log.error('Error updating screenshot: ' + err);
                        } else {
                            log.debug('updated screenshot: ' + value);
                        }
                    });
                }

            });

            //return fn(null, pageAry[0]);
        });
    },

    createWebsiteForAccount: function(accountId, userId, fn) {
        var self = this;
        cmsDao.createWebsiteForAccount(accountId, userId, fn);
    },

    _createBlogPost: function(accountId, blogPost, fn) {
        blogPostDao.saveOrUpdate(blogPost, fn);
    },

    createBlogPost: function(accountId, blogPost, fn) {
        var self = this;
        self.log = log;
        self.log.debug('>> createBlogPost');
        if (blogPost.featured_image) {
          blogPost.featured_image = blogPost.featured_image.substr(5, blogPost.featured_image.length);
        }
        blogPostDao.createPost(blogPost, function(err, savedPost){
            if(err) {
                self.log.error('Error creating post: ' + err);
                return fn(err, null);
            } else {
                //store the id in the page component's array
                cmsDao.getPageById(savedPost.get('pageId'), function(err, page){
                    if(err) {
                        self.log.error('Error getting page for post: ' + err);
                        return fn(err, null);
                    } else if(!page){
                        self.log.debug('Referenced page does not exist.  Creating default blog page.');
                        self._createBlogPage(accountId, savedPost.get('websiteId'), function(err, blogPage){
                            if(err) {
                                self.log.error('Error creating blog page: ' + err);
                                return fn(err, null);
                            }
                            var postAry = self._addPostIdToBlogComponentPage(savedPost.id(), blogPage);

                            if(postAry === null) {
                                //return fn('Page does not contain blog component.', null);
                                //need to create a blog component.
                                var blogComponent = new $$.m.cms.modules.Blog({
                                    posts: [savedPost.id()]
                                });
                                blogPage.get('components').push(blogComponent);
                                //asynchrounously create single-post-page if it doesn't exist.

                            }
                            self._getOrCreateSinglePostPage(accountId, blogPost.get('websiteId'), function(err, value){
                                if(err) {
                                    self.log.error('Error creating single-post-page: ' + err);
                                    return;
                                }
                            });
                            cmsDao.saveOrUpdate(blogPage, function(err, page){
                                if(err) {
                                    self.log.error('Error updating page for post: ' + err);
                                    return fn(err, null);
                                } else {
                                    self.log.debug('<< createBlogPost');
                                    return fn(null, savedPost);
                                }
                            });

                        });

                    } else {

                        var postAry = self._addPostIdToBlogComponentPage(savedPost.id(), page);
                        if(postAry === null) {
                            //return fn('Page does not contain blog component.', null);
                            //need to create a blog component.
                            var blogComponent = new $$.m.cms.modules.Blog({
                                posts: [savedPost.id()]
                            });
                            page.get('components').push(blogComponent);
                            //asynchrounously create single-post-page if it doesn't exist.

                        }
                        self._getOrCreateSinglePostPage(accountId, blogPost.get('websiteId'), function(err, value){
                            if(err) {
                                self.log.error('Error creating single-post-page: ' + err);
                                return;
                            }
                        });
                        cmsDao.saveOrUpdate(page, function(err, page){
                            if(err) {
                                self.log.error('Error updating page for post: ' + err);
                                return fn(err, null);
                            } else {
                                self.log.debug('<< createBlogPost');
                                return fn(null, savedPost);
                            }
                        });
                    }
                });
            }
        });
    },

    _createBlogPage: function(accountId, websiteId, fn) {
        var blogPage = {
            "_id" : null,
            "accountId" : accountId,
            "websiteId" : websiteId,
            "handle" : "blog",
            "title" : "Blog",
            "seo" : null,
            "visibility" : {
                "visible" : true,
                "asOf" : null,
                "displayOn" : null
            },
            "components" : [
                {
                    "_id" : "76aae765-bda7-4298-b78c-f1db159eb9f4",
                    "anchor" : null,
                    "type" : "navigation",
                    "version" : 1,
                    "visibility" : true,
                    "title" : "Title",
                    "subtitle" : "Subtitle.",
                    "txtcolor" : "#888",
                    "bg" : {
                        "img" : {
                            "url" : "",
                            "width" : 1235,
                            "height" : 935,
                            "parallax" : true,
                            "blur" : false
                        },
                        "color" : ""
                    },
                    "btn" : {
                        "text" : "",
                        "url" : "",
                        "icon" : ""
                    }
                },
                {
                    "_id" : "b56556a7-b145-4c4d-9e82-6cbe7dc967c0",
                    "anchor" : null,
                    "type" : "blog",
                    "version" : 1,
                    "visibility" : true,
                    "txtcolor" : "#444",
                    "posts" : [
                        {
                            "title" : "Hello World",
                            "content" : "this is the content",
                            "created" : {
                                "date" : new Date(),
                                "by" : null
                            },
                            "modified" : {
                                "date" : "",
                                "by" : null
                            }
                        },
                        {
                            "title" : "Hello World 2",
                            "content" : "this is the content",
                            "created" : {
                                "date" : new Date(),
                                "by" : null
                            },
                            "modified" : {
                                "date" : "",
                                "by" : null
                            }
                        },
                        "b6df057f-2d45-402d-a010-d43bcca00f12",
                        "13260fd6-c854-4ed2-a830-bc75869b3b48"
                    ],
                    "bg" : {
                        "img" : {
                            "url" : "",
                            "width" : null,
                            "height" : null,
                            "parallax" : false,
                            "blur" : false
                        },
                        "color" : "#f6f6f6"
                    },
                    "btn" : {
                        "text" : "I'm Interested",
                        "url" : "http://google.com",
                        "icon" : "fa fa-rocket"
                    },
                    "post_title" : "<p>TEST MANIK POST_TEST</p>",
                    "post_excerpt" : "<p><br></p>"
                },

                {
                    "_id" : "g3297f91-53fc-47d6-b862-5ec161e0d250",
                    "anchor" : "g3297f91-53fc-47d6-b862-5ec161e0d250",
                    "type" : "footer",
                    "version" : 1,
                    "visibility" : true,
                    "txtcolor" : null,
                    "bg" : {
                        "img" : {
                            "url" : "",
                            "width" : null,
                            "height" : null,
                            "parallax" : false,
                            "blur" : false
                        },
                        "color" : ""
                    },
                    "title" : null
                }
            ],
            "screenshot" : null,
            "secure" : false,
            "created" : {
                "date" : new Date(),
                "by" : null
            },
            "modified" : {
                "date" : new Date(),
                "by" : null
            }
        };
        var self = this;
        cmsDao.getPageForWebsite(websiteId, 'blog', function(err, value){
        if(err) {
            self.log.error('Error getting BLOG page: ' + err);
            return fn(err, null);
        } else if(value !== null) {
            self.log.debug('<< blog page already created');
            return fn(null, value);
        } else {
            self.log.debug('<< blog page needs to be created');
            cmsDao.saveOrUpdate(new $$.m.cms.Page(blogPage), function(err, value){
                if(err) {
                    return fn(err, null);
                } else {
                    return fn(null, value);
                }
            });
            }
        });
       
    },



    _getOrCreateSinglePostPage: function(accountId, websiteId, fn) {
        var self = this;
        self.log.debug('>> _getOrCreateSinglePostPage');

        var page = {
            "accountId" : accountId,
            "websiteId" : websiteId,
            "handle" : "single-post",
            "title" : "Single Post",
            "seo" : null,
            "visibility" : {
            "visible" : true,
                "asOf" : null,
                "displayOn" : null
            },
            "components" : [
            {
                "_id" : $$.u.idutils.generateUUID(),
                "anchor" : null,
                "type" : "navigation",
                "version" : 1,
                "visibility" : true,
                "title" : "Title",
                "subtitle" : "Subtitle.",
                "txtcolor" : "#888",
                "bg" : {
                    "img" : {
                        "url" : "",
                        "width" : 1235,
                        "height" : 935,
                        "parallax" : true,
                        "blur" : false
                    },
                    "color" : ""
                },
                "btn" : {
                    "text" : "",
                    "url" : "",
                    "icon" : ""
                }
            },
            {
                "_id" : $$.u.idutils.generateUUID(),
                "anchor" : null,
                "type" : "single-post",
                "version" : 1,
                "visibility" : true,
                "title" : "Title",
                "subtitle" : "Subtitle.",
                "txtcolor" : "#888888",
                "bg" : {
                    "img" : {
                        "url" : "",
                        "width" : 1235,
                        "height" : 935,
                        "parallax" : true,
                        "blur" : false
                    },
                    "color" : ""
                },
                "btn" : {
                    "text" : "",
                    "url" : "",
                    "icon" : ""
                },
                "post_content" : ""
            },
            {
                "_id" : $$.u.idutils.generateUUID(),
                "anchor" : "g3297f91-53fc-47d6-b862-5ec161e0d250",
                "type" : "footer",
                "version" : 1,
                "visibility" : true,
                "txtcolor" : null,
                "bg" : {
                    "img" : {
                        "url" : "",
                        "width" : null,
                        "height" : null,
                        "parallax" : false,
                        "blur" : false
                    },
                    "color" : ""
                },
                "title" : null
            }
        ],
            "created" : {
            "date" : new Date(),
                "by" : null
        },
            "modified" : {
            "date" : new Date(),
                "by" : null
        },
            "screenshot" : null
        };

        cmsDao.getPageForWebsite(websiteId, 'single-post', function(err, value){
            if(err) {
                self.log.error('Error getting single-post page: ' + err);
                return fn(err, null);
            } else if(value !== null) {
                self.log.debug('<< _getOrCreateSinglePostPage (already created)');
                return fn(null, value);
            } else {
                var singlePostPage = new $$.m.cms.Page(page);
                cmsDao.saveOrUpdate(singlePostPage, function(err, savedPage){
                    if(err) {
                        self.log.error('Error saving single-post page: ' + err);
                        return fn(err, null);
                    } else {
                        self.log.debug('<< _getOrCreateSinglePostPage (new)');
                        return fn(null, savedPage);
                    }
                });

            }
        });
    },

    getBlogPost: function(accountId, postId, statusAry, fn) {

        var query = {
            _id: postId,
            accountId: accountId,
            post_status: {'$in': statusAry}
        };
        blogPostDao.findOne(query, $$.m.BlogPost, fn);
        //blogPostDao.getById(postId, fn);
    },

    getBlogPostByTitle: function(accountId, title, statusAry, fn) {

        var query = {
            accountId: accountId,
            post_title: title,
            post_status: {'$in': statusAry}
        };
        blogPostDao.findOne(query, $$.m.BlogPost, fn);
    },

    getBlogPostByUrl: function(accountId, url, statusAry,  fn) {

        var query = {
            accountId: accountId,
            post_url: url,
            post_status: {'$in': statusAry}
        };
        blogPostDao.findOne(query, $$.m.BlogPost, fn);
    },

    updateBlogPost: function(accountId, blogPost, fn) {
        var self = this;
        if (blogPost.featured_image) {
          blogPost.featured_image = blogPost.featured_image.substr(5, blogPost.featured_image.length);
        }
        console.dir('blogPost '+JSON.stringify(blogPost));
        blogPostDao.saveOrUpdate(blogPost, fn);
    },

    publishPost: function(accountId, postId, pageId, userId, fn) {
        log.debug('>> publishPost ');
        log.debug('>> PostId ', postId);
        var query = {
            _id: postId,         
            accountId: accountId
        };
        blogPostDao.findOne(query, $$.m.BlogPost, function(err, post){
            log.debug('retrieved post >>> ', post);
            if(err) {
                log.error('Error getting post: ' + err);
                return fn(err, null);
            }
            
            post.set('post_status', $$.m.BlogPost.status.PUBLISHED);
            post.set('pageId', pageId);
            var modified = {
                date: new Date(),
                by: userId
            };
            post.set('modified', modified);
            blogPostDao.saveOrUpdate(post, function(err, updatedPost){
                if(err) {
                    log.error('Error updating post: ' + err);
                    return fn(err, null);
                }
                log.debug('<< publishPost');
                return fn(null, updatedPost);
            });

        });

    },

    deleteBlogPost: function(accountId, pageId, postId, fn) {
        var self = this;
        self.log = log;
        self.log.debug('>> deleteBlogPost');
        blogPostDao.removeById(postId, $$.m.BlogPost, function(err, value){
            cmsDao.getPageById(pageId,function(err, page) {
                if(err) {
                    self.log.error('Error getting page for post: ' + err);
                    fn(err, null);
                } else if(!page){
                    var msg = 'Referenced page [' + pageId + '] does not exist:';
                    self.log.error(msg);
                    fn(msg, null);
                } else {
                    //remove postId from page
                    self._removePostIdFromBlogComponentPage(postId, page);
                    cmsDao.saveOrUpdate(page, function(err, page){
                        if(err) {
                            self.log.error('Error updating page for post: ' + err);
                            fn(err, null);
                        } else {
                            self.log.debug('<< deleteBlogPost');
                            fn(null, value);
                        }
                    });
                }
            });
        });
    },

    bulkDeleteBlogPost: function(accountId, pageId, postIds, fn) {
        var self = this;
        self.log = log;
        self.log.debug('>> bulkDeleteBlogPost');        
        var query = {
            _id: {'$in': postIds}
        };                               
        blogPostDao.removeByQuery(query, $$.m.BlogPost, function(err, value){
            cmsDao.getPageById(pageId,function(err, page) {
                if(err) {
                    self.log.error('Error getting page for post: ' + err);
                    fn(err, null);
                } else if(!page){
                    var msg = 'Referenced page [' + pageId + '] does not exist:';
                    self.log.error(msg);
                    fn(msg, null);
                } else {
                    //remove postId from page
                    _.each(postIds, function(pid){
                        self.log.debug('post with id: ' + pid);
                        self._removePostIdFromBlogComponentPage(pid, page);
                    });                    
                    cmsDao.saveOrUpdate(page, function(err, page){
                        if(err) {
                            self.log.error('Error updating page for post: ' + err);
                            fn(err, null);
                        } else {
                            self.log.debug('<< deleteBlogPost');
                            fn(null, value);
                        }
                    });
                }
            });
        });
    },

    modifyPostOrder: function(accountId, postId, pageId, newOrderNumber, fn) {
        var self = this;
        self.log = log;
        self.log.debug('>> modifyPostOrder(' + accountId, + ',' + postId + ',' + pageId + ',' + newOrderNumber + ')');
        cmsDao.getPageById(pageId,function(err, page) {
            if (err) {
                self.log.error('Error getting page for post: ' + err);
                fn(err, null);
            } else if (!page) {
                var msg = 'Referenced page [' + pageId + '] does not exist:';
                self.log.error(msg);
                fn(msg, null);
            } else {
                var postAry = self._removePostIdFromBlogComponentPage(postId, page);

                postAry.splice(newOrderNumber, 0, postId);

                cmsDao.saveOrUpdate(page, function(err, page){
                    if(err) {
                        self.log.error('Error updating page for post: ' + err);
                        fn(err, null);
                    } else {
                        self.log.debug('<< modifyPostOrder');
                        fn(null, page);
                    }
                });
            }
        });

    },

    getPostsByAuthor: function(accountId, author, statusAry, fn) {

        var query = {
            accountId: accountId,
            post_author: author,
            post_status: {'$in': statusAry}
        };
        blogPostDao.findMany(query, $$.m.BlogPost, fn);
        //blogPostDao.getPostsByAuthor(author, fn);
    },

    getPostsByTitle: function(accountId, title, statusAry, fn) {

        var query = {
            accountId: accountId,
            post_title: title,
            post_status: {'$in': statusAry}
        };

        blogPostDao.findMany(query, $$.m.BlogPost, fn);
        //blogPostDao.getPostsByTitle(title, fn);
    },

    getPostsByData: function(accountId, data, statusAry, fn) {

        var query = {
            accountId: accountId,
            post_content: new RegExp(data),
            post_status: {'$in': statusAry}
        };

        blogPostDao.findMany(query, $$.m.BlogPost, fn);
        //blogPostDao.getPostsByData(data, fn);
    },

    getPostsByCategory: function(accountId, category, statusAry, fn) {

        var query = {
            accountId: accountId,
            post_category: category,
            post_status: {'$in': statusAry}
        };

        blogPostDao.findMany(query, $$.m.BlogPost, fn);
        //blogPostDao.getPostsByCategory(category, fn);
    },

    getPostsByTag: function(accountId, tagAry, statusAry, fn) {

        var query = {
            accountId: accountId,
            post_tags: {$in: tagAry},
            post_status: {'$in': statusAry}
        };
        blogPostDao.findMany(query, $$.m.BlogPost, fn);
        //blogPostDao.getPostsByTags(tag, fn);
    },

    listBlogPosts: function(accountId, limit, statusAry, fn) {

        blogPostDao.findManyWithLimit({'accountId':accountId, post_status: {'$in': statusAry}}, limit, $$.m.BlogPost, fn);
    },
    listBlogPostsWithLimit: function(accountId, limit, skip, statusAry, fn) {

        blogPostDao.findWithFieldsLimitOrderAndTotal({'accountId':accountId, post_status: {'$in': statusAry}}, skip, limit, "modified.date", null, $$.m.BlogPost, -1, fn);
    },
    listBlogPostsByPageId: function(pageId, limit, statusAry, fn) {

        blogPostDao.findManyWithLimit({'pageId':pageId, post_status: {'$in': statusAry}}, limit, $$.m.BlogPost, fn);
    },

    listPostIdsByPage: function(accountId, pageId, statusAry, fn) {
        var self = this;
        self.log = log;
        self.log.debug('>> listPostIdsByPage');
        cmsDao.getPageById(pageId, function(err, page) {
            if (err) {
                self.log.error('Error getting page with id [' + pageId + ']: ' + err);
                fn(err, null);
            } else if (!page) {
                var msg = 'Referenced page [' + pageId + '] does not exist:';
                self.log.error(msg);
                fn(msg, null);
            } else {

                var componentAry = page.get('components') || [];

                var postsAry = [];
                for (var i = 0; i < componentAry.length; i++) {
                    if (componentAry[i]['type'] === 'blog') {
                        postsAry = componentAry[i]['posts'];
                        break;
                    }
                }
                fn(null, postsAry);
            }
        });
    },

    getPageComponents: function(pageId, fn) {
        var self = this;
        self.log = log;
        self.log.debug('>> getPageComponents');
        cmsDao.getPageById(pageId, function(err, page) {
            if (err) {
                self.log.error('Error getting page with id [' + pageId + ']: ' + err);
                fn(err, null);
            } else if (!page) {
                var msg = 'Referenced page [' + pageId + '] does not exist:';
                self.log.error(msg);
                fn(msg, null);
            } else {
                var componentAry = page.get('components') || [];
                self.log.debug('<< getPageComponents');
                fn(null, componentAry);
            }
        });
    },

    getPageComponentsByType: function(pageId, type, fn) {
        var self = this;
        self.log = log;
        self.log.debug('>> getPageComponentsByType');
        cmsDao.getPageById(pageId, function(err, page) {
            if (err) {
                self.log.error('Error getting page with id [' + pageId + ']: ' + err);
                fn(err, null);
            } else if (!page) {
                var msg = 'Referenced page [' + pageId + '] does not exist:';
                self.log.error(msg);
                fn(msg, null);
            } else {
                var targetComponents = [];
                var componentAry = page.get('components') || [];
                for(var i=0; i<componentAry.length; i++) {
                    if (componentAry[i]['type'] === type) {
                        targetComponents.push(componentAry[i]);
                    }
                }
                self.log.debug('<< getPageComponentsByType');
                fn(null, targetComponents);
            }
        });
    },

    addPageComponent: function(pageId, component, fn){
        var self = this;
        self.log = log;
        self.log.debug('>> addPageComponent');

        cmsDao.getPageById(pageId, function(err, page){
            if (err) {
                self.log.error('Error getting page with id [' + pageId + ']: ' + err);
                fn(err, null);
            } else if (!page) {
                var msg = 'Referenced page [' + pageId + '] does not exist:';
                self.log.error(msg);
                fn(msg, null);
            } else {
                self.log.debug('>> gettingPage');
                console.log(page)
                var componentAry = page.get('components') || [];
                componentAry.push(component);
                self.log.debug('<< addPageComponent');
                cmsDao.saveOrUpdate(page, fn);
            }
        });

    },

    updatePageComponent: function(pageId, component, fn) {
        var self = this;
        self.log = log;
        cmsDao.getPageById(pageId, function(err, page){
            if(err) {
                self.log.error('Error getting page with id [' + pageId + ']: ' + err);
                fn(err, null);
            } else if(!page){
                var msg = 'Referenced page [' + pageId + '] does not exist:';
                self.log.error(msg);
                fn(msg, null);
            } else {
                var componentAry = page.get('components') || [];
                if(componentAry.length ===0) {
                    componentAry.push(component);
                } else {
                    for(var i=0; i<componentAry.length; i++) {
                        if(componentAry[i]['type'] === component['type']) {
                            componentAry[i] = component;
                            break;
                        }
                    }
                }
                self.updatePage(pageId, page, fn);
            }
        });
    },

    updateAllPageComponents: function(pageId, componentAry, fn) {
        var self = this;
        self.log = log;
        cmsDao.getPageById(pageId, function(err, page){
            if(err) {
                self.log.error('Error getting page with id [' + pageId + ']: ' + err);
                fn(err, null);
            } else if(!page){
                var msg = 'Referenced page [' + pageId + '] does not exist:';
                self.log.error(msg);
                fn(msg, null);
            } else {
                page.set('components', componentAry);
                cmsDao.saveOrUpdate(page, fn);
            }
        });
    },

    deleteComponent: function(pageId, componentId, fn) {
        var self = this;
        self.log = log;
        cmsDao.getPageById(pageId, function(err, page) {
            if (err) {
                self.log.error('Error getting page with id [' + pageId + ']: ' + err);
                fn(err, null);
            } else if (!page) {
                var msg = 'Referenced page [' + pageId + '] does not exist:';
                self.log.error(msg);
                fn(msg, null);
            } else {
                var componentAry = page.get('components') || [];
                var spliceIndex = -1;
                    for(var i=0; i<componentAry.length; i++) {
                        if(componentAry[i]['_id'] === componentId) {
                            spliceIndex = i;
                            break;
                        }
                    }
                    if(spliceIndex !==-1) {
                        componentAry.splice(spliceIndex, 1);
                    cmsDao.saveOrUpdate(page, fn);
                } else {
                    var msg = 'Referenced componentId [' + componentId + '] was not found on page [' + pageId + '].';
                    self.log.error(msg);
                    fn(msg, null);
                }
            }
        });
    },

    modifyComponentOrder: function(pageId, componentId, newOrder, fn) {
        var self = this;
        self.log = log;

        cmsDao.getPageById(pageId, function(err, page) {
            if (err) {
                self.log.error('Error getting page with id [' + pageId + ']: ' + err);
                fn(err, null);
            } else if (!page) {
                var msg = 'Referenced page [' + pageId + '] does not exist:';
                self.log.error(msg);
                fn(msg, null);
            } else {
                var componentAry = page.get('components') || [];
                var component = null;
                var spliceIndex = -1;
                for(var i=0; i<componentAry.length; i++) {
                    if(componentAry[i]['_id'] === componentId) {
                        spliceIndex = i;
                        component = componentAry[i];
                        break;
                    }
                }
                if(spliceIndex === -1) {
                    fn('Referenced component [' + componentId + '] was not found on page [' + pageId + '].', null);
                } else {
                    componentAry.splice(spliceIndex, 1);
                    componentAry.splice(newOrder, 0, component);
                    cmsDao.saveOrUpdate(page, fn);
                }
            }
        });
    },

    getComponentVersions: function(type, fn) {
        var self = this;
        self.log = log;

        self.log.debug('>> getComponentVersions');
        cmsDao.getComponentVersions(type, function(err, value){
            if(err) {
                self.log.error('Exception getting component versions: ' + err);
                fn(err, null);
            } else {
                self.log.debug('<< getComponentVersions');
                fn(null, value);
            }
        });
    },

    updatePage: function(pageId, page, fn) {
        var self = this;
        self.log = log;

        self.log.debug('>> updatePage');
        //make sure the ID is set.
        page.set('_id', pageId);

        //Handle versioning.
        cmsDao.getPageById(pageId, function(err, existingPage){
            if(err) {
                self.log.error('Error retrieving existing page: ' + err);
                return fn(err, null);
            } else if(existingPage == null) {
                self.log.error('Could not find page with id: ' + pageId);
                return fn(null, null);
            } else {
                var currentVersion = existingPage.get('version');
                if(currentVersion === null) {
                    currentVersion = 0;
                }
                page.set('version', currentVersion+1);
                page.set('latest', true);
                existingPage.set('_id', pageId + '_' + currentVersion);
                existingPage.set('latest', false);
                cmsDao.saveOrUpdate(existingPage, function(err, value){
                    if(err) {
                        self.log.error('Error updating version on page: ' + err);
                        return fn(err, null);
                    } else {
                        cmsDao.saveOrUpdate(page, function(err, value){
                            if(err) {
                                self.log.error('Error updating page: ' + err);
                                fn(err, null);
                            } else {
                                self.log.debug('<< udpatePage');
                                fn(null, value);
                            }
                        });
                    }
                });
            }
        });



    },

    deletePage: function(pageId, fn) {
        var self = this;
        self.log = log;

        self.log.debug('>> deletePage');

        cmsDao.getPageById(pageId, function(err, page) {

            if (page && page.get('mainmenu') == true) {
                self.getWebsiteLinklistsByHandle(page.get('websiteId'), "head-menu", function(err, list) {
                    if (err) {
                        self.log.error('Error getting website linklists by handle: ' + err);
                        fn(err, value);
                    } else {
                        var link = {
                            label : page.get('title'),
                            type : "link",
                            linkTo : {
                                type : "page",
                                data : page.get('handle')
                            }
                        };
                        list.links.pop(link);
                        self.updateWebsiteLinklists(page.get('websiteId'), "head-menu", list, function(err, linkLists) {
                            if (err) {
                                self.log.error('Error updating website linklists by handle: ' + err);
                                fn(err, page);
                            } else {
                                var query = {};
                                query._id = new RegExp('' + pageId + '(_.*)*');
                                cmsDao.removeByQuery(query, $$.m.cms.Page, function(err, value){
                                //cmsDao.removeById(pageId, $$.m.cms.Page, function(err, value) {
                                    if (err) {
                                        self.log.error('Error deleting page with id [' + pageId + ']: ' + err);
                                        fn(err, null);
                                    } else {
                                        self.log.debug('<< deletePage');
                                        fn(null, value);
                                    }
                                });
                            }
                        });
                    }
                });
            } else {
                var query = {};
                query._id = new RegExp('' + pageId + '(_.*)*');
                cmsDao.removeByQuery(query, $$.m.cms.Page, function(err, value){
                //cmsDao.removeById(pageId, $$.m.cms.Page, function(err, value) {
                    if (err) {
                        self.log.error('Error deleting page with id [' + pageId + ']: ' + err);
                        fn(err, null);
                    } else {
                        self.log.debug('<< deletePage');
                        fn(null, value);
                    }
                });
            }
        })
    },

    createPage: function(page, fn) {
        var self = this;
        self.log = log;

        page.attributes.components = [
                {
                    "_id" : $$.u.idutils.generateUUID(),
                    "anchor" : null,
                    "type" : "navigation",
                    "version" : 1,
                    "latest": true,
                    "visibility" : true,
                    "title" : "Title",
                    "subtitle" : "Subtitle.",
                    "txtcolor" : "#888",
                    "bg" : {
                        "img" : {
                            "url" : "",
                            "width" : 1235,
                            "height" : 935,
                            "parallax" : true,
                            "blur" : false
                        },
                        "color" : ""
                    },
                    "btn" : {
                        "text" : "",
                        "url" : "",
                        "icon" : ""
                    }
                },
                {
                    "_id" : $$.u.idutils.generateUUID(),
                    "anchor" : null,
                    "type" : "feature-block",
                    "version" : 1,
                    "title" : "<h1>Awesome Feature Block</h1>",
                    "subtitle" : "<h3>This is the feature block subtitle.</h3>",
                    "text" : "<h5>The Feature Block component is great for a quick testimonial or a list of<br>features for a single product. It works great with an image background and parallax.</h5>",
                    "txtcolor" : "#ffffff",
                    "bg" : {
                        "img" : {
                            "url" : "http://s3.amazonaws.com/indigenous-digital-assets/account_6/bg-grey_1421966329788.jpg",
                            "width" : 838,
                            "height" : 470,
                            "parallax" : true,
                            "blur" : false,
                            "overlay" : false,
                            "show" : false
                        },
                        "color" : ""
                    },
                    "visibility" : true
                },
                {
                    "_id" : $$.u.idutils.generateUUID(),
                    "anchor" : null,
                    "type" : "footer",
                    "version" : 1,
                    "visibility": true,
                    "title" : "Title",
                    "subtitle" : "Subtitle.",
                    "txtcolor" : "#fff",
                    "bg" : {
                        "img" : {
                            "url" : "",
                            "width" : 1235,
                            "height" : 935,
                            "parallax" : true,
                            "blur" : false
                        },
                        "color" : ""
                    },
                    "btn" : {
                        "text" : "",
                        "url" : "",
                        "icon" : ""
                    }
                }

            ];

        components : [ 
        {
            "_id" : "908a9f39-8f44-493b-a714-bb9db7e0fc4b",
            "anchor" : "908a9f39-8f44-493b-a714-bb9db7e0fc4b",
            "type" : "text-only",
            "version" : "1",
            "txtcolor" : "#000000",
            "text" : "<p style=\"text-align: center;\"><span style=\"font-size:24px;\">How do I add a new Page?</span></p>",
            "bg" : {
                "img" : {
                    "url" : "",
                    "width" : null,
                    "height" : null,
                    "parallax" : false,
                    "blur" : false,
                    "overlay" : false,
                    "show" : false
                },
                "color" : "#ffffff"
            },
            "visibility" : true,
            "spacing" : {
                "pt" : 50,
                "pb" : "0",
                "pl" : 0,
                "pr" : 0,
                "mt" : 0,
                "mb" : 0,
                "mr" : "auto",
                "ml" : "auto",
                "mw" : 1024,
                "usePage" : false
            },
            "header_title" : "Text Block"
        }, 
        {
            "_id" : "69355213-d9c4-467c-a501-f4e9910b0167",
            "anchor" : "69355213-d9c4-467c-a501-f4e9910b0167",
            "type" : "video",
            "version" : "1",
            "title" : "<h1>Video Title</h1>",
            "videoType" : "youtube",
            "video" : "",
            "videoMp4" : "",
            "videoWebm" : "",
            "videoAutoPlay" : false,
            "videoControls" : true,
            "videoBranding" : true,
            "videoWidth" : 780,
            "videoHeight" : 320,
            "videoImage" : "",
            "txtcolor" : "#000000",
            "bg" : {
                "img" : {
                    "url" : "",
                    "width" : null,
                    "height" : null,
                    "parallax" : false,
                    "blur" : false,
                    "overlay" : false,
                    "show" : false
                },
                "color" : "#ffffff"
            },
            "visibility" : true,
            "spacing" : {
                "pt" : "0",
                "pb" : 50,
                "pl" : 0,
                "pr" : 0,
                "mt" : 0,
                "mb" : 0,
                "mr" : "auto",
                "ml" : "auto",
                "mw" : 1024,
                "usePage" : false
            },
            "icon" : "fa fa-video",
            "header_title" : "Video"
        }, 
        {
            "_id" : "bce88cd4-964a-49c3-95e9-94b8f04ef732",
            "anchor" : "bce88cd4-964a-49c3-95e9-94b8f04ef732",
            "type" : "text-only",
            "version" : "1",
            "txtcolor" : "#000000",
            "text" : "<p><span style=\"font-size:24px;\">Some Text</span></p><p><span style=\"font-size:24px;\"></span>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nulla quae nesciunt, veritatis adipisci sit, consequatur accusamus in laboriosam amet repellendus ducimus mollitia ad labore quisquam voluptas porro esse. Dolore reiciendis, quos molestiae dolorum, officiis sapiente. Cumque vitae placeat aspernatur! Modi repellat, deleniti dolorum iste illum, esse excepturi magnam quibusdam, similique delectus est aliquam autem dolores possimus accusamus expedita nulla provident maxime eligendi ullam ad. Consequuntur ea officia nam quos, deserunt, nemo architecto repellat neque et ad natus! Asperiores pariatur distinctio amet repellendus aspernatur deleniti ipsa animi quis nesciunt quia quod eius, ex sapiente, neque quae quaerat labore. Debitis, quaerat, fugiat.<span style=\"font-size:18px;\"></span></p><p><span style=\"font-size: 24px;\">Some More Text</span></p><p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nulla quae nesciunt, veritatis adipisci sit, consequatur accusamus in laboriosam amet repellendus ducimus mollitia ad labore quisquam voluptas porro esse. Dolore reiciendis, quos molestiae dolorum, officiis sapiente. Cumque vitae placeat aspernatur! Modi repellat, deleniti dolorum iste illum, esse excepturi magnam quibusdam, similique delectus est aliquam autem dolores possimus accusamus expedita nulla provident maxime eligendi ullam ad. Consequuntur ea officia nam quos, deserunt, nemo architecto repellat neque et ad natus! Asperiores pariatur distinctio amet repellendus aspernatur deleniti ipsa animi quis nesciunt quia quod eius, ex sapiente, neque quae quaerat labore. Debitis, quaerat, fugiat.</p>",
            "bg" : {
                "img" : {
                    "url" : "",
                    "width" : null,
                    "height" : null,
                    "parallax" : false,
                    "blur" : false,
                    "overlay" : false,
                    "show" : false
                },
                "color" : "#ffffff"
            },
            "visibility" : true,
            "spacing" : {
                "pt" : 50,
                "pb" : 50,
                "pl" : "20",
                "pr" : "20",
                "mt" : 0,
                "mb" : 0,
                "mr" : "auto",
                "ml" : "auto",
                "mw" : 768,
                "usePage" : false
            },
            "header_title" : "Text Block"
        }
    ]


        self.log.debug('>> createPage', page);
        cmsDao.saveOrUpdate(page, function(err, value){
            if(err) {
                self.log.error('Error creating page: ' + err);
                fn(err, null);
            } else {
                //self.log.debug('<< createPage');
                self.log.debug('created page.  Updating Linklists');
                //console.dir(page);
                //console.dir(value);
                if (page.get('mainmenu') == true) {
                    self.getWebsiteLinklistsByHandle(value.get('websiteId'),"head-menu",function(err,list){
                        if(err) {
                            self.log.error('Error getting website linklists by handle: ' + err);
                            fn(err, value);
                        } else {
                            var link={
                                label:page.get('title'),
                                type:"link",
                                linkTo:{
                                    type:"page",
                                    data:page.get('handle')
                                }
                            };
                            list.links.push(link);
                            self.updateWebsiteLinklists(value.get('websiteId'),"head-menu",list,function(err, linkLists){
                                if(err) {
                                    self.log.error('Error updating website linklists by handle: ' + err);
                                    fn(err, value);
                                } else {
                                    self.log.debug('<< createPage');
                                    fn(null, value);
                                }
                            });
                        }

                    });
                } else {
                    self.log.debug('<< without mainmenu');
                    fn(null, value);
                }
            }
        });
    },
    
     createPageFromPage: function(page, fn) {
        var self = this;
        self.log = log;
        self.log.debug('>> createPageFromPage', page);
        cmsDao.saveOrUpdate(page, function(err, value){
            if(err) {
                self.log.error('Error creating page: ' + err);
                fn(err, null);
            } else {                
                self.log.debug('created page.  Updating Linklists');
                //console.dir(page);
                //console.dir(value);
                if (page.get('mainmenu') == true) {
                    self.getWebsiteLinklistsByHandle(value.get('websiteId'),"head-menu",function(err,list){
                        if(err) {
                            self.log.error('Error getting website linklists by handle: ' + err);
                            fn(err, value);
                        } else {
                            var link={
                                label:page.get('title'),
                                type:"link",
                                linkTo:{
                                    type:"page",
                                    data:page.get('handle')
                                }
                            };
                            list.links.push(link);
                            self.updateWebsiteLinklists(value.get('websiteId'),"head-menu",list,function(err, linkLists){
                                if(err) {
                                    self.log.error('Error updating website linklists by handle: ' + err);
                                    fn(err, value);
                                } else {
                                    self.log.debug('<< createPageFromPage');
                                    fn(null, value);
                                }
                            });
                        }

                    });
                } else {
                    self.log.debug('<< without mainmenu');
                    fn(null, value);
                }
            }
        });
    },


    getPageVersions: function(pageId, version, fn) {
        var self = this;
        self.log = log;
        self.log.debug('>> getPageVersions');

        var query = {};
        if(version === 'all') {
            query._id = new RegExp('' + pageId + '_.*');
        } else if(version === 'latest'){
            query._id = pageId;
        } else {
            query = {$or: [{_id: pageId + '_' + version},{_id: pageId}]};
        }

        cmsDao.findMany(query, $$.m.cms.Page, function(err, list){
            if(err) {
                self.log.error('Error getting pages by version: ' + err);
                return fn(err, null);
            } else {
                if(version !== 'all' && version !== 'latest') {
                    var filteredList = [];
                    _.each(list, function(page){
                        if(page.get('version') === version) {
                            filteredList.push(page);
                        }
                    });
                    list = filteredList;
                }



                self.log.debug('<< getPageVersions');
                return fn(null, list);
            }
        });

    },

    getPreviousVersion: function(pageId, version, fn) {
        var self = this;
        if(version >= 0) {
            self.getPageVersions(pageId, version-1, function(err, page){
                if(err) {
                    return fn(err, null);
                }
                if(page === null || page.length === 0) {
                    return self.getPreviousVersion(pageId, version-1, fn);
                } else {
                    return fn(null, page[0]);
                }
            });
        } else {
            fn(null, []);
        }
    },

    deletePageVersion: function(pageId, version, fn) {
        var self = this;
        self.log = log;
        self.log.debug('>> deletePageVersion');

        self.getPageVersions(pageId, version, function(err, page){
            if(err || page === null || page.length === 0) {
                self.log.error('Error finding page version: ' + err);
                return fn(err, null);
            } else if(page[0].get('latest') !== true || version === 0) {
                cmsDao.removeById(page[0].id(), $$.m.cms.Page, function(err, result){
                    if(err) {
                        self.log.error('Error removing page: ' + err);
                        return fn(err, null);
                    } else {
                        self.log.debug('<< deletePageVersion');
                        return fn(null, result);
                    }
                });
            } else {
                //find previous version, set it to be latest, delete this version
                self.getPreviousVersion(pageId, version, function(err, previousPage){
                    if(err) {
                        self.log.error('Error finding previous page version: ' + err);
                        return fn(err, null);
                    } else if(previousPage === null || previousPage.length===0) {
                        //we can just delete it
                        cmsDao.removeById(page[0].id(), $$.m.cms.Page, function(err, result){
                            if(err) {
                                self.log.error('Error removing page: ' + err);
                                return fn(err, null);
                            } else {
                                self.log.debug('<< deletePageVersion');
                                return fn(null, result);
                            }
                        });
                    } else {
                        self.log.debug('removing page.');
                        cmsDao.removeById(page[0].id(), $$.m.cms.Page, function(err, result){
                            if(err) {
                                self.log.error('Error removing page: ' + err);
                                return fn(err, null);
                            } else {
                                self.log.debug('promoting page with version ' + previousPage.get('version') + ' to latest.');
                                previousPage.set('_id', pageId);
                                previousPage.set('latest', true);
                                //self.log.debug('about to save ', previousPage);
                                cmsDao.saveOrUpdate(previousPage, function(err, updatedPage){
                                    if(err) {
                                        self.log.error('Error updating new latest page: ' + err);
                                        return fn(err, null);
                                    }
                                    self.log.debug('Updated page.');
                                    cmsDao.removeById(page[0].id() + '_' + updatedPage.get('version'), $$.m.cms.Page, function(err, result){
                                        self.log.debug('<< deletePageVersion');
                                        return fn(null, result);
                                    });

                                });

                            }
                        });


                    }
                });
            }

        });

    },

    revertPage: function(pageId, version, fn) {
        var self = this;
        self.log = log;
        self.log.debug('>> revertPage');

        self.getPageVersions(pageId, version, function(err, pageAry){
            if(err || pageAry === null) {
                self.log.error('Error finding version of page: ' + err);
                return fn(err, null);
            }
            self.updatePage(pageId, pageAry[0], function(err, newPage){
                if(err) {
                    self.log.error('Error updating page: ' + err);
                    return fn(err, null);
                } else {
                    self.log.debug('<< revertPage');
                    return fn(null, newPage);
                }
            });
        });

    },

    getPagesByWebsiteId: function(websiteId, accountId, fn) {
        var self = this;
        self.log = log;
        self.log.debug('>> getPagesByWebsiteId');
        var query = {
            accountId: accountId,
            websiteId: websiteId,
            type: 'page',
            $and: [
                {$or: [{secure:false},{secure:{$exists:false}}]},
                {$or: [{latest:true},{latest:{$exists:false}}]}
            ]


        };
        self.log.debug('start query');
        cmsDao.findMany(query, $$.m.cms.Page, function(err, list){
            self.log.debug('end query');
            if(err) {
                self.log.error('Error getting pages by websiteId: ' + err);
                fn(err, null);
            } else {
                var map = {};
                _.each(list, function(value){
                    if(map[value.get('handle')] === undefined) {
                        map[value.get('handle')] = value;
                    } else {
                        var currentVersion = map[value.get('handle')].get('version');
                        if(value.get('version') > currentVersion) {
                            map[value.get('handle')] = value;
                        }
                    }

                });
                fn(null, map);
            }
        });
    },

    getPagesLengthByWebsiteId: function(websiteId, accountId, fn) {
        var self = this;
        self.log = log;
        self.log.debug('>> getPagesLengthByWebsiteId');
        var query = {
            accountId: accountId,
            websiteId: websiteId,
            type: 'page',
            $and: [
                {$or: [{secure:false},{secure:{$exists:false}}]},
                {$or: [{latest:true},{latest:{$exists:false}}]}
            ]
        };
        self.log.debug('start query');
        cmsDao.findMany(query, $$.m.cms.Page, function(err, list){
            self.log.debug('end query');
            if(err) {
                self.log.error('Error getting pages by websiteId: ' + err);
                fn(err, null);
            } else {
                var count = 0;
                var map = {};
                _.each(list, function(value){
                    if(map[value.get('handle')] === undefined) {
                        map[value.get('handle')] = value;
                        count++;
                    } else {
                        var currentVersion = map[value.get('handle')].get('version');
                        if(value.get('version') > currentVersion) {
                            map[value.get('handle')] = value;
                            count++;
                        }
                    }

                });
                fn(null, count);
            }
        });
    },

    getEmailsByAccountId: function(accountId, fn) {
        var self = this;
        self.log = log;
        self.log.debug('>> getEmailsByAccountId');
        var query = {
            accountId: accountId,
            $and: [
                {$or: [{secure:false},{secure:{$exists:false}}]},
                {$or: [{latest:true},{latest:{$exists:false}}]}
            ]


        };
        self.log.debug('start query');
        emailDao.findMany(query, $$.m.cms.Email, function(err, list){
            self.log.debug('end query');
            if(err) {
                self.log.error('Error getting emails by accountId: ' + err);
                fn(err, null);
            } else {
                fn(null, list);
            }
        });
    },
    updateEmailsByAccountId: function(accountId, useremail, business_name, fn) {
        var self = this;
        self.log = log;
        self.log.debug('>> getEmailsByAccountId');
        var query = {
            accountId: accountId,
            type: 'notification'
        };
        self.log.debug('start query');
        emailDao.findMany(query, $$.m.cms.Email, function(err, list){
            self.log.debug('end query');
            if(err) {
                self.log.error('Error getting emails by accountId: ' + err);
                fn(err, null);
            } else {
                _.each(list, function(email){
                    email.set("fromName", business_name);
                    email.set("fromEmail", useremail);
                    email.set("replyTo", useremail);
                });
                self.log.debug('end query');
                emailDao.batchUpdate(list, $$.m.Email, function(err, value){
                    if(err) {
                        log.error('Error saving emails');
                    } else {
                        log.debug('finished saving emails');
                        fn(null, value);
                    }
                });
            }
        });
    },

    createEmail: function(email, fn) {
        log.debug('>> createEmail');
        //validate
        if(!email.get('title') || email.get('title').length < 1) {
            log.error('No title on email.');
            return fn('No title provided for email');
        }
        var nameCheckQuery = {'title': new RegExp('^'+email.get('title')+'$', "i"), 'accountId': email.get('accountId')};
        emailDao.exists(nameCheckQuery, $$.m.cms.Email, function(err, value){
            if(err) {
                log.error('Exception thrown checking for uniqueness: ' + err);
                fn(err, null);
            } else if(value === true) {
                log.warn('Attempted to create an email with a title that already exists.');
                fn('Title already exists', null);
            } else {
                if(!email.get('handle')){
                    var handle = email.get('title').toLowerCase().replace(/\s+/g, '-');
                    email.set('handle', handle);
                }
                emailDao.saveOrUpdate(email, function(err, savedEmail){
                    log.debug('<< createEmail');
                    fn(null, savedEmail);
                });
            }
        });
    },

    updateEmail: function(email, emailId, fn) {
        log.debug('>> updateEmail');
        log.debug('>> EmailId', emailId);
        log.debug('>> Title', email.get('title'));
        //validate
        var nameCheckQuery = {'title': email.get('title'), _id : { $ne: emailId }, 'accountId': email.get('accountId')};
        emailDao.exists(nameCheckQuery, $$.m.cms.Email, function(err, value){
            if(err) {
                log.error('Exception thrown checking for uniqueness: ' + err);
                fn(err, null);
            } else if(value === true) {
                log.warn('Attempted to update an email with a title that already exists.');
                fn('Title already exists', null);
            } else {
                emailDao.saveOrUpdate(email, function(err, savedEmail){
                    log.debug('<< updateEmail');
                    fn(null, savedEmail);
                });
            }
        });
    },

    deleteEmail: function(emailId, fn) {
        var self = this;
        log.debug('>> deleteEmail');
        emailDao.removeById(emailId, $$.m.cms.Email, function(err, value){
            if(err) {
                log.error('Error deleting email: ' + err);
                fn(err, null);
            } else {
                log.debug('<< deleteEmail');
                fn(null, value);
            }
        });
    },

    getPagesByWebsiteIdWithLimit: function(websiteId, accountId, skip, limit, fn) {
        var self = this;
        self.log = log;
        self.log.debug('>> getPagesByWebsiteIdWithLimit');
        var query = {
            accountId: accountId,
            websiteId: websiteId,
            latest: true,
            $and: [
                {$or: [{secure:false},{secure:{$exists:false}}]},
                {$or: [{latest:true},{latest:{$exists:false}}]}
            ]
        };
        var skip =  skip;
        var limit = limit;
        self.log.debug('start query');

        cmsDao.findWithFieldsLimitOrderAndTotal(query, skip, limit, "modified.date", null, $$.m.cms.Page,-1, function(err, list){
            self.log.debug('end query');
            if(err) {
                self.log.error('Error getting pages by websiteId: ' + err);
                fn(err, null);
            } else {
                fn(null, list);
            }
        });
    },

    getSecurePage: function(accountId, pageHandle, websiteId, fn) {
        var self = this;
        self.log = log;
        self.log.debug('>> getSecurePage');

        var query = {
            accountId: accountId,
            handle: pageHandle,
            secure:true
        }
        if(websiteId) {
            query.websiteId = websiteId;
        }

        cmsDao.findOne(query, $$.m.cms.Page, function(err, page){
            if(err) {
                self.log.error('Error getting secure page: ' + err);
                fn(err, null);
            } else {
                self.log.debug('<< getSecurePage');
                fn(null, page);
            }
        });
    },

    getWebsiteLinklists: function(websiteId, fn) {
        var self = this;
        self.log = log;
        self.log.debug('>> getWebsiteLinklists');

        cmsDao.getWebsiteById(websiteId, function(err, website){
            if(err) {
                self.log.error('Error getting website linklists for id [' + websiteId + ']');
                fn(err, null);
            } else {
                self.log.debug('<< getWebsiteLinklists');
                fn(null, website.get('linkLists'));
            }
        });
    },

    getWebsiteLinklistsByHandle: function(websiteId, handle, fn) {
        var self = this;
        self.log = log;
        self.log.debug('>> getWebsiteLinklistsByHandle(' + websiteId + ',' + handle + ')');

        cmsDao.getWebsiteById(websiteId, function(err, website){
            if(err) {
                self.log.error('Error getting website linklists for id [' + websiteId + '] and handle [' + handle + ']');
                fn(err, null);
            } else {
                self.log.debug('got the website:');
                console.dir(website);
                var linkListAry = website.get('linkLists');
                var targetList = null;
                for(var i=0; i<linkListAry.length; i++) {
                    if(linkListAry[i].handle === handle) {
                        targetList = linkListAry[i];
                        break;
                    }
                }
                self.log.debug('<< getWebsiteLinklistsByHandle');
                fn(null, targetList);
            }
        });
    },

    addWebsiteLinklists: function(websiteId, linklist, fn) {
        var self = this;
        self.log = log;
        self.log.debug('>> getWebsiteLinklistsByHandle');


        cmsDao.getWebsiteById(websiteId, function(err, website){
            if(err) {
                self.log.error('Error getting website for id [' + websiteId + ']');
                fn(err, null);
            } else {
                //some basic validation
                var handle = linklist.handle;
                var name = linklist.name;
                var links = linklist.links || [];
                if(!handle || !name) {
                    self.log.error('Linklist must contain name and handle.');
                    fn('Linklist must contain name and handle.', null);
                    return;
                }
                website.get('linkLists').push(linklist);
                cmsDao.saveOrUpdate(website, function(err, website){
                    if(err) {
                        self.log.error('Error updating website linklists for id [' + websiteId + ']');
                        fn(err, null);
                    } else {
                        self.log.debug('<< getWebsiteLinklistsByHandle');
                        fn(null, website.get('linkLists'));
                    }
                });
            }
        });
    },

    updateWebsiteLinklists: function(websiteId, handle, linklist, fn) {
        var self = this;
        self.log = log;
        self.log.debug('>> updateWebsiteLinklists');

        cmsDao.getWebsiteById(websiteId, function(err, website){
            if(err) {
                self.log.error('Error getting website linklists for id [' + websiteId + '] and handle [' + handle + ']');
                fn(err, null);
            } else {

                var linkListAry = website.get('linkLists');
                var targetListIndex = -1;
                for(var i=0; i<linkListAry.length; i++) {
                    if(linkListAry[i].handle === handle) {
                        targetListIndex = i;
                        break;
                    }
                }
                if(targetListIndex !== -1) {
                    linkListAry.splice(targetListIndex, 1, linklist);
                    cmsDao.saveOrUpdate(website, function(err, value){
                        if(err) {
                            self.log.error('Error updating website: ' + err);
                            fn(err, null);
                        } else {
                            self.log.debug('<< updateWebsiteLinklists');
                            fn(null, value.get('linkLists'));
                        }
                    });
                } else {
                    self.log.error('linklist with handle [' + handle + '] was not found');
                    fn('linklist with handle [' + handle + '] was not found', null);
                }
            }
        });
    },

    deleteWebsiteLinklists: function(websiteId, handle, fn) {
        var self = this;
        self.log = log;
        self.log.debug('>> deleteWebsiteLinklists');

        cmsDao.getWebsiteById(websiteId, function (err, website) {
            if (err) {
                self.log.error('Error getting website linklists for id [' + websiteId + '] and handle [' + handle + ']');
                fn(err, null);
            } else {

                var linkListAry = website.get('linkLists');
                var targetListIndex = -1;
                for (var i = 0; i < linkListAry.length; i++) {
                    if (linkListAry[i].handle === handle) {
                        targetListIndex = i;
                        break;
                    }
                }

                if (targetListIndex !== -1) {
                    linkListAry.splice(targetListIndex, 1);
                    cmsDao.saveOrUpdate(website, function (err, value) {
                        if (err) {
                            self.log.error('Error updating website: ' + err);
                            fn(err, null);
                        } else {
                            self.log.debug('<< deleteWebsiteLinklists');
                            fn(null, value.get('linkLists'));
                        }
                    });
                } else {
                    self.log.error('linklist with handle [' + handle + '] was not found');
                    fn('linklist with handle [' + handle + '] was not found', null);
                }
            }
        });
    },

    getSavedScreenshot: function(accountId, pageHandle, fn) {
        var self = this;
        log.debug('>> getSavedScreenshot');
        //TODO: handle multiple websites per account. (non-unique page handles)
        var query = {accountId: accountId, handle:pageHandle};

        cmsDao.findOne(query, $$.m.cms.Page, function(err, page){
            if(err) {
                log.error('Error finding page for accountId [' + accountId + '] and handle [' + pageHandle +']: ' + err);
                return fn(err, null);
            }
            log.debug('<< getSavedScreenshot');
            return fn(null, page.get('screenshot'));
        });

    },

    generateScreenshot: function(accountId, pageHandle, fn) {
        var self = this;
        log.debug('>> generateScreenshot');
        //TODO: handle multiple websites per account. (non-unique page handles)
        /*
         * Get the URL for the page.
         * Generate URLBox URL
         * Download URLBox image
         * Upload image to S3
         * Return URL for S3 image
         */
        accountDao.getServerUrlByAccount(accountId, function(err, serverUrl){
            if(err) {
                log.error('Error getting server url: ' + err);
                return fn(err, null);
            }
            log.debug('got server url');
            if(pageHandle !== 'index' && pageHandle.indexOf('blog/') == -1) {
                serverUrl +='/page/' + pageHandle;
            }
            var options = {
                width: 300,
                height: 200,
                full_page: true,
                delay: 3500,
                force: true
            };


            var name = new Date().getTime() + '.png';
            var tempFile = {
                name: name,
                path: 'tmp/' + name
            };
            var tempFileName = tempFile.path;
            var ssURL = urlboxhelper.getUrl(serverUrl, options);
            var bucket = awsConfig.BUCKETS.SCREENSHOTS;
            var subdir = 'account_' + accountId;

            //check if the length is greater than 5kb.  If not, do it again.
            self._checkSize(ssURL, function(err, size){
                if(parseInt(size) < 5000) {
                    options.delay = 9000;
                    ssURL = urlboxhelper.getUrl(serverUrl, options);
                    log.debug('Increasing delay to 5000 for ' + serverUrl);
                }
                self._download(ssURL, tempFile, function(){
                    log.debug('stored screenshot at ' + tempFileName);
                    tempFile.type = 'image/png';
                    s3dao.uploadToS3(bucket, subdir, tempFile, null, function(err, value){
                        fs.unlink(tempFile.path, function(err, value){});
                        if(err) {
                            log.error('Error uploading to s3: ' + err);
                            fn(err, null);
                        } else {
                            log.debug('Got the following from S3', value);
                            log.debug('<< generateScreenshot');
                            fn(null, 'http://' + bucket + '.s3.amazonaws.com/' + subdir + '/' + tempFile.name);
                        }
                    });
                });


            });



        });
    },

    updatePageScreenshot: function(pageId, fn) {
        var self = this;
        log.debug('>> updatePageScreenshot');

        cmsDao.getPageById(pageId, function(err, page){
            if(err) {
                log.error('Error getting page: ' + err);
                return fn(err, null);
            }
            var accountId = page.get('accountId');
            var pageHandle = page.get('handle');
            self.generateScreenshot(accountId, pageHandle, function(err, url){
                if(err) {
                    log.error('Error generating screenshot: ' + err);
                    return fn(err, null);
                }
                if (url.substr(0,5) == 'http:') {
                  url = url.substr(5, url.length);
                }
                page.set('screenshot', url);
                cmsDao.saveOrUpdate(page, function(err, savedPage){
                    if(err) {
                        log.error('Error updating page: ' + err);
                        return fn(err, null);
                    } else {
                        log.debug('<< updatePageScreenshot');
                        return fn(null, savedPage);
                    }
                });
            });
        });
    },


    getDistinctBlogPostAuthors: function(accountId, fn) {
        var self = this;
        log.debug('>> getDistinctBlogPostAuthors');

        blogPostDao.distinct('post_author', {accountId:accountId}, $$.m.BlogPost, function(err, value){
            if(err) {
                log.error('Error getting distinct authors: ' + err);
                return fn(err, null);
            } else {
                log.debug('<< getDistinctBlogPostAuthors');
                return fn(null, value);
            }
        });

    },

    getDistinctBlogPostTitles: function(accountId, fn) {
        var self = this;
        log.debug('>> getDistinctBlogPostTitles');

        blogPostDao.distinct('post_title', {accountId:accountId}, $$.m.BlogPost, function(err, value){
            if(err) {
                log.error('Error getting distinct authors: ' + err);
                return fn(err, null);
            } else {
                log.debug('<< getDistinctBlogPostTitles');
                return fn(null, value);
            }
        });
    },

    getDistinctBlogPostCategories : function(accountId, fn) {
        var self = this;
        log.debug('>> getDistinctBlogPostCategories');

        blogPostDao.distinct('post_category', {accountId:accountId}, $$.m.BlogPost, function(err, value){
            if(err) {
                log.error('Error getting distinct authors: ' + err);
                return fn(err, null);
            } else {
                log.debug('<< getDistinctBlogPostCategories');
                return fn(null, value);
            }
        });
    },

    getDistinctBlogPostTags: function(accountId, fn) {
        var self = this;
        log.debug('>> getDistinctBlogPostTags');

        blogPostDao.distinct('post_tags', {accountId:accountId}, $$.m.BlogPost, function(err, value){
            if(err) {
                log.error('Error getting distinct authors: ' + err);
                return fn(err, null);
            } else {
                log.debug('<< getDistinctBlogPostTags');
                return fn(null, value);
            }
        });
    },



    _addPostIdToBlogComponentPage: function(postId, page) {
        var self = this;
        var componentAry = page.get('components') || [];
        var blogComponent = null;
        for(var i=0; i<componentAry.length; i++) {
            if(componentAry[i]['type']==='blog') {
                blogComponent = new $$.m.cms.modules.Blog(componentAry[i]);
            }
        }
        if(!blogComponent) {
            return null;
        }

        var postsAry = blogComponent.get('posts') || [];
        postsAry.push(postId);
        return postsAry;

    },

    _removePostIdFromBlogComponentPage: function(postId, page) {
        var componentAry = page.get('components') || [];

        var blogComponent = null;
        for(var i=0; i<componentAry.length; i++) {
            if(componentAry[i]['type']==='blog') {
                blogComponent = new $$.m.cms.modules.Blog(componentAry[i]);
            }
        }
        if(!blogComponent) {
            return null;
        }
        var postsAry = blogComponent.get('posts') || [];
        var spliceIndex = -1;
        for(var i = 0; i<postsAry.length; i++) {
            if(postsAry[i] === postId) {
                spliceIndex = i;
            }
        }

        if(spliceIndex > 0) {
            postsAry.splice(spliceIndex, 1);
        }

        return postsAry;

    },

    //TODO: Remove this console logs
    _download: function(uri, file, callback){
        console.log('calling download.  Saving to: ' + file.path);
        request.head(uri, function(err, res, body){
            console.log('content-type:', res.headers['content-type']);
            console.log('content-length:', res.headers['content-length']);
            file.type = res.headers['content-type'];
            file.size = res.headers['content-length'];
            if(err) {
                console.log('err getting the head for ' + uri);
            }
            request(uri).on('error', function(err) {
                console.log('error getting screenshot: ' + err);
            }).pipe(fs.createWriteStream(file.path)).on('close', callback);
        });
    },

    _checkSize: function(uri, callback) {
        request.head(uri, function(err, res, body){
            if(err) {
                log.error('checksize error: ' + err);
                callback(null, 0);
            }
            var length = res.headers['content-length'];
            log.debug('checksize length: ' + length);
            callback(null, length);
        });
    },

    _downloadToS3: function(uri,bucket,subdir, callback) {
        var resourceName = subdir + '/' + new Date().getTime() + '.png';
        var s3Url = s3dao.getSignedRequest(bucket, resourceName, 3600);
        request(uri).on('error', function(err){
            console.log('error getting screenshot: ' + err);
        }).pipe(request.put(s3Url).on('error', function(err){
            console.log('error during put: ' + err);
        }).on('close', callback));
    },


    getEmailPage: function(accountId, email_type, fn) {
        var self = this;
        log.debug('>> getEmailPage');

        var query = {
            accountId: accountId,
            handle: email_type,
            latest:true
        };

        emailDao.findOne(query, $$.m.cms.Email, function(err, email){
            if(err) {
                log.error('Error finding email email: ' + err);
                return fn(err, null);
            } else {
                log.debug('<< getEmailPage');
                return fn(null, email);
            }
        });
    },

    getAllTopics: function(accountId, fn) {
        log.debug('>> getAllTopics');

        var query = {
            _id: { $exists : true, $ne : '__counter__'}
        };

        topicDao.findMany(query, $$.m.cms.Topic, function(err, list){
            if(err) {
                log.error('Exception thrown listing topics: ' + err);
                fn(err, null);
            } else {
                log.debug('<< getAllTopics');
                fn(null, list);
            }
        });
    },

    createTopic: function(topic, fn) {
        var self = this;
        self.log = log;

        log.debug('topic ', topic);

        topic.attributes.components = [
            {
                "_id" : $$.u.idutils.generateUUID(),
                "anchor" : $$.u.idutils.generateUUID(),
                "type" : "text-only",
                "version" : 1,
                "txtcolor" : "#000000",
                "text" : "<p style=\"text-align: left;\"><span style=\"font-size:24px;\">"+topic.attributes.title+"</span></p>",
                "bg" : {
                    "img" : {
                        "url" : "",
                        "width" : null,
                        "height" : null,
                        "parallax" : false,
                        "blur" : false,
                        "overlay" : false,
                        "show" : false
                    },
                    "color" : "#ffffff"
                },
                "visibility" : true,
                "spacing" : {
                    "pt" : 50,
                    "pb" : 25,
                    "pl" : 0,
                    "pr" : 0,
                    "mt" : 0,
                    "mb" : 0,
                    "mr" : "auto",
                    "ml" : "auto",
                    "mw" : 768,
                    "usePage" : false
                }
            },
            {
                "_id" : $$.u.idutils.generateUUID(),
                "anchor" : $$.u.idutils.generateUUID(),
                "type" : "video",
                "version" : "1",
                "title" : "",
                "videoType" : "youtube",
                "video" : "",
                "videoMp4" : "",
                "videoWebm" : "",
                "videoAutoPlay" : false,
                "videoControls" : true,
                "videoBranding" : true,
                "videoWidth" : 780,
                "videoHeight" : 320,
                "videoImage" : "",
                "txtcolor" : "#000000",
                "bg" : {
                    "img" : {
                        "url" : "",
                        "width" : null,
                        "height" : null,
                        "parallax" : false,
                        "blur" : false,
                        "overlay" : false,
                        "show" : false
                    },
                    "color" : "#ffffff"
                },
                "visibility" : false,
                "spacing" : {
                    "pt" : 25,
                    "pb" : 30,
                    "pl" : 0,
                    "pr" : 0,
                    "mt" : 0,
                    "mb" : 0,
                    "mr" : "auto",
                    "ml" : "auto",
                    "mw" : 1024,
                    "usePage" : false
                },
                "icon" : "fa fa-video",
                "header_title" : "Video"
            }, 
            {
                "_id" : $$.u.idutils.generateUUID(),
                "anchor" : $$.u.idutils.generateUUID(),
                "type" : "text-only",
                "version" : 1,
                "txtcolor" : "#000000",
                "text" : "<span style=\"color:#7a7a7a;\"><span style=\"font-size:14px;\">This is the description of the overall purpose of whatever is being described.&nbsp;Lorem ipsum dolor sit amet, consectetur adipisicing elit. Asperiores quis mollitia nesciunt praesentium consequatur! Vero fugiat repellat, dolores natus maiores dolorem ipsam beatae, odit, quibusdam, laudantium earum. Iste, distinctio, quis!<br /><br />To check your <strong>SECTION</strong> select&nbsp;<strong>SECTION</strong> in the&nbsp;<strong>SECTION</strong> menu.<br /><br /><strong>1. Click this button</strong></span></span><br />&nbsp;<div style=\"text-align:center\"><img alt=\"\" width=\"800\" height=\"200\" class=\"img-thumbnail\" src=\"http://placehold.it/800x200\" /></div><span style=\"color:#7a7a7a;\"><span style=\"font-size:14px;\"></span></span><br /><span style=\"color:#7a7a7a;\"><span style=\"font-size:14px;\"><strong>2. Click this button</strong></span></span><br />&nbsp;<div style=\"text-align:center\"><img alt=\"\" width=\"800\" height=\"200\" class=\"img-thumbnail\" src=\"http://placehold.it/800x200\" /></div><span style=\"color:#7a7a7a;\"><span style=\"font-size:14px;\"><br /><strong>3. Click this button</strong></span></span><br />&nbsp;<div style=\"text-align:center\"><img alt=\"\" width=\"800\" height=\"200\" class=\"img-thumbnail\" src=\"http://placehold.it/800x200\" /></div><br />&nbsp;",
                "bg" : {
                    "img" : {
                        "url" : "",
                        "width" : null,
                        "height" : null,
                        "parallax" : false,
                        "blur" : false,
                        "overlay" : false,
                        "show" : false
                    },
                    "color" : "#ffffff"
                },
                "visibility" : true,
                "spacing" : {
                    "pt" : 0,
                    "pb" : 0,
                    "pl" : 0,
                    "pr" : 0,
                    "mt" : 0,
                    "mb" : 0,
                    "mr" : "auto",
                    "ml" : "auto",
                    "mw" : 768,
                    "usePage" : false
                }
            }
        ];


        self.log.debug('>> createTopic', topic);
        topicDao.saveOrUpdate(topic, function(err, value){
            if(err) {
                log.error('Exception thrown updating topic: ' + err);
                fn(err, null);
            } else {
                log.debug('<< createTopic');
                fn(null, value);
            }
        });
    },

    updateTopic: function(topic, fn) {
        log.debug('>> updateTopic ', topic);
        topicDao.saveOrUpdate(topic, function(err, value){
            if(err) {
                log.error('Exception thrown updating topic: ' + err);
                fn(err, null);
            } else {
                log.debug('<< updateTopic');
                fn(null, value);
            }
        });
    },

    deleteTopic: function(topicId, fn) {
        log.debug('>> deleteTopic');
        topicDao.removeById(topicId, $$.m.cms.Topic, function(err, value){
            if(err) {
                log.error('Exception thrown while deleting topic: ' + err);
            } else {
                log.debug('<< deleteTopic');
                fn(null, value);
            }
        });
    },
};
