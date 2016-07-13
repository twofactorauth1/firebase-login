/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014-2016
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var BaseView = require('./base.server.view');

var segmentioConfig = require('../configs/segmentio.config.js');
var fs = require('fs');
var async = require('async');
var ssbManager = require('../ssb/ssb_manager');
var ngParser = require('../utils/ngparser');
var jsonldbuilder = require('../utils/jsonldbuilder');
var _req;

var view = function (req, resp, options) {
    this._req = req;
    this.init.apply(this, arguments);
};

_.extend(view.prototype, BaseView.prototype, {

    log: $$.g.getLogger('blog.server.view'),


    renderBlogPage: function(accountId) {
        var self = this;
        self.log.debug(accountId, null, '>> renderBlogPage');
        var data = {ssbBlog:true};
        var handle = 'blog-list';
        async.waterfall([
            function getWebpageData(cb){
                ssbManager.getDataForWebpage(accountId, handle, function(err, value){
                    if(err) {
                        self.log.error('Error getting data for website:', err);
                        cb(err);
                    } else {
                        cb(null, value);
                    }
                });
            },
            function getAllPages(webpageData, cb) {
                ssbManager.listPublishedPages(accountId, webpageData.website._id, function(err, allPages){
                    cb(err, webpageData, allPages);
                });
            },
            function getPublishedPage(webpageData, allPages, cb) {
                ssbManager.getPublishedPage(accountId, webpageData.website._id, handle, function(err, page){
                    cb(err, webpageData, allPages, page);
                });
            },
            function readComponents(webpageData, allPages, page, cb) {
                data.templates = '';
                if(page) {
                    data.templateIncludes = [];
                    data.templateIncludes[0] = {id:'/components/component-wrap.html'};
                    fs.readFile('public/components/component-wrap.html', 'utf8', function(err, html){
                        data.templateIncludes[0].data = html;
                        var components = [];
                        _.each(page.get('sections'), function(section){
                            if(section) {
                                components = components.concat(section.components);
                            }
                        });

                        var map = {};
                        async.eachSeries(components, function(component, cb){
                            if(component) {
                                var obj = {};
                                obj.id = '/components/' + component.type + '_v' + component.version + '.html';
                                if(map[obj.id]) {
                                    cb(null);
                                } else {
                                    fs.readFile('public' + obj.id, 'utf8', function(err, html){
                                        obj.data = html;
                                        data.templateIncludes.push(obj);
                                        map[obj.id] = obj;
                                        cb();
                                    });
                                }
                            } else {
                                cb();
                            }

                        }, function done(err){
                            cb(null, webpageData, allPages, page);
                        });


                    });
                } else {
                    cb('Could not find ' + handle);
                }

            },

            function addSSBSection(webpageData, allPages, page, cb){
                var ssbSectionTemplate = {'id':'/admin/assets/js/ssb-site-builder/ssb-components/ssb-page-section/ssb-page-section.component.html'};
                fs.readFile('public/admin/assets/js/ssb-site-builder/ssb-components/ssb-page-section/ssb-page-section.component.html', 'utf8', function(err, html) {
                    ssbSectionTemplate.data = html;
                    data.templateIncludes.push(ssbSectionTemplate);
                    cb(null, webpageData, allPages, page);
                });
            },

            function getBlogPosts(webpageData, allPages, page, cb) {

                var _tag = null;
                var _author = null;
                var url_path = self._req.originalUrl;
                if (url_path.indexOf("tag/") > -1) {
                    _tag = decodeURIComponent(url_path.replace('/tag/', ''));
                }

                if (url_path.indexOf("author/") > -1) {
                    _author = decodeURIComponent(url_path.replace('/author/', ''));
                }

                ssbManager.getPublishedPosts(accountId, null, null, function(err, posts){
                    if(_tag || _author){

                        
                        if(_author){
                            posts =  posts.filter(function(post){
                                // console.log(post)
                                return post.get("post_author") === _author
                            })
                        }
                        if(_tag){
                            posts = posts.filter(function(post){
                                if (post.get("post_tags")) {
                                    return post.get("post_tags").indexOf(_tag) > -1;
                                }
                            })
                        }
                    }

                    cb(err, webpageData, allPages, page, posts);

                });
            },

            function addBlogTemplate(webpageData, allPages, page, posts, cb) {
                fs.readFile('public/admin/assets/js/ssb-site-builder/ssb-components/ssb-blog-post/ssb-blog-post-list/ssb-blog-post-list.component.html', 'utf-8', function(err, html) {
                    if (err) {
                        self.log.error('Error reading post-list:', err);
                        cb(err);
                    } else {
                        fs.readFile('public/admin/assets/js/ssb-site-builder/ssb-components/ssb-blog-post/ssb-blog-post-card/ssb-blog-post-card.component.html', 'utf-8', function (err, cardHtml) {
                            if (err) {
                                self.log.error('Error reading post-card:', err);
                                cb(err);
                            } else {
                                var blogListTemplate = {
                                    id: '/admin/assets/js/ssb-site-builder/ssb-components/ssb-blog-post/ssb-blog-post-list/ssb-blog-post-list.component.html',
                                    data: html
                                };
                                var blogCardTemplate = {
                                    id: '/admin/assets/js/ssb-site-builder/ssb-components/ssb-blog-post/ssb-blog-post-card/ssb-blog-post-card.component.html',
                                    data: cardHtml
                                };
                                data.templateIncludes.push(blogListTemplate);
                                data.templateIncludes.push(blogCardTemplate);
                                cb(null, webpageData, allPages, page, posts);
                            }
                        });
                    }
                });

            },

            function prepareForRender(value, allPages, page, posts, cb) {
                var pageHolder = {};
                _.each(allPages, function(page){
                    pageHolder[page.get('handle')] = page.toJSON('frontend');
                });

                data.pages = pageHolder;
                data.posts = posts;
                data.account = value;
                data.canonicalUrl = pageHolder[handle].canonicalUrl || null;
                data.account.website.themeOverrides = data.account.website.themeOverrides ||{};
                data.account.website.themeOverrides.styles = data.account.website.themeOverrides.styles || {};
                value.website = value.website || {};
                value.website.resources = value.website.resources || {};
                value.website.resources.userScripts = value.website.resources.userScripts || {};
                value.website.resources.userScripts.global = value.website.resources.userScripts.global || {};
                if(pageHolder[handle]) {
                    data.title = pageHolder[handle].title || value.website.title;
                } else {
                    data.title = value.website.title;
                }

                data.author = 'Indigenous';//TODO: wut?
                data.segmentIOWriteKey = segmentioConfig.SEGMENT_WRITE_KEY;
                data.website = value.website || {};
                if(pageHolder[handle] && pageHolder[handle].seo) {
                    data.seo = {
                        description: pageHolder[handle].seo.description || value.website.seo.description,
                        keywords: ''
                    };
                } else {
                    data.seo = {
                        description: value.website.seo.description,
                        keywords: ''
                    };
                }


                if (pageHolder[handle] && pageHolder[handle].seo && pageHolder[handle].seo.keywords && pageHolder[handle].seo.keywords.length) {
                    data.seo.keywords = _.pluck(pageHolder[handle].seo.keywords,"text").join(",");
                } else if (value.website.seo.keywords && value.website.seo.keywords.length) {
                    data.seo.keywords = _.pluck(value.website.seo.keywords,"text").join(",");
                }


                data.og = {
                    type: 'website',
                    title: (pageHolder[handle] || {}).title || value.website.title,
                    image: value.website.settings.favicon
                };
                if (data.og.image && data.og.image.indexOf('//') === 0) {
                    data.og.image = 'http:' + data.og.image;
                }
                data.includeEditor = false;

                if (!data.account.website.settings) {
                    self.log.warn('Website Settings is null for account ' + accountId);
                    data.account.website.settings = {};
                }
                var jsonldHolder = [];

                _.each(posts, function(post){
                    var url = self._req.originalUrl;
                    var orgName = value.business.name;
                    var logoUrl = value.business.logo;
                    jsonldHolder.push(jsonldbuilder.buildForBlogPost(post, url, orgName, logoUrl));
                });
                data.jsonld = JSON.stringify(jsonldHolder);
                app.render('blog', data, function (err, html) {
                    if (err) {
                        self.log.error('Error during render: ' + err);
                    }

                    self.resp.send(html);
                    self.cleanUp();
                    self.log.debug('<< renderBlogPage');
                    self = data = value = null;
                });
            }
        ], function done(err){
            self.log.error('Error in render:', err);
            app.render('404.html', {}, function(err, html){
                if(err) {
                    self.log.error('Error during render:', err);
                }
                self.resp.status(404).send(html);
            });
        });
    },

    renderBlogPageWithParser: function(accountId) {
        var self = this;
        self.log.debug(accountId, null, '>> renderBlogPage');
        var data = {ssbBlog:true};
        var handle = 'blog-list';
        async.waterfall([
            function getWebpageData(cb){
                ssbManager.getDataForWebpage(accountId, handle, function(err, value){
                    if(err) {
                        self.log.error('Error getting data for website:', err);
                        cb(err);
                    } else {
                        cb(null, value);
                    }
                });
            },
            function getAllPages(webpageData, cb) {
                ssbManager.listPublishedPages(accountId, webpageData.website._id, function(err, allPages){
                    cb(err, webpageData, allPages);
                });
            },
            function getPublishedPage(webpageData, allPages, cb) {
                ssbManager.getPublishedPage(accountId, webpageData.website._id, handle, function(err, page){
                    cb(err, webpageData, allPages, page);
                });
            },
            function readComponents(webpageData, allPages, page, cb) {
                data.templates = '';
                if(page) {
                    data.templateIncludes = [];
                    data.templateIncludes[0] = {id:'/components/component-wrap.html'};
                    fs.readFile('public/components/component-wrap.html', 'utf8', function(err, html){
                        data.templateIncludes[0].data = html;
                        var components = [];
                        _.each(page.get('sections'), function(section){
                            if(section) {
                                components = components.concat(section.components);
                            }
                        });

                        var map = {};
                        async.eachSeries(components, function(component, cb){
                            if(component) {
                                var obj = {};
                                obj.id = '/components/' + component.type + '_v' + component.version + '.html';
                                if(map[obj.id]) {
                                    cb(null);
                                } else {
                                    fs.readFile('public' + obj.id, 'utf8', function(err, html){
                                        obj.data = html;
                                        data.templateIncludes.push(obj);
                                        map[obj.id] = obj;
                                        cb();
                                    });
                                }
                            } else {
                                cb();
                            }

                        }, function done(err){
                            cb(null, webpageData, allPages, page);
                        });


                    });
                } else {
                    cb('Could not find ' + handle);
                }

            },

            function addSSBSection(webpageData, allPages, page, cb){
                var ssbSectionTemplate = {'id':'/admin/assets/js/ssb-site-builder/ssb-components/ssb-page-section/ssb-page-section.component.html'};
                fs.readFile('public/admin/assets/js/ssb-site-builder/ssb-components/ssb-page-section/ssb-page-section.component.html', 'utf8', function(err, html) {
                    ssbSectionTemplate.data = html;
                    data.templateIncludes.push(ssbSectionTemplate);
                    cb(null, webpageData, allPages, page);
                });
            },

            function getBlogPosts(webpageData, allPages, page, cb) {

                var _tag = null;
                var _author = null;
                var url_path = self._req.originalUrl;
                if (url_path.indexOf("tag/") > -1) {
                    _tag = url_path.replace('/tag/', '');
                }

                if (url_path.indexOf("author/") > -1) {
                    _author = url_path.replace('/author/', '');
                }

                ssbManager.getPublishedPosts(accountId, null, null, function(err, posts){
                    if(_tag || _author){
                        if(_author){
                            posts =  posts.filter(function(post){
                                // console.log(post)
                                return post.get("post_author") === _author
                            })
                        }
                        if(_tag){
                            posts = posts.filter(function(post){
                                if (post.get("post_tags")) {
                                    return post.get("post_tags").indexOf(_tag) > -1;
                                }
                            })
                        }
                    }
                    cb(err, webpageData, allPages, page, posts);

                });
            },

            function addBlogTemplate(webpageData, allPages, page, posts, cb) {
                /*
                 * Need to wrap this:
                 * <div class="ssb-layout__header_2-col_footer ssb-page-blog-list">

                 <div class="ssb-page-layout-row-header ssb-page-layout-row">
                 <div class="col-xs-12">
                 <ssb-page-section
                 ng-repeat="sectionIndex in page.layoutModifiers['header']"
                 section="page.sections[sectionIndex]"
                 index="$index"
                 class="ssb-page-section">
                 </ssb-page-section>
                 </div>
                 </div>

                 <div class="ssb-page-layout-row-2-col ssb-page-layout-row">
                 <div class="col-xs-12 col-md-8">
                 <ssb-page-section
                 ng-repeat="sectionIndex in page.layoutModifiers['2-col-1']"
                 section="page.sections[sectionIndex]"
                 index="$index"
                 class="ssb-page-section">
                 </ssb-page-section>
                 </div>

                 <div class="col-xs-12 col-md-4">
                 <ssb-page-section
                 ng-repeat="sectionIndex in page.layoutModifiers['2-col-2']"
                 section="page.sections[sectionIndex]"
                 index="$index"
                 class="ssb-page-section">
                 </ssb-page-section>
                 </div>
                 </div>

                 <div class="ssb-page-layout-row-footer ssb-page-layout-row">
                 <div class="col-xs-12">
                 <ssb-page-section
                 ng-repeat="sectionIndex in page.layoutModifiers['footer']"
                 section="page.sections[sectionIndex]"
                 index="$index"
                 class="ssb-page-section">
                 </ssb-page-section>
                 </div>
                 </div>

                 </div>
                 */


                if(page.get('layout') === 'ssb-layout__header_2-col_footer') {
                    var sections = page.get('sections');
                    var template = '<div class="ssb-layout__header_2-col_footer ssb-page-blog-list">';
                    template += '<div class="ssb-page-layout-row-header ssb-page-layout-row">';
                    template += '<div class="col-xs-12">';
                    var index = 0;
                    //<ssb-page-section ng-repeat="sectionIndex in page.layoutModifiers['header']" section="page.sections[sectionIndex]"
                    //index="$index" class="ssb-page-section"> </ssb-page-section>
                    _.each(page.get('layoutModifiers')['header'], function(idx){
                        template += '<ssb-page-section section="sections_' + idx + '" index="' + index + '" class="ssb-page-section"></ssb-page-section>';
                        index++;
                    });

                    template += '</div></div><div class="ssb-page-layout-row-2-col ssb-page-layout-row"><div class="col-xs-12 col-md-8">';
                    var blogPostIndex = 0;
                    _.each(page.get('layoutModifiers')['2-col-1'], function(idx){
                        if(sections[idx].filter === 'blog') {
                            blogPostIndex = idx;
                            //sections[idx].components[0].posts = posts;
                            //sections[idx].components[0].blog = {posts: posts};
                            self.log.debug('posts:', sections[idx].components[0]);
                        }
                        index++;
                    });
                    fs.readFile('public/admin/assets/js/ssb-site-builder/ssb-components/ssb-blog-post/ssb-blog-post-list/ssb-blog-post-list.component.html', 'utf-8', function(err, html){
                        if(err) {
                            self.log.error('Error reading post-list:', err);
                            cb(err);
                        } else {
                            fs.readFile('public/admin/assets/js/ssb-site-builder/ssb-components/ssb-blog-post/ssb-blog-post-card/ssb-blog-post-card.component.html', 'utf-8', function (err, cardHtml) {
                                if(err) {
                                    self.log.error('Error reading post-card:', err);
                                    cb(err);
                                } else {
                                    var substitutions = [{name:'ssb-blog-post-card-component', value:cardHtml, prefix:'vm'}];
                                    var jsonPosts = [];
                                    _.each(posts, function(post){jsonPosts.push(post.toJSON())});
                                    var context = {
                                        vm: {
                                            component: sections[blogPostIndex].components[0],
                                            blog: {
                                                posts: jsonPosts
                                            }
                                        }

                                    };
                                    self.log.debug('context:', context);
                                    ngParser.parseHtml(html, context, substitutions, function(err, value){
                                        template += value;
                                        template +='</div><div class="col-xs-12 col-md-4">';

                                        _.each(page.get('layoutModifiers')['2-col-2'], function(idx){
                                            template += '<ssb-page-section section="sections_' + idx + '" index="' + index + '" class="ssb-page-section"></ssb-page-section>';
                                            index++;
                                        });

                                        template += '</div></div><div class="ssb-page-layout-row-footer ssb-page-layout-row"><div class="col-xs-12">';

                                        _.each(page.get('layoutModifiers')['footer'], function(idx){
                                            template += '<ssb-page-section section="sections_' + idx + '" index="' + index + '" class="ssb-page-section"></ssb-page-section>';
                                            index++;
                                        });

                                        template +='</div></div></div>';
                                        // self.log.debug('template:', template);
                                        data.templateIncludes.push({
                                            id:'blog.html',
                                            data:template
                                        });
                                        cb(null, webpageData, allPages, page, posts);
                                    });
                                }
                            });
                        }
                    });
                } else {
                    data.templateIncludes.push({
                        id: 'blog.html',
                        data: '<ssb-page-section section="sections_0" index="0" class="ssb-page-section"></ssb-page-section><ssb-page-section section="sections_1" index="1" class="ssb-page-section"></ssb-page-section><ssb-page-section section="sections_2" index="2" class="ssb-page-section"></ssb-page-section><ssb-page-section section="sections_3" index="3" class="ssb-page-section"></ssb-page-section><ssb-page-section section="sections_4" index="4" class="ssb-page-section"></ssb-page-section>'
                    });
                    cb(null, webpageData, allPages, page, posts);
                }
            },

            function prepareForRender(value, allPages, page, posts, cb) {
                var pageHolder = {};
                _.each(allPages, function(page){
                    pageHolder[page.get('handle')] = page.toJSON('frontend');
                });

                data.pages = pageHolder;
                data.account = value;
                data.canonicalUrl = pageHolder[handle].canonicalUrl || null;
                data.account.website.themeOverrides = data.account.website.themeOverrides ||{};
                data.account.website.themeOverrides.styles = data.account.website.themeOverrides.styles || {};
                value.website = value.website || {};
                value.website.resources = value.website.resources || {};
                value.website.resources.userScripts = value.website.resources.userScripts || {};
                value.website.resources.userScripts.global = value.website.resources.userScripts.global || {};
                if(pageHolder[handle]) {
                    data.title = pageHolder[handle].title || value.website.title;
                } else {
                    data.title = value.website.title;
                }

                data.author = 'Indigenous';//TODO: wut?
                data.segmentIOWriteKey = segmentioConfig.SEGMENT_WRITE_KEY;
                data.website = value.website || {};
                if(pageHolder[handle] && pageHolder[handle].seo) {
                    data.seo = {
                        description: pageHolder[handle].seo.description || value.website.seo.description,
                        keywords: ''
                    };
                } else {
                    data.seo = {
                        description: value.website.seo.description,
                        keywords: ''
                    };
                }


                if (pageHolder[handle] && pageHolder[handle].seo && pageHolder[handle].seo.keywords && pageHolder[handle].seo.keywords.length) {
                    data.seo.keywords = _.pluck(pageHolder[handle].seo.keywords,"text").join(",");
                } else if (value.website.seo.keywords && value.website.seo.keywords.length) {
                    data.seo.keywords = _.pluck(value.website.seo.keywords,"text").join(",");
                }


                data.og = {
                    type: 'website',
                    title: (pageHolder[handle] || {}).title || value.website.title,
                    image: value.website.settings.favicon
                };
                if (data.og.image && data.og.image.indexOf('//') === 0) {
                    data.og.image = 'http:' + data.og.image;
                }
                data.includeEditor = false;

                if (!data.account.website.settings) {
                    self.log.warn('Website Settings is null for account ' + accountId);
                    data.account.website.settings = {};
                }
                var jsonldHolder = [];

                _.each(posts, function(post){
                    var url = self._req.originalUrl;
                    var orgName = value.business.name;
                    var logoUrl = value.business.logo;
                    jsonldHolder.push(jsonldbuilder.buildForBlogPost(post, url, orgName, logoUrl));
                });
                data.jsonld = JSON.stringify(jsonldHolder);
                app.render('blog', data, function (err, html) {
                    if (err) {
                        self.log.error('Error during render: ' + err);
                    }

                    self.resp.send(html);
                    self.cleanUp();
                    self.log.debug('<< renderBlogPage');
                    self = data = value = null;
                });
            }
        ], function done(err){
            self.log.error('Error in render:', err);
            app.render('404.html', {}, function(err, html){
                if(err) {
                    self.log.error('Error during render:', err);
                }
                self.resp.status(404).send(html);
            });
        });
    },

    renderBlogPost: function(accountId, postName) {
        var self = this;
        self.log.debug(accountId, null, '>> renderBlogPost');
        var data = {ssbBlog:true};
        var handle = 'blog-post';

        async.waterfall([
            function getWebpageData(cb){
                ssbManager.getDataForWebpage(accountId, handle, function(err, value){
                    if(err) {
                        self.log.error('Error getting data for website:', err);
                        cb(err);
                    } else {
                        cb(null, value);
                    }
                });
            },
            function getAllPages(webpageData, cb) {
                ssbManager.listPublishedPages(accountId, webpageData.website._id, function(err, allPages){
                    cb(err, webpageData, allPages);
                });
            },
            function getPublishedPage(webpageData, allPages, cb) {
                ssbManager.getPublishedPage(accountId, webpageData.website._id, handle, function(err, page){
                    cb(err, webpageData, allPages, page);
                });
            },
            function readComponents(webpageData, allPages, page, cb) {
                data.templates = '';
                if(page) {
                    data.templateIncludes = [];
                    data.templateIncludes[0] = {id:'/components/component-wrap.html'};
                    fs.readFile('public/components/component-wrap.html', 'utf8', function(err, html){
                        data.templateIncludes[0].data = html;
                        var components = [];
                        _.each(page.get('sections'), function(section){
                            if(section) {
                                components = components.concat(section.components);
                            }
                        });

                        var map = {};
                        async.eachSeries(components, function(component, cb){
                            if(component) {
                                var obj = {};
                                obj.id = '/components/' + component.type + '_v' + component.version + '.html';
                                if(map[obj.id]) {
                                    cb(null);
                                } else {
                                    fs.readFile('public' + obj.id, 'utf8', function(err, html){
                                        obj.data = html;
                                        data.templateIncludes.push(obj);
                                        map[obj.id] = obj;
                                        cb();
                                    });
                                }
                            } else {
                                cb();
                            }

                        }, function done(err){
                            cb(null, webpageData, allPages, page);
                        });


                    });
                } else {
                    cb('Could not find ' + handle);
                }

            },

            function addSSBSection(webpageData, allPages, page, cb){
                var ssbSectionTemplate = {'id':'/admin/assets/js/ssb-site-builder/ssb-components/ssb-page-section/ssb-page-section.component.html'};
                fs.readFile('public/admin/assets/js/ssb-site-builder/ssb-components/ssb-page-section/ssb-page-section.component.html', 'utf8', function(err, html) {
                    ssbSectionTemplate.data = html;
                    data.templateIncludes.push(ssbSectionTemplate);
                    cb(null, webpageData, allPages, page);
                });
            },

            function getBlogPost(webpageData, allPages, page, cb) {
                ssbManager.getPublishedPost(accountId, postName, function(err, post){
                    if (!post) {
                        cb('Could not find post with handle: ' + postName);
                    } else {
                        cb(err, webpageData, allPages, page, post);
                    }
                });
            },

            function addBlogTemplate(webpageData, allPages, page, post, cb) {
                //assuming single column layout
                var sections = page.get('sections');
                var templateSectionArray = [];
                var blogPostIndex = 0;

                _.each(sections, function(section, index) {
                    templateSectionArray.push('<ssb-page-section section="sections_' + index + '" index="' + index + '" class="ssb-page-section"></ssb-page-section>');
                });

                data.templateIncludes.push({
                    id: 'blogpost.html',
                    data: templateSectionArray.join('')
                });

                cb(null, webpageData, allPages, page, post);

            },

            function prepareForRender(value, allPages, page, post, cb) {
                var pageHolder = {};
                _.each(allPages, function(page){
                    pageHolder[page.get('handle')] = page.toJSON('frontend');
                });

                data.pages = pageHolder;
                data.post = post.toJSON('frontend');
                data.account = value;
                data.canonicalUrl = pageHolder[handle].canonicalUrl || null;
                data.account.website.themeOverrides = data.account.website.themeOverrides ||{};
                data.account.website.themeOverrides.styles = data.account.website.themeOverrides.styles || {};
                value.website = value.website || {};
                value.website.resources = value.website.resources || {};
                value.website.resources.userScripts = value.website.resources.userScripts || {};
                value.website.resources.userScripts.global = value.website.resources.userScripts.global || {};
                if(pageHolder[handle]) {
                    data.title = pageHolder[handle].title || value.website.title;
                } else {
                    data.title = value.website.title;
                }

                data.author = data.post.post_author;
                data.segmentIOWriteKey = segmentioConfig.SEGMENT_WRITE_KEY;
                data.website = value.website || {};
                if(pageHolder[handle] && pageHolder[handle].seo) {
                    data.seo = {
                        description: pageHolder[handle].seo.description || value.website.seo.description,
                        keywords: ''
                    };
                } else {
                    data.seo = {
                        description: value.website.seo.description,
                        keywords: ''
                    };
                }


                if (pageHolder[handle] && pageHolder[handle].seo && pageHolder[handle].seo.keywords && pageHolder[handle].seo.keywords.length) {
                    data.seo.keywords = _.pluck(pageHolder[handle].seo.keywords, "text").join(',');
                } else if (value.website.seo.keywords && value.website.seo.keywords.length) {
                    data.seo.keywords = _.pluck(value.website.seo.keywords, "text").join(',');
                }

                if (data.post) {

                    if (data.post.post_tags.length) {
                        var keywords = data.seo.keywords.split(',').slice(0);
                        keywords.unshift(data.post.post_tags);
                        data.seo.keywords = keywords.join(',');
                    }

                    if (data.post.featured_image && data.post.featured_image.indexOf('//') === 0) {
                        data.post.featured_image = 'https:' + data.post.featured_image;
                    }

                    var _host = self._req.host;

                    if(data.account.customDomain){
                        _host = data.account.customDomain
                    }

                    data.fullUrl = self._req.protocol + '://' + _host + self._req.originalUrl;    
                                       

                }

                data.includeSocial = true;

                if (!data.account.website.settings) {
                    self.log.warn('Website Settings is null for account ' + accountId);
                    data.account.website.settings = {};
                }
                var jsonldHolder = [];

                var url = self._req.originalUrl;
                var orgName = value.business.name;
                var logoUrl = value.business.logo;
                jsonldHolder.push(jsonldbuilder.buildForBlogPost(post, url, orgName, logoUrl));

                data.jsonld = JSON.stringify(jsonldHolder);
                app.render('blog', data, function (err, html) {
                    if (err) {
                        self.log.error('Error during render: ' + err);
                    }

                    self.resp.send(html);
                    self.cleanUp();
                    self.log.debug('<< renderBlogPost');
                    self = data = value = null;
                });
            }
        ], function done(err){
            self.log.error('Error in render:', err);
            app.render('404.html', {}, function(err, html){
                if(err) {
                    self.log.error('Error during render:', err);
                }
                self.resp.status(404).send(html);
            });
        });
    },

    renderCachedPage: function (accountId, handle) {
        var data = {},
            self = this;
        self.log.debug('>> renderCachedPage');

        async.waterfall([
            function getWebpageData(cb) {
                cmsDao.getDataForWebpage(accountId, 'index', function (err, value) {
                   if(err) {
                       self.log.error('Error getting data for website:', err);
                       cb(err);
                   } else {
                       cb(null, value);
                   }
                });
            },
            function getAllPages(webpageData, cb) {
                /*
                ssbManager.listPagesWithSections(accountId, webpageData.website._id, function(err, pages){
                    cb(err, webpageData, pages);
                });
                */

                ssbManager.listPublishedPages(accountId, webpageData.website._id, function(err, pages){
                    cb(err, webpageData, pages);
                });

            },
            function checkFor404(webpageData, pages, cb) {
                var pageHandle = handle || 'index';
                var foundPage = _.find(pages, function(page){
                    return page.get('handle') === pageHandle;
                });
                if(foundPage) {
                   cb(null, webpageData, pages);
                } else {
                    cb('Page [' + pageHandle + '] Not Found');
                }
            },
            function readComponents(webpageData, pages, cb) {
                data.templates = '';
                if(pages) {
                    data.templateIncludes = [];
                    data.templateIncludes[0] = {id:'/components/component-wrap.html'};
                    fs.readFile('public/components/component-wrap.html', 'utf8', function(err, html){
                        data.templateIncludes[0].data = html;
                        var components = [];
                        _.each(pages, function(page){
                            _.each(page.get('sections'), function(section){
                                if(section) {
                                    //self.log.debug('Page ' + page.get('handle'));
                                    //self.log.debug(' has components:', section.components);
                                    components = components.concat(section.components);
                                }
                            });
                        });
                        //self.log.debug('components:', components);
                        var map = {};
                        async.eachSeries(components, function(component, cb){
                            if(component) {
                                var obj = {};
                                obj.id = '/components/' + component.type + '_v' + component.version + '.html';
                                if(map[obj.id]) {
                                    cb(null);
                                } else {
                                    fs.readFile('public' + obj.id, 'utf8', function(err, html){
                                        obj.data = html;
                                        data.templateIncludes.push(obj);
                                        map[obj.id] = obj;
                                        cb();
                                    });
                                }
                            } else {
                                cb();
                            }

                        }, function done(err){
                            cb(null, webpageData, pages);
                        });


                    });
                } else {
                    cb('Could not find ' + handle);
                }

            },

            function addSSBSection(webpageData, pages, cb){
                var ssbSectionTemplate = {'id':'/admin/assets/js/ssb-site-builder/ssb-components/ssb-page-section/ssb-page-section.component.html'};
                fs.readFile('public/admin/assets/js/ssb-site-builder/ssb-components/ssb-page-section/ssb-page-section.component.html', 'utf8', function(err, html) {
                    ssbSectionTemplate.data = html;
                    data.templateIncludes.push(ssbSectionTemplate);
                    cb(null, webpageData, pages);
                });
            },

            function(value, pages, cb) {
                var pageHolder = {};
                _.each(pages, function(page){
                    pageHolder[page.get('handle')] = page.toJSON('frontend');
                });

                data.pages = pageHolder;
                data.account = value;
                data.canonicalUrl = pageHolder[handle].canonicalUrl || null;
                data.account.website.themeOverrides = data.account.website.themeOverrides ||{};
                data.account.website.themeOverrides.styles = data.account.website.themeOverrides.styles || {};
                value.website = value.website || {};
                if(pageHolder[handle]) {
                    data.title = pageHolder[handle].title || value.website.title;
                } else {
                    data.title = value.website.title;
                }

                data.author = 'Indigenous';//TODO: wut?
                data.segmentIOWriteKey = segmentioConfig.SEGMENT_WRITE_KEY;
                data.website = value.website || {};
                if(pageHolder[handle] && pageHolder[handle].seo) {
                    data.seo = {
                        description: pageHolder[handle].seo.description || value.website.seo.description,
                        keywords: ''
                    };
                } else {
                    data.seo = {
                        description: value.website.seo.description,
                        keywords: ''
                    };
                }


                if (pageHolder[handle] && pageHolder[handle].seo && pageHolder[handle].seo.keywords && pageHolder[handle].seo.keywords.length) {
                    data.seo.keywords = _.pluck(pageHolder[handle].seo.keywords,"text").join(",");
                } else if (value.website.seo.keywords && value.website.seo.keywords.length) {
                    data.seo.keywords = _.pluck(value.website.seo.keywords,"text").join(",");
                }


                data.og = {
                    type: 'website',
                    title: (pageHolder[handle] || {}).title || value.website.title,
                    image: value.website.settings.favicon
                };
                if (data.og.image && data.og.image.indexOf('//') === 0) {
                    data.og.image = 'http:' + data.og.image;
                }
                data.includeEditor = false;

                if (!data.account.website.settings) {
                    self.log.warn('Website Settings is null for account ' + accountId);
                    data.account.website.settings = {};
                }

                var blogUrlParts = [];
                if (self.req.params.length) {
                    blogUrlParts = self.req.params[0].split('/');
                }
                if (blogUrlParts.length == 2 && blogUrlParts[0] == 'blog') {
                    cmsDao.getBlogPostForWebsite(accountId, blogUrlParts[1], function (err, post) {
                        if (post) {
                            data.og.type = 'article';
                            data.og.title = post.attributes.post_title;
                            data.og.image = post.attributes.featured_image;
                            if (data.og.image && data.og.image.indexOf("//") === 0) {
                                data.og.image = "http:" + data.og.image;
                            }
                        }
                        app.render('index', data, function (err, html) {
                            if (err) {
                                self.log.error('Error during render: ' + err);
                            }

                            self.resp.send(html);
                            self.cleanUp();
                            self = data = value = null;
                        });
                    });
                } else {
                    app.render('index', data, function (err, html) {
                        if (err) {
                            self.log.error('Error during render: ' + err);
                        }

                        self.resp.send(html);
                        self.cleanUp();
                        self.log.debug('<< renderCachedPage');
                        self = data = value = null;
                    });
                }
            }

        ], function done(err){
            if(err) {
                self.log.error('Error during rendering:', err);
                app.render('404.html', {}, function(err, html){
                    if(err) {
                        self.log.error('Error during render:', err);
                    }
                    self.resp.status(404).send(html);
                });
            }
        });
    },

    _renderWebsite: function (accountId, path, cacheKey, isEditor) {
        var data = {},
            self = this;

        self.log.debug('Path: ' + path);

        cmsDao.getRenderedWebsitePageForAccount(accountId, path, isEditor, null, null, null, function (err, value) {
            if (err) {
                if (err.error && err.error.code && err.error.code == 404) {
                    self.resp.render('index.html');
                } else {
                    self.resp.render('index.html');
                }

                self.cleanUp();
                self = data = null;
                return;
            }

            if (isEditor !== true) {
                $$.g.cache.set(cacheKey, value, "websites");
            }

            self.resp.send(value);

            self.cleanUp();
            self = data = value = null;
        });
    },

    /**
     * Gets the start of an angular component div.  This returns an UNCLOSED div tag... because there might be extra
     * attributes needed (media, control, etc).
     * @param type
     */
    getDirectiveNameDivByType: function(type) {

        var lookup = {
            'blog': function(){return '<div blog-component media="changeBlogImage(blog, index)" control="blogControl"';},
            'blog-teaser': function(){return '<div blog-teaser-component';},
            'contact-us': function(){return '<div contact-us-component control="contactMap"';},
            'coming-soon': function(){return '<div coming-soon-component';},
            'feature-block': function(){return '<div feature-block-component';},
            'feature-list':function(){return '<div feature-list-component';},
            'footer': function(){return '<div footer-component';},
            'image-text': function(){return '<div image-text-component';},
            'image-gallery': function(){return '<div image-gallery-component media="addImageFromMedia(componentId, index, update)"';},
            'masthead': function(){return '<div masthead-component';},
            'meet-team': function(){return '<div meet-team-component media="addImageFromMedia(componentId, index, update)"';},
            'navigation': function(){return '<div navigation-component';},
            'products': function(){return '<div products-component';},
            'payment-form': function(){return '<div payment-form-component';},
            'pricing-tables': function(){return '<div pricing-tables-component';},
            'testimonials': function(){return '<div testimonials-component control="testimonialSlider"';},
            'thumbnail-slider': function(){return '<div thumbnail-slider-component media="addImageFromMedia(componentId, index, update)" control="thumbnailSlider"';},
            'text-only': function(){return '<div text-only-component';},
            'top-bar': function(){return '<div top-bar-component';},
            'simple-form': function(){return '<div simple-form-component';},
            'single-post': function(){return '<div single-post-component control="postControl"';},
            'social-link': function(){return '<div social-link-component';},
            'video': function(){return '<div video-component';},
            'email': function(){return '<div email-component';},
            'email-header':function(){return '<div email-component';},
            'email-1-col': function(){return '<div email-component';},
            'email-2-col': function(){return '<div email-component';},
            'email-3-col': function(){return '<div email-component';},
            'email-hr': function(){return '<div email-component';},
            'email-social': function(){return '<div email-component';},
            'email-footer': function(){return '<div email-component';}
        };
        if(typeof lookup[type] !== 'function') {
            console.log('ERROR: could not find matching directive for component.type =' + type);
            lookup['text-only']();
        }
        return lookup[type]();
    }
});

$$.v.BlogView = view;

module.exports = view;
