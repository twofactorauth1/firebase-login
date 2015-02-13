require('./dao/cms.dao.js');

var blogPostDao = require('./dao/blogpost.dao.js');
var cmsDao = require('./dao/cms.dao.js');
var accountDao = require('../dao/account.dao.js');
var themeDao = require('./dao/theme.dao.js');
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

    getAllThemes: function(accountId, fn) {
        log.debug('>> getAllThemes');
        themeDao.findMany({$or : [{'accountId': accountId}, {'isPublic': true}, {'isPublic': 'true'}]}, $$.m.cms.Theme, function(err, list){
            if(err) {
                log.error('Exception thrown listing themes: ' + err);
                fn(err, null);
            } else {
                log.debug('<< getAllThemes');
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

    updateTheme: function(theme, fn) {
        log.debug('>> updateTheme');
        themeDao.saveOrUpdate(theme, function(err, value){
            if(err) {
                log.error('Exception thrown updating theme: ' + err);
                fn(err, null);
            } else {
                log.debug('<< updateTheme');
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

    createWebsiteAndPageFromTheme: function(accountId, themeId, userId, websiteId, pageHandle, fn) {
        log.debug('>> createWebsiteFromTheme');
        if(fn === null) {
            fn = pageHandle;
            pageHandle = null;
        }
        //default to index page if none is specified
        if(pageHandle === null) {
            pageHandle = 'index';
        }

        var theme, website, page;

        var p1 = $.Deferred();
        themeDao.getById(themeId, $$.m.cms.Theme, function(err, _theme) {
            if (err) {
                log.error('Exception getting theme: ' + err);
                p1.reject();
            } else {
                log.debug('Got theme.');
                theme = _theme;

                if(websiteId === null) {
                    log.debug('creating website');
                    //create it
                    var settings = theme.get('config')['settings'];
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


        $.when(p1).done(function(){
            //at this point we have the theme and website.
            log.debug('Creating Page');
            var componentAry = theme.get('config')['components'];
            page = new $$.m.cms.Page({
                'accountId': accountId,
                'handle': pageHandle,
                'title': pageHandle.charAt(0).toUpperCase() + pageHandle.substring(1),
                'websiteId': websiteId,
                'components': componentAry,
                'created': {
                    'by': userId,
                    'date': new Date()
                }
            });
            cmsDao.saveOrUpdate(page, function(err, savedPage){
                if(err) {
                    log.error('Exception saving new page: ' + err);
                    fn(err, null);
                } else {
                    log.debug('<< createWebsiteFromTheme');
                    fn(null, {'website': website, 'page': savedPage});
                }
            });

        });

    },

    createDefaultPageForAccount: function(accountId, websiteId, fn) {
        var self = this;
        cmsDao.createDefaultPageForAccount(accountId, websiteId, function(err, page){
            if(err) {
                log.error('Error creating default page: ' + err);
                return fn(err, null);
            }
            log.debug('creating page screenshot');
            self.updatePageScreenshot(page.id(), fn);
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
                                self._getOrCreateSinglePostPage(accountId, blogPost.get('websiteId'), function(err, value){
                                    if(err) {
                                        self.log.error('Error creating single-post-page: ' + err);
                                        return;
                                    }
                                });
                            }

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
                            self._getOrCreateSinglePostPage(accountId, blogPost.get('websiteId'), function(err, value){
                                if(err) {
                                    self.log.error('Error creating single-post-page: ' + err);
                                    return;
                                }
                            });
                        }

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
                "date" : null,
                "by" : null
            }
        };

        cmsDao.saveOrUpdate(new $$.m.cms.Page(blogPage), function(err, value){
            if(err) {
                return fn(err, null);
            } else {
                return fn(null, value);
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
            "date" : null,
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

    getBlogPost: function(accountId, postId, fn) {
        blogPostDao.getById(postId, fn);
    },

    updateBlogPost: function(accountId, blogPost, fn) {
        var self = this;
        console.dir('blogPost '+JSON.stringify(blogPost));
        blogPostDao.saveOrUpdate(blogPost, fn);
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

    getPostsByAuthor: function(accountId, author, fn) {
        blogPostDao.getPostsByAuthor(author, fn);
    },

    getPostsByTitle: function(accountId, title, fn) {
        blogPostDao.getPostsByTitle(title, fn);
    },

    getPostsByData: function(accountId, data, fn) {
        blogPostDao.getPostsByData(data, fn);
    },

    getPostsByCategory: function(accountId, category, fn) {
        blogPostDao.getPostsByCategory(category, fn);
    },

    getPostsByTag: function(accountId, tag, fn) {
        blogPostDao.getPostsByTags(tag, fn);
    },

    listBlogPosts: function(accountId, limit, fn) {
        blogPostDao.findManyWithLimit({'accountId':accountId}, limit, $$.m.BlogPost, fn);
    },
    listBlogPostsByPageId: function(pageId, limit, fn) {
        blogPostDao.findManyWithLimit({'pageId':pageId}, limit, $$.m.BlogPost, fn);
    },

    listPostIdsByPage: function(accountId, pageId, fn) {
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
                self.log.debug('<< getPageVersions');
                return fn(null, list);
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
                width: 1280,
                height: 1024,
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

        blogPostDao.distinct('post_author', {accountId:accountId}, $$.m.cms.BlogPost, function(err, value){
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

        blogPostDao.distinct('post_title', {accountId:accountId}, $$.m.cms.BlogPost, function(err, value){
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

        blogPostDao.distinct('post_category', {accountId:accountId}, $$.m.cms.BlogPost, function(err, value){
            if(err) {
                log.error('Error getting distinct authors: ' + err);
                return fn(err, null);
            } else {
                log.debug('<< getDistinctBlogPostCategories');
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
    }
};