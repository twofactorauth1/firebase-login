require('./dao/cms.dao.js');

var blogPostDao = require('./dao/blogpost.dao.js');
var cmsDao = require('./dao/cms.dao.js');

var log = $$.g.getLogger("cms_manager");
var Blog = require('./model/components/blog');

module.exports = {



    getAllThemes: function(fn) {
        $$.dao.CmsDao.getAllThemes(fn);
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
            cmsDao.getPageById(pageId,function(err, page){
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
        /*
        var blogComponentAttrs = null;
        for(var i=0; i<componentAry.length; i++) {
            var attributes = componentAry[i]['attributes'];
            if(componentAry[i].type === 'blog') {
                blogComponentAttrs = componentAry[i];
            }
        }

        if(!blogComponentAttrs) {
            return null;
        }
        var postsAry = blogComponentAttrs['posts'] || [];

        postsAry.push(postId);
        return postsAry;
        */

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

        /*
        var blogComponentAttrs = null;
        for(var i=0; i<componentAry.length; i++) {
            var attributes = componentAry[i]['attributes'];
            if(attributes['type'] === 'blog') {
                blogComponentAttrs = componentAry[i]['attributes'];
            }
        }

        if(!blogComponentAttrs) {
            return null;
        }
        var postsAry = blogComponentAttrs['posts'] || [];
        var spliceIndex = -1;
        for(var i = 0; i<postsAry.length; i++) {
            if(postsAry[i] === postId) {
                spliceIndex = i;
            } else {
                //console.log(postsAry[i] + ' does not equal ' + postId);
            }
        }

        if(spliceIndex > 0) {
            postsAry.splice(spliceIndex, 1);
        }

        return postsAry;
        */
    }
};