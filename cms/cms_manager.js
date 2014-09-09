require('./dao/cms.dao.js');

var blogPostDao = require('./dao/blogpost.dao.js');
var cmsDao = require('./dao/cms.dao.js');
var accountDao = require('../dao/account.dao.js');
var themeConfigDao = require('./dao/themeconfig.dao.js');

var log = $$.g.getLogger("cms_manager");
var Blog = require('./model/components/blog');

module.exports = {

    /*
     * ThemeConfig
     */

    getThemeConfigById: function(themeId, fn) {
        log.debug('>> getThemeConfigById');
        themeConfigDao.getById(themeId, $$.m.cms.ThemeConfig, function(err, value){
            if(err) {
                log.error('Exception thrown getting config: ' + err);
                fn(err, null);
            } else {
                log.debug('<< getThemeConfigById');
                fn(null, value);
            }
        });
    },

    getThemeConfigByName: function(name, fn) {
        log.debug('>> getThemeConfigByName');
        themeConfigDao.findOne({'name': name}, $$.m.cms.ThemeConfig, function(err, value){
            if(err) {
                log.error('Exception thrown getting config: ' + err);
                fn(err, null);
            } else {
                log.debug('<< getThemeConfigByName');
                fn(null, value);
            }
        });
    },

    getThemeConfigByAccountId: function(accountId, fn) {
        //TODO: later
    },

    getAllThemeConfigs: function(fn) {
        log.debug('>> getAllThemeConfigs');
        themeConfigDao.findMany({}, $$.m.cms.ThemeConfig, function(err, list){
            if(err) {
                log.error('Exception thrown listing theme configs: ' + err);
                fn(err, null);
            } else {
                log.debug('<< getAllThemeConfigs');
                fn(null, list);
            }
        });
    },

    updateThemeConfig: function(themeConfig, fn) {
        log.debug('>> updateThemeConfig');
        themeConfigDao.saveOrUpdate(themeConfig, function(err, value){
            if(err) {
                log.error('Exception thrown updating themeconfig: ' + err);
                fn(err, null);
            } else {
                log.debug('<< updateThemeConfig');
                fn(null, value);
            }
        });
    },

    getAllThemes: function(fn) {
        $$.dao.CmsDao.getAllThemes(fn);
    },

    getThemePreview: function(themeId, fn) {
        cmsDao.getThemePreview(themeId, fn);
    },

    setThemeForAccount: function(accountId, themeId, fn) {
        //validateThemeId
        var p1 = $.Deferred();
        cmsDao.themeExists(themeId, function(err, value){
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
                    fn(err, null);
                }
                var website = account.get('website');
                website.themeId = themeId;
                accountDao.saveOrUpdate(account, function(err, value){
                    if(err) {
                        fn(err, null);
                    }
                    fn(null, 'SUCCESS');
                });
            });
        });

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
                fn(err, null);
            } else {
                //store the id in the page component's array
                cmsDao.getPageById(savedPost.get('pageId'), function(err, page){
                    if(err) {
                        self.log.error('Error getting page for post: ' + err);
                        fn(err, null);
                    } else if(!page){
                        var msg = 'Referenced page [' + savedPost.get('pageId') + '] does not exist:';
                        self.log.error(msg);
                        fn(msg, null);
                    } else {

                        var postAry = self._addPostIdToBlogComponentPage(savedPost.id(), page);
                        if(postAry === null) {
                            fn('Page does not contain blog component.', null);
                        }

                        cmsDao.saveOrUpdate(page, function(err, page){
                            if(err) {
                                self.log.error('Error updating page for post: ' + err);
                                fn(err, null);
                            } else {
                                self.log.debug('<< createBlogPost');
                                fn(null, savedPost);
                            }
                        });
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
                cmsDao.saveOrUpdate(page, fn);
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

    updatePage: function(pageId, page, fn) {
        var self = this;
        self.log = log;

        self.log.debug('>> updatePage');
        //make sure the ID is set.
        page.set('_id', pageId);

        cmsDao.saveOrUpdate(page, function(err, value){
            if(err) {
                self.log.error('Error updating page: ' + err);
                fn(err, null);
            } else {
                self.log.debug('<< udpatePage');
                fn(null, value);
            }
        });

    },

    deletePage: function(pageId, fn) {
        var self = this;
        self.log = log;

        self.log.debug('>> deletePage');
        cmsDao.removeById(pageId, $$.m.cms.Page, function(err, value){
            if (err) {
                self.log.error('Error deleting page with id [' + pageId + ']: ' + err);
                fn(err, null);
            } else {
                self.log.debug('<< deletePage');

                fn(null, value);
            }
        });
    },

    createPage: function(page, fn) {
        var self = this;
        self.log = log;


        self.log.debug('>> createPage');
        cmsDao.saveOrUpdate(page, function(err, value){
            if(err) {
                self.log.error('Error creating page: ' + err);
                fn(err, null);
            } else {
                //self.log.debug('<< createPage');
                self.log.debug('created page.  Updating Linklists');
                //console.dir(page);
                //console.dir(value);
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

                })


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

    }
};