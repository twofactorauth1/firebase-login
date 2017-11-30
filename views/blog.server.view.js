/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014-2016
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var BaseView = require('./base.server.view');

var fs = require('fs');
var async = require('async');
var ssbManager = require('../ssb/ssb_manager');
var ngParser = require('../utils/ngparser');
var jsonldbuilder = require('../utils/jsonldbuilder');
var assetManager = require('../assets/asset_manager');
var cookies = require('../utils/cookieutil');
var externalScriptLookup = require('../configs/externalscriptlookup.config');
var _req;

var view = function (req, resp, options) {
    this._req = req;
    this.init.apply(this, arguments);
};

_.extend(view.prototype, BaseView.prototype, {

    log: $$.g.getLogger('blog.server.view'),


    renderBlogPage: function(accountId, twoColBlog) {
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
            function getPublishedPage(webpageData, cb) {
                ssbManager.getPublishedPage(accountId, webpageData.website._id, handle, function(err, page){
                    cb(err, webpageData, page);
                });
            },
            function getCustomFonts(webpageData, page, cb){
                assetManager.findByFontType(accountId, null, null, function(err, fonts){                
                    data.customFonts = self._renderCustomFonts(fonts);
                    cb(err, webpageData, page);
                });
            },
            function readComponents(webpageData, page, cb) {
                data.templates = '';
                if(twoColBlog && twoColBlog === true) {
                    //TODO: get the section from the blog-post page in allPages and replace in page
                }
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
                            cb(null, webpageData, page);
                        });


                    });
                } else {
                    cb('Could not find ' + handle);
                }

            },

            function addSSBSection(webpageData, page, cb){
                var ssbSectionTemplate = {'id':'/admin/assets/js/ssb-site-builder/ssb-components/ssb-page-section/ssb-page-section.component.html'};
                fs.readFile('public/admin/assets/js/ssb-site-builder/ssb-components/ssb-page-section/ssb-page-section.component.html', 'utf8', function(err, html) {
                    ssbSectionTemplate.data = '<div class="blog-list-section">'+html+'</div>';
                    data.templateIncludes.push(ssbSectionTemplate);
                    cb(null, webpageData, page);
                });
            },

            function getBlogPosts(webpageData, page, cb) {
                ssbManager.getPublishedPosts(accountId, null, null, function(err, posts){                
                    cb(err, webpageData, page, posts);
                });
            },

            function addBlogTemplate(webpageData, page, posts, cb) {
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
                                cb(null, webpageData, page, posts);
                            }
                        });
                    }
                });

            },

            function prepareForRender(value, page, posts, cb) {
                var pageHolder = {};
                pageHolder[page.get('handle')] = page.toJSON('frontend');

                data.page = page;
                data.posts = posts;
                data.account = value;
                data.canonicalUrl = pageHolder[handle].canonicalUrl || null;
                data.account.website.themeOverrides = data.account.website.themeOverrides ||{};
                data.account.website.themeOverrides.styles = data.account.website.themeOverrides.styles || {};
                value.website = value.website || {};
                value.website.resources = value.website.resources || {};
                value.website.resources.userScripts = value.website.resources.userScripts || {};
                value.website.resources.userScripts.global = value.website.resources.userScripts.global || {};

                data.userScripts = "";
                if(value.showhide && value.showhide.userScripts && value.website.resources.toggles && value.website.resources.toggles.userScripts){
                    value.website.resources.userScripts.global = value.website.resources.userScripts.global || {};
                    var userScripts = [];
                    if(value.website.resources.userScripts.global.sanitized){
                        userScripts.push(value.website.resources.userScripts.global.sanitized);
                    }
                    var _handle = "";
                    if(pageHolder[handle] && pageHolder[handle].handle){
                        _handle = pageHolder[handle].handle;
                        if(_handle == 'blog-list'){
                            _handle = 'blog';
                        }
                    }
                    if(_handle && value.website.resources.userScripts[_handle] && value.website.resources.userScripts[_handle].sanitized){
                        userScripts.push(value.website.resources.userScripts[_handle].sanitized);
                    }
                
                    if(userScripts.length){
                        data.userScripts = userScripts.join('\n');
                    }

                }
                
                data.customCss = "";
                value.website.resources.customCss = value.website.resources.customCss || {};
                
                if(value.showhide && value.showhide.customCss && value.website.resources.toggles && value.website.resources.toggles.customCss){
                    var customCss = [];

                    if(value.website.resources.customCss.global && value.website.resources.customCss.global.original){
                        customCss.push(value.website.resources.customCss.global.original);
                    }
                    if(pageHolder[handle] && pageHolder[handle].handle && value.website.resources.customCss[pageHolder[handle].handle] && value.website.resources.customCss[pageHolder[handle].handle].original){
                        customCss.push(value.website.resources.customCss[pageHolder[handle].handle].original);
                    }
                
                    if(customCss.length){
                        data.customCss = customCss.join('\n');
                    }
                }
                data.externalScripts = self._loadExternalScripts(page);
                data.pageStyles = self._getPageStyles(page);
                if(pageHolder[handle]) {
                    data.title = pageHolder[handle].title || value.website.title;
                } else {
                    data.title = value.website.title;
                }

                data.author = 'Indigenous';//TODO: wut?
                data.segmentIOWriteKey = '';
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

                if(!data.account.orgId) {
                    data.account.orgId = 0;
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
                    ssbSectionTemplate.data = "";
                    data.templateIncludes.push(ssbSectionTemplate);
                    cb(null, webpageData, allPages, page);
                });
            },

            function getBlogPosts(webpageData, allPages, page, cb) {

                ssbManager.getPublishedPosts(accountId, null, null, function(err, posts){
                    
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

                website.resources.toggles && website.resources.toggles.userScripts

                data.pages = pageHolder;
                data.account = value;
                data.canonicalUrl = pageHolder[handle].canonicalUrl || null;
                data.account.website.themeOverrides = data.account.website.themeOverrides ||{};
                data.account.website.themeOverrides.styles = data.account.website.themeOverrides.styles || {};
                value.website = value.website || {};
                value.website.resources = value.website.resources || {};
                value.website.resources.userScripts = value.website.resources.userScripts || {};
                value.website.resources.userScripts.global = value.website.resources.userScripts.global || {};
                data.userScripts = "";
                if(value.showhide && value.showhide.userScripts && value.website.resources.toggles && value.website.resources.toggles.userScripts){
                    value.website.resources.userScripts.global = value.website.resources.userScripts.global || {};
                    var userScripts = [];
                    if(value.website.resources.userScripts.global.sanitized){
                        userScripts.push(value.website.resources.userScripts.global.sanitized);
                    }
                    var _handle = "";
                    if(pageHolder[handle] && pageHolder[handle].handle){
                        _handle = pageHolder[handle].handle;
                        if(_handle == 'blog-list'){
                            _handle = 'blog';
                        }
                    }
                    if(_handle && value.website.resources.userScripts[_handle] && value.website.resources.userScripts[_handle].sanitized){
                        userScripts.push(value.website.resources.userScripts[_handle].sanitized);
                    }
                
                    if(userScripts.length){
                        data.userScripts = userScripts.join('\n');
                    }

                }
                data.customCss = "";
                value.website.resources.customCss = value.website.resources.customCss || {};

                if(value.showhide && value.showhide.customCss && value.website.resources.toggles && value.website.resources.toggles.customCss){
                    var customCss = [];

                    if(value.website.resources.customCss.global && value.website.resources.customCss.global.original){
                        customCss.push(value.website.resources.customCss.global.original);
                    }
                    if(pageHolder[handle] && pageHolder[handle].handle && value.website.resources.customCss[pageHolder[handle].handle] && value.website.resources.customCss[pageHolder[handle].handle].original){
                        customCss.push(value.website.resources.customCss[pageHolder[handle].handle].original);
                    }
                
                    if(customCss.length){
                        data.customCss = customCss.join('\n');
                    }
                }
                data.externalScripts = self._loadExternalScripts(page);
                data.pageStyles = self._getPageStyles(page);
                if(pageHolder[handle]) {
                    data.title = pageHolder[handle].title || value.website.title;
                } else {
                    data.title = value.website.title;
                }

                data.author = 'Indigenous';//TODO: wut?
                data.segmentIOWriteKey = '';
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
            function getPublishedPage(webpageData, cb) {
                ssbManager.getPublishedPage(accountId, webpageData.website._id, handle, function(err, page){
                    if(page) {
                        cb(err, webpageData, page);
                    } else {
                        cb(err || 'Page not found');
                    }

                });
            },
            function checkForAuth(webpageData, page, cb) {
                if(page.get('secure') !== true) {
                    cb(null, webpageData, page);
                } else {
                    //need to check for auth
                    if(page.get('restriction') === $$.m.ssb.Page.restrictionTypes.RESTRICTION_ORGWIDE) {
                        /*
                         * check that the user is authenticated
                         * check that the account to which the user is authenticated shares an ORG with this page
                         */
                        if (self.req.isAuthenticated() && self.req.session.orgId === webpageData.orgId) {
                            //we are golden
                            self.log.info('Authenticated!');
                            cb(null, webpageData, page);
                        } else {
                            //return 401

                            cookies.setRedirectUrl(self.req, self.resp);
                            self.log.debug('Redirecting to /login');
                            return self.resp.redirect("/login?redirectTo=" + handle);

                        }
                    } else {
                        cb('Restricted page with no supported restricted type');
                    }
                }
            },
            function getCustomFonts(webpageData, page, cb){
                assetManager.findByFontType(accountId, null, null, function(err, fonts){                
                    data.customFonts = self._renderCustomFonts(fonts);
                    cb(err, webpageData, page);
                });
            },
            function readComponents(webpageData, page, cb) {
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
                            cb(null, webpageData, page);
                        });


                    });
                } else {
                    cb('Could not find ' + handle);
                }

            },

            function addSSBSection(webpageData, page, cb){
                var ssbSectionTemplate = {'id':'/admin/assets/js/ssb-site-builder/ssb-components/ssb-page-section/ssb-page-section.component.html'};
                fs.readFile('public/admin/assets/js/ssb-site-builder/ssb-components/ssb-page-section/ssb-page-section.component.html', 'utf8', function(err, html) {
                    ssbSectionTemplate.data = html;
                    data.templateIncludes.push(ssbSectionTemplate);
                    cb(null, webpageData, page);
                });
            },

            function getBlogPost(webpageData, page, cb) {
                ssbManager.getPublishedPost(accountId, postName, function(err, post){
                    if (!post) {
                        cb('Could not find post with handle: ' + postName);
                    } else {
                        cb(err, webpageData, page, post);
                    }
                });
            },

            function addBlogTemplate(webpageData, page, post, cb) {
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

                cb(null, webpageData, page, post);

            },

            function prepareForRender(value, page, post, cb) {
                var pageHolder = {};
                pageHolder[page.get('handle')] = page.toJSON('frontend');

                data.page = page;
                data.post = post.toJSON('frontend');
                data.account = value;
                data.canonicalUrl = pageHolder[handle].canonicalUrl || null;
                data.account.website.themeOverrides = data.account.website.themeOverrides ||{};
                data.account.website.themeOverrides.styles = data.account.website.themeOverrides.styles || {};
                value.website = value.website || {};
                value.website.resources = value.website.resources || {};
                value.website.resources.userScripts = value.website.resources.userScripts || {};
                value.website.resources.userScripts.global = value.website.resources.userScripts.global || {};
                
                data.userScripts = "";
                if(value.showhide && value.showhide.userScripts && value.website.resources.toggles && value.website.resources.toggles.userScripts){
                    value.website.resources.userScripts.global = value.website.resources.userScripts.global || {};
                    var userScripts = [];
                    if(value.website.resources.userScripts.global.sanitized){
                        userScripts.push(value.website.resources.userScripts.global.sanitized);
                    }
                    var _handle = "";
                    if(pageHolder[handle] && pageHolder[handle].handle){
                        _handle = pageHolder[handle].handle;
                        if(_handle == 'blog-list'){
                            _handle = 'blog';
                        }
                    }
                    if(_handle && value.website.resources.userScripts[_handle] && value.website.resources.userScripts[_handle].sanitized){
                        userScripts.push(value.website.resources.userScripts[_handle].sanitized);
                    }
                
                    if(userScripts.length){
                        data.userScripts = userScripts.join('\n');
                    }

                }
                data.customCss = "";
                value.website.resources.customCss = value.website.resources.customCss || {};

                if(value.showhide && value.showhide.customCss && value.website.resources.toggles && value.website.resources.toggles.customCss){
                    var customCss = [];

                    if(value.website.resources.customCss.global && value.website.resources.customCss.global.original){
                        customCss.push(value.website.resources.customCss.global.original);
                    }
                    if(pageHolder[handle] && pageHolder[handle].handle && value.website.resources.customCss[pageHolder[handle].handle] && value.website.resources.customCss[pageHolder[handle].handle].original){
                        customCss.push(value.website.resources.customCss[pageHolder[handle].handle].original);
                    }
                
                    if(customCss.length){
                        data.customCss = customCss.join('\n');
                    }
                }
                data.externalScripts = self._loadExternalScripts(page);
                data.pageStyles = self._getPageStyles(page);
                if(pageHolder[handle]) {
                    data.title = pageHolder[handle].title || value.website.title;
                } else {
                    data.title = value.website.title;
                }

                data.author = data.post.post_author;
                data.segmentIOWriteKey = '';
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
                
                if(!data.account.orgId) {
                    data.account.orgId = 0;
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

    _renderCustomFonts: function(fonts){
        var _styleFonts = "";
        if(fonts && fonts.length){
            _styleFonts = "<style>";
           _.each(fonts, function(font){

                var _family = font.get("filename").substring(0, font.get("filename").indexOf('.')).replace(/ /g, "_");
                _styleFonts += '@font-face { ' +
                    'font-family: "' + _family + '"; ' +                
                    'src: url("https:' + font.get("url") + '"); ' +
                '} \n'
            })
            _styleFonts += '</style>';
        }
        return _styleFonts;        
    },

    _loadExternalScripts: function(page, preview){
        var _types = _.uniq(_.pluck(_.flatten(_.pluck(page.get("sections"), 'components')), 'type'))
        var scriptList = [];
        var externalScripts = "";
        _types.forEach(function (c) {
            for (var k in externalScriptLookup.EXTERNAL_SCRIPT_LOOKUP) {
                if ((externalScriptLookup.EXTERNAL_SCRIPT_LOOKUP[k].indexOf(c) > -1) && (scriptList.indexOf(k) === -1)) {
                    scriptList.push(k);
                    externalScripts += '\n' + k;
                }
            }
        });
        return externalScripts;
    },

    _getPageStyles: function(page){
        return page.get("styles");
    }
});

$$.v.BlogView = view;

module.exports = view;
