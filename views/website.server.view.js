/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var BaseView = require('./base.server.view');

var cmsDao = require('../cms/dao/cms.dao.js');
var fs = require('fs');
var async = require('async');
var ssbManager = require('../ssb/ssb_manager');
var analyticsManager = require('../analytics/analytics_manager');
var assetManager = require('../assets/asset_manager');
var cookies = require('../utils/cookieutil');
var externalScriptLookup = require('../configs/externalscriptlookup.config');
var pageCacheManager = require('../cms/pagecache_manager');
var view = function (req, resp, options) {
    this.init.apply(this, arguments);
};

_.extend(view.prototype, BaseView.prototype, {

    log: $$.g.getLogger('website.server.view'),

    show: function (accountId) {
        this._show(accountId, "index");
    },
    showTempPage: function (accountId) {
        this._show(accountId, "index_temp_page");
    },

    showPage: function (accountId, page) {
        this._show(accountId, page);
    },

    _show: function (accountId, path) {
        var self = this;

        var cacheKey = "web-" + accountId + "-" + path;
        if (this.req.query.editor == "true") {
            self._renderWebsite(accountId, path, cacheKey, true);
            return;
        }

        $$.g.cache.get(cacheKey, "websites", function (err, value) {
            if (!err && value) {
                self.resp.send(value);

                self.cleanUp();
                value = null;
            } else {
                self._renderWebsite(accountId, path, cacheKey);
            }
        });
    },

    renderNewIndex: function (accountId) {
        var data = {},
            self = this;
        self.log.debug('>> renderNewIndex');
        /*
         var data = {
         settings: settings,
         seo: seo,
         footer: footer,
         title: title,
         segmentIOWriteKey: segmentioConfig.SEGMENT_WRITE_KEY,
         handle: pageName,
         linkLists: {},
         blogposts: null,
         tags: null,
         categories: null,
         accountUrl: account.get('accountUrl'),
         account: account
         };
         */
        var isEditor = self.req.query.editor;
        self.log.debug('isEditor: ', isEditor);
        cmsDao.getDataForWebpage(accountId, 'index', function (err, value) {
            data.account = value;
            value.website = value.website || {};
            data.title = value.website.title;
            data.author = 'Indigenous';
            data.segmentIOWriteKey = '';
            data.website = value.website || {};
            data.seo = {
                description: '',
                keywords: ''
            };
            data.og = {
                type: 'website',
                title: value.website.title
            };
            if(value.website.settings && value.website.settings.favicon) {
                data.og.image = value.website.settings.favicon
            }
            if (data.og.image && data.og.image.indexOf('//') === 0) {
                data.og.image = 'http:' + data.og.image;
            }
            data.includeEditor = isEditor;
            //self.log.debug('>> data');
            //console.dir(data);
            //self.log.debug('<< data');
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
                    self = data = value = null;
                });
            }
        });


        //self.resp.send(value);
    },

    renderPreviewPage: function(accountId, pageId) {

        var self = this;
        var data = {};
        var handle = '';
        self.log.debug('>> renderPreviewPage');
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
            function getPage(webpageData, cb) {
                ssbManager.getPageByVersion(accountId, pageId, function(err, page){
                    if(err || !page) {
                        self.log.error('Error getting page by version:', err);
                        cb(err);
                    } else {
                        handle = page.get('handle');
                        cb(null, webpageData, page);
                    }
                });
            },
            function getCustomFonts(webpageData, page, cb){
                assetManager.findByFontType(accountId, null, null, function(err, fonts){
                    data.customFonts = self._renderCustomFonts(fonts);
                    cb(null, webpageData, page);
                });
            },

            function(value, page, cb) {
                var pageHolder = {};
                pageHolder['/preview/' + pageId ] = page.toJSON('frontend');

                data.page = pageHolder;
                data.loadYoutubeLib = true;
                data.account = value;

                if(!data.account.orgId) {
                    data.account.orgId = 0;
                }

                value.website = value.website || {};
                data.account.website.themeOverrides = data.account.website.themeOverrides ||{};
                data.account.website.themeOverrides.styles = data.account.website.themeOverrides.styles || {};

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
                    if(page.get('handle')){
                        _handle = page.get('handle');
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
                    if(page.get('handle') && value.website.resources.customCss[page.get('handle')] && value.website.resources.customCss[page.get('handle')].original){
                        customCss.push(value.website.resources.customCss[page.get('handle')].original);
                    }

                    if(customCss.length){
                        data.customCss = customCss.join('\n');
                    }
                }
                data.externalScripts = self._loadExternalScripts(page, true);
                var components = [];
                data.pageStyles = self._getPageStyles(page);
                if(pageHolder[handle]) {
                    data.title = pageHolder[handle].title || value.website.title;
                } else {
                    data.title = value.website.title;
                }
                data.currentPageHandle = handle;
                data.author = 'Indigenous';//TODO: wut?
                data.segmentIOWriteKey = '';
                data.website = value.website || {};
                if(pageHolder[handle] && pageHolder[handle].seo) {
                    data.seo = {
                        description: pageHolder[handle].seo.description || value.website.seo.description,
                        keywords: ''
                    };
                } else {
                    if(value && value.website && value.website.seo) {
                        data.seo = {
                            description: value.website.seo.description,
                            keywords: ''
                        };
                    } else {
                        data.seo = {
                            description: '',
                            keywords: ''
                        };
                    }

                }


                if (pageHolder[handle] && pageHolder[handle].seo && pageHolder[handle].seo.keywords && pageHolder[handle].seo.keywords.length) {
                    data.seo.keywords = _.pluck(pageHolder[handle].seo.keywords,"text").join(",");
                } else if (value.website.seo && value.website.seo.keywords && value.website.seo.keywords.length) {
                    data.seo.keywords = _.pluck(value.website.seo.keywords,"text").join(",");
                }


                data.og = {
                    type: 'website',
                    title: (pageHolder[handle] || {}).title || value.website.title
                };
                if(value.website.settings && value.website.settings.favicon) {
                    data.og.image = value.website.settings.favicon
                }
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
                            cb();
                        });
                    });
                } else {
                    app.render('index', data, function (err, html) {
                        if (err) {
                            self.log.error('Error during render: ' + err);
                        }
                        self.resp.send(html);
                        self.cleanUp();
                        self.log.debug('<< renderPreviewPage');
                        self = data = value = null;
                        cb();
                    });
                }
            }
        ], function(err){
            if(err) {
                self.log.error('Error during rendering:', err);
                app.render('404', {}, function(err, html){
                    self.resp.send(html);
                });
            }
        });

    },
    renderWebsitePage: function (accountId, handle) {

        var data = {},
            self = this;
        self.log.debug('>> renderWebsitePage', handle);
        handle = handle.trim();
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
            function getPublishedPage(webpageData, cb) {
                ssbManager.getPublishedPage(accountId, webpageData.website._id, handle, function(err, page){
                    //console.log(pages);
                    cb(err, webpageData, page);
                });
            },
            function checkFor404(webpageData, page, cb) {
                var pageHandle = handle || 'index';

                if(page) {
                   cb(null, webpageData, page);
                } else {
                    self.log.warn('Page [' + pageHandle + '] Not Found');
                    cb('Page [' + pageHandle + '] Not Found');
                }
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
                            cb(null, webpageData, page);
                        } else {
                            //return 401

                            cookies.setRedirectUrl(self.req, self.resp, handle);
                            self.log.debug('Redirecting to /login');
                            return self.resp.redirect("/login?redirectTo=" + handle);

                        }
                    } else {
                        cb('Restricted page with no supported restricted type');
                    }
                }
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
                            if(section && section.layoutModifiers && section.layoutModifiers.custom) {
                                components.push({
                                    id: '/admin/assets/js/ssb-site-builder/ssb-components/ssb-' + section.layout + '/ssb-' + section.layout + '.layout.v' + section.version + '.html',
                                    type: 'ssb-section-template'
                                })
                            }
                        });

                        components.push({
                            'id':'/admin/assets/js/ssb-site-builder/ssb-components/ssb-page-section/ssb-page-section-template.component.html',
                            type: 'ssb-section-template'
                        });

                        if(_.contains(_.pluck(components, "type"), 'navigation')){
                            components.push({
                                type: 'shared-navigation-component-link'
                            },
                            {
                                type: 'shared-navigation-component-style'
                            })
                        }
                        var map = {};
                        async.eachSeries(components, function(component, _cb){
                            if(component) {
                                var obj = {};
                                if(component.type === 'ssb-section-template'){
                                    obj.id = component.id;
                                }
                                else if(component.type === 'shared-navigation-component-link'){
                                    obj.id = '/admin/assets/js/ssb-site-builder/ssb-components/shared/link_2.html';
                                }
                                else if(component.type === 'shared-navigation-component-style'){
                                    obj.id = '/admin/assets/js/ssb-site-builder/ssb-components/shared/navigation_style.html';
                                }
                                else if(component.type && component.type.indexOf('ssb-') === 0 ){
                                    obj.id = '/admin/assets/js/ssb-site-builder/ssb-components/' + component.type + '/' + component.type + '.component.html';
                                }
                                else
                                    obj.id = '/components/' + component.type + '_v' + component.version + '.html';
                                if(map[obj.id]) {
                                    _cb(null);
                                } else {
                                    fs.readFile('public' + obj.id, 'utf8', function(err, html){
                                        obj.data = html;
                                        data.templateIncludes.push(obj);
                                        map[obj.id] = obj;
                                        _cb();
                                    });
                                }
                            } else {
                                _cb();
                            }
                        }, function done(err){
                            cb(null, webpageData, page);
                        });

                    });
                } else {
                    cb('Could not find ' + handle);
                }
            },
            function getPageTemplate(webpageData, page, cb) {
                var pageTemplate = {'id':'template.html'};
                // if(page.get('manifest') && page.get('manifest').template) {
                //     pageTemplate.data = page.get('manifest').template;
                //     data.templateIncludes.push(pageTemplate);
                //     cb(null, webpageData, page);
                // } else {
                    //TODO:
                    pageCacheManager.buildTemplateFromPage(page, true, function(err, templateData){
                        pageTemplate.data = templateData;
                        data.templateIncludes.push(pageTemplate);
                        cb(null, webpageData, page);
                    });
                //}
            },
            function buildPageStyles(webpageData, page, cb){
                pageCacheManager.buildPageStyles(page, function(err, updatedPage){
                    cb(null, webpageData, updatedPage);
                });
            },
            function getBlogPosts(webpageData, page, cb) {
                var pageHandle = handle || 'index';

                var componentTypes = _.pluck(_.flatten(_.pluck(page.get("sections"), "components")), "type");

                var _blogComponents = _.contains(componentTypes, "ssb-blog-post-list") || _.contains(componentTypes, "ssb-recent-post")
                || _.contains(componentTypes, "ssb-recent-tag") || _.contains(componentTypes, "ssb-recent-category");

                if(_blogComponents){
                    ssbManager.getPublishedPosts(accountId, null, null, function(err, posts){
                        data.posts = posts;
                        cb(null, webpageData, page);
                    });
                }
                else{
                    cb(null, webpageData, page);
                }
            },
            function getCustomFonts(webpageData, page, cb){
                assetManager.findByFontType(accountId, null, null, function(err, fonts){
                    data.customFonts = self._renderCustomFonts(fonts);
                    cb(null, webpageData, page);
                });
            },
            function(value, page, cb) {
                var pageHolder = {};
                pageHolder[page.get('handle')] = page.toJSON('frontend');

                data.page = page;
                data.account = value;
                data.loadYoutubeLib = ssbManager._checkForYoutube(page.get('sections'));

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
                if(value.showhide && value.showhide.newAnalytics) {
                    value.newAnalytics = (value.showhide.newAnalytics===true);
                } else {
                    value.newAnalytics = false;
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

                data.currentPageHandle = handle;

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
                    title: (pageHolder[handle] || {}).title || value.website.title
                };
                if(value.website.settings && value.website.settings.favicon) {
                    data.og.image = value.website.settings.favicon
                }
                if (data.og.image && data.og.image.indexOf('//') === 0) {
                    data.og.image = 'http:' + data.og.image;
                }
                data.includeEditor = false;

                if (!data.account.website.settings) {
                    self.log.warn('Website Settings is null for account ' + accountId);
                    data.account.website.settings = {};
                }

                if(!data.account.orgId) {
                    data.account.orgId = 0;
                }
                var websiteFonts = "";
                if(value.website && value.website.themeOverrides && value.website.themeOverrides.styles && value.website.themeOverrides.styles.fontFamily){
                    websiteFonts = value.website.themeOverrides.styles.fontFamily.trim().replace('\'', '').replace('\'', '').replace('"', '').replace('"','').split(",")[0];
                }

                if((pageHolder[handle] && pageHolder[handle].manifest) || websiteFonts) {
                    var fonts = {};
                    if(pageHolder[handle] && pageHolder[handle].manifest && pageHolder[handle].manifest.fonts){
                        fonts = pageHolder[handle].manifest.fonts;
                    }
                    if(websiteFonts){
                        fonts.websiteFonts = websiteFonts;
                    }
                    var usedFamilies = [];
                    var googleFamilies = ['Roboto:200,400,700', 'Roboto Condensed:200,400,700', 'Roboto Slab:200,400,700', 'Oswald:200,400,700', 'Montserrat:200,400,700', 'Droid Serif:200,400,700', 'Open Sans:200,400,700', 'Open Sans Condensed:200,400,700', 'Lato:200,400,700', 'Raleway:200,400,700', 'Quicksand:200,400,700', 'Ubuntu:200,400,700', 'Merriweather:200,400,700', 'Quattrocento:200,400,700', 'Lora:200,400,700', 'Playfair Display:200,400,700', 'Pacifico:200,400,700', 'Satisfy:200,400,700', 'Parisienne:200,400,700', 'Petit Formal Script:200,400,700', 'Indie Flower:200,400,700', 'Shadows Into Light Two:200,400,700', 'Amatic SC:200,400,700', 'Neucha:200,400,700', 'Schoolbell:200,400,700', 'Itim:200,400,700', 'Patrick Hand SC:200,400,700', 'Delius Swash Caps:200,400,700', 'PT Sans:200,400,700', 'Nunito:200,400,700', 'Titillium Web:200,400,700', 'Source Sans Pro:200,400,700', 'Cinzel:200,400,700' ];
                    _.each(fonts, function(fontName){
                        usedFamilies.push(fontName + ':200,400,700');
                    });
                    self.log.debug('usedFamilies:', usedFamilies);
                    //TODO: need to handle NO fonts.
                    data.account.fonts = _.intersection(googleFamilies, usedFamilies).join('|');
                    if(data.account.fonts === '') {
                        data.account.fonts = 'NA';
                    }
                    self.log.debug('data.account.fonts:', data.account.fonts);
                }

                var blogUrlParts = [];
                if (self.req.params.length && self.req.params[0]!=undefined) {
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

                    //self.log.debug('before resp:', self.resp);

                    app.render('index', data, function (err, html) {
                        if (err) {
                            self.log.error('Error during render: ' + err);
                        }
                        //self.log.debug('after resp:', self.resp);
                        self.resp.send(html);
                        //self.cleanUp();
                        self.log.debug('<< renderWebsitePage');
                        if(!page.get('manifest')) {

                            var websiteId = value.website._id;
                            ssbManager.buildPageManifest(accountId, null, websiteId, handle, function(err, value){
                                self.log.debug('built manifest:', value);
                                page.set('manifest', value);
                                ssbManager._savePublishedPage(page, function(err, value){});
                            });
                        }
                        //self = data = value = null;
                    });
                }
            }

        ], function done(err){
            if(err) {
                self.log.error('Error during rendering:', err);
                //can we get a session id here?
                var sessionCookie = $$.u.cookies.getCookie(self.req, 'session_cookie');
                var sessionId = $$.u.idutils.generateUUID();
                if(sessionCookie) {
                    try {
                        sessionCookie = JSON.parse(sessionCookie);
                        sessionId = sessionCookie.id;
                    } catch(e){

                    }

                }
                var pageProperties = {
                    url: {
                        source: self.req.protocol + '://' + self.req.host + '/404',
                        protocol: self.req.protocol,
                        domain: self.req.host,
                        port: '',
                        path: '/404',
                        anchor: ''
                    },
                    requestedUrl:{
                        source: self.req.protocol + '://' + self.req.host + self.req.url,
                        protocol: self.req.protocol,
                        domain: self.req.host,
                        port: '',
                        path: self.req.path,
                        anchor: ''
                    },
                    pageActions: [],
                    start_time: new Date().getTime(),
                    end_time: 0,
                    session_id: sessionId,
                    entrance: false
                };

                var pageEvent = new $$.m.PageEvent(pageProperties);
                pageEvent.set('server_time', new Date().getTime());
                pageEvent.set('server_time_dt', new Date());

                pageEvent.set('accountId', accountId);
                analyticsManager.storePageEvent(pageEvent, function(err){});
                app.render('404.html', {}, function(err, html){
                    if(err) {
                        self.log.error('Error during render:', err);
                    }
                    self.resp.status(404).send(html);
                });
            }
        });
    },

    renderActivateSetupPage: function (originalAccount, accountId, handle) {

        var data = {},
            self = this;
        self.log.debug('>> renderActivateSetupPage', handle);
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
            function getAccountPages(webpageData, cb) {
                if(handle === 'activate/setup') {
                    ssbManager.listActivateAccountPage(accountId, webpageData.website._id, function(err, page){
                        cb(err, webpageData, page);
                    });
                } else if(handle === 'index') {

                    ssbManager.getPublishedPage(accountId, webpageData.website._id, 'splash', function(err, page){
                        if(page) {
                            page.set('handle', 'index');
                            _.each(page.get('sections'), function(section){
                                if (section.global && section.hiddenOnPages) {
                                    if(section.hiddenOnPages['splash']) {
                                        section.hiddenOnPages['index'] = section.hiddenOnPages['splash'];
                                    }
                                }
                            });
                        }
                        cb(err, webpageData, page);
                    });
                } else {
                    if(originalAccount.get("oem") === true){
                        ssbManager.getPublishedPage(accountId, webpageData.website._id, 'oem-landing', function(err, page){
                            if(page) {
                                page.set('handle', 'activate');
                                _.each(page.get('sections'), function(section){
                                    if (section.global && section.hiddenOnPages) {
                                        if(section.hiddenOnPages['oem-landing']) {
                                            section.hiddenOnPages['activate'] = section.hiddenOnPages['oem-landing'];
                                        }
                                    }
                                });
                            }
                            cb(err, webpageData, page);
                        });
                    }
                    else{
                        ssbManager.getPublishedPage(accountId, webpageData.website._id, 'var-landing', function(err, page){
                            if(page) {
                                page.set('handle', 'activate');
                                _.each(page.get('sections'), function(section){
                                    if (section.global && section.hiddenOnPages) {
                                        if(section.hiddenOnPages['var-landing']) {
                                            section.hiddenOnPages['activate'] = section.hiddenOnPages['var-landing'];
                                        }
                                    }
                                });
                            }
                            cb(err, webpageData, page);
                        });
                    }
                }

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
                        //self.log.debug('components:', components);
                        var map = {};
                        async.eachSeries(components, function(component, _cb){
                            if(component) {
                                var obj = {};
                                obj.id = '/components/' + component.type + '_v' + component.version + '.html';

                                if(map[obj.id]) {
                                    _cb(null);
                                } else {
                                    fs.readFile('public' + obj.id, 'utf8', function(err, html){
                                        obj.data = html;
                                        data.templateIncludes.push(obj);
                                        map[obj.id] = obj;
                                        _cb();
                                    });
                                }
                            } else {
                                _cb();
                            }

                        }, function done(err){
                            cb(null, webpageData, page);
                        });


                    });
                } else {
                    cb('Could not find ' + handle);
                }

            },

            function getPageTemplate(webpageData, page, cb) {
                //var pageCacheManager = require('../cms/pagecache_manager');
                var pageTemplate = {'id':'template.html'};
                pageCacheManager.buildTemplateFromPage(page, true, function(err, templateData){
                    pageTemplate.data = templateData;
                    data.templateIncludes.push(pageTemplate);
                    cb(null, webpageData, page);
                });
            },

            function buildPageStyles(webpageData, page, cb){
                pageCacheManager.buildPageStyles(page, function(err, updatedPage){
                    cb(null, webpageData, updatedPage);
                });
            },

            function(value, page, cb) {
                var pageHolder = {};

                pageHolder[page.get('handle')] = page.toJSON('frontend');
                data.page = page;
                data.account = value;
                data.originalAccountBusiness = originalAccount.get('business');
                data.loadYoutubeLib = ssbManager._checkForYoutube(page.get('sections'));
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
                if(value.showhide && value.showhide.newAnalytics) {
                    value.newAnalytics = (value.showhide.newAnalytics===true);
                } else {
                    value.newAnalytics = false;
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

                data.currentPageHandle = handle;

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
                    title: (pageHolder[handle] || {}).title || value.website.title
                };
                if(value.website.settings && value.website.settings.favicon) {
                    data.og.image = value.website.settings.favicon
                }
                if (data.og.image && data.og.image.indexOf('//') === 0) {
                    data.og.image = 'http:' + data.og.image;
                }

                app.render('index', data, function (err, html) {
                    if (err) {
                        self.log.error('Error during render: ' + err);
                    }

                    self.resp.send(html);
                    self.cleanUp();
                    self.log.debug('<< renderActivateSetupPage');
                    self = data = value = null;
                });
            }

        ], function done(err){
            if(err) {
                self.log.error('Error during rendering:', err);
                //can we get a session id here?
                var sessionCookie = $$.u.cookies.getCookie(self.req, 'session_cookie');
                var sessionId = $$.u.idutils.generateUUID();
                if(sessionCookie) {
                    try {
                        sessionCookie = JSON.parse(sessionCookie);
                        sessionId = sessionCookie.id;
                    } catch(e){

                    }

                }
                var pageProperties = {
                    url: {
                        source: self.req.protocol + '://' + self.req.host + '/404',
                        protocol: self.req.protocol,
                        domain: self.req.host,
                        port: '',
                        path: '/404',
                        anchor: ''
                    },
                    requestedUrl:{
                        source: self.req.protocol + '://' + self.req.host + self.req.url,
                        protocol: self.req.protocol,
                        domain: self.req.host,
                        port: '',
                        path: self.req.path,
                        anchor: ''
                    },
                    pageActions: [],
                    start_time: new Date().getTime(),
                    end_time: 0,
                    session_id: sessionId,
                    entrance: false
                };

                var pageEvent = new $$.m.PageEvent(pageProperties);
                pageEvent.set('server_time', new Date().getTime());
                pageEvent.set('server_time_dt', new Date());

                pageEvent.set('accountId', accountId);
                analyticsManager.storePageEvent(pageEvent, function(err){});
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
        var _types = [];
        if(preview){
            _.each(page.get("sections"), function(section){
                _types.push(_.uniq(_.pluck(section.get("components"), "type")));
            })
            _types = _.uniq(_.flatten(_types));
        }
        else{
            _types =  _.uniq(_.pluck(_.flatten(_.pluck(page.get("sections"), 'components')), 'type'))
        }
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

$$.v.WebsiteView = view;

module.exports = view;
