/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2015
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var s3dao = require('../dao/integrations/s3.dao');
var COMPILED_PAGE_BUCKET = 'indigenous-account-websites';
var knox = require('knox');
var s3config = require('../configs/aws.config');
var fs = require('fs');
var appConfig = require('../configs/app.config');
var async = require('async');
var cmsDao = require('../cms/dao/cms.dao');
var pageDao = require('../ssb/dao/page.dao');
//var ssbManager = require('../ssb/ssb_manager');

var s3Client = knox.createClient({
    key:s3config.AWS_ACCESS_KEY,
    secret: s3config.AWS_SECRET_ACCESS_KEY,
    bucket: COMPILED_PAGE_BUCKET
});

module.exports = {
    log: $$.g.getLogger("pagecache_manager"),

    cachePage: function() {

    },

    getLocalCachedPageForTesting: function(accountId, pageName, resp) {
        var self = this;
        fs.readFile('./test/' + pageName, 'utf-8', function(err, html){
            if(err) {
                self.log.error("Error getting file:", err);
                resp.send("<p>Error</p>");

            } else {
                resp.send(html);
            }
        });
    },

    getOrCreateLocalTemplate: function(accountId, pageName, resp) {
        var self = this;
        /*
         * check for the template.  If it exists, return it.
         * If it doesn't exist, create it.  Save it.  Return it.
         */
        var environmentName = 'prod';
        if(appConfig.nonProduction === true) {
            environmentName = 'test';
        }
        var path = './test/' + environmentName + '/account_' + accountId + '/' + pageName;
        fs.access(path, fs.R_OK, function(err){
            if(!err) {
                fs.readFile(path, 'utf-8', function(err, html){
                    if(err) {
                        self.log.error("Error getting file:", err);
                        resp.send("<p>Error</p>");

                    } else {
                        resp.send(html);
                    }
                });
            } else {
                /*
                 * 1. get the page.
                 * 2. create the template
                 * 3. save it
                 * 4. return it
                 */
                var html = '';
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
                        cmsDao.getLatestPageForWebsite(webpageData.website._id, pageName, accountId, function(err, page){
                            if(err) {
                                self.log.error('Error getting latest page for website:', err);
                                cb(err);
                            } else {
                                cb(null, webpageData, page);
                            }
                        });
                    },
                    function getFallbackPageIfNeeded(webpageData, page, cb) {
                        if(page) {
                            cb(null, webpageData, page);
                        } else {
                            self.log.debug('Looking for coming-soon page');
                            cmsDao.getLatestPageForWebsite(webpageData.website._id, 'coming-soon', accountId, function(err, page){
                                if(err) {
                                    self.log.error('Error getting coming-soon page:', err);
                                    cb(err);
                                } else {
                                    cb(null, webpageData, page);
                                }
                            });
                        }
                    },
                    function readComponents(webpageData, page, cb) {
                        if(page) {
                            _.each(page.get('components'), function(component, index){
                                var divName = self.getDirectiveNameDivByType(component.type);
                                html = html + divName + ' component="components_' + index + '"></div>';
                            });
                            cb(null);
                        } else {
                            cb('Could not find page with handle ' + pageName);
                        }

                    },
                    function writeTemplate(cb) {
                        fs.writeFile(path, html, 'utf8', function(err){
                            cb(err);
                        });
                    }],
                    function done(err){
                        if(err) {
                            self.log.error("Error building template:", err);
                            resp.send("<p>Error</p>");

                        } else {
                            resp.send(html);
                        }
                    }
                );

            }
        });

    },

    updateS3Template: function(accountId, pageName, pageId, fn) {
        var self = this;
        var html = '';
        var pageName = pageName;
        async.waterfall([
            function getPublishedPage(cb) {
                if(pageName) {
                    var query = {
                        accountId:accountId,
                        handle:pageName
                    };
                    pageDao.findPublishedPages(query, function(err, pages){
                        if(pages && pages.length >0) {
                            cb(null, null, pages[0]);
                        } else {
                            cb('page not found');
                        }
                    });
                } else if(pageId) {
                    var query = {
                        accountId:accountId,
                        _id:pageId
                    };
                    pageDao.findPublishedPages(query, function(err, pages){
                        if(pages && pages.length >0) {
                            cb(null, null, pages[0]);
                        } else {
                            self.log.debug('query: ', query);
                            self.log.debug('pages: ', pages);
                            cb('page not found');
                        }
                    });
                } else {
                    cb('Both pageName and pageId are null');
                }
            },
            function readComponents(webpageData, page, cb) {
                if(page) {
                    pageName = page.get('handle');
                    if(page.get('sections') != null && page.get('sections').length > 0) {
                        html = self.buildTemplateMarkup(page);
                    } else {
                        _.each(page.get('components'), function(component, index){
                            var divName = self.getDirectiveNameDivByType(component.type);
                            html = html + divName + ' component="components_' + index + '"></div>';
                        });
                    }
                    cb(null);
                } else {
                    cb('Could not find page with handle ' + pageName);
                }

            },
            function writeTemplate(cb) {
                self.log.debug('Storing to s3');
                self.log.debug('pageId', pageId);
                self.log.debug('pageName', pageName);
                var environmentName = 'prod';
                if(appConfig.nonProduction === true) {
                    environmentName = 'test';
                }
                var path = environmentName + '/acct_' + accountId + '/' + pageName;
                var req = s3Client.put(path, {
                    'Content-Length': Buffer.byteLength(html),
                    'Content-Type': 'text/html'
                });
                req.on('response', function(res){
                    if (200 == res.statusCode) {
                        self.log.debug('Success!');
                        cb();
                    }
                });
                req.end(html);

            }],
            function done(err){
                if(err) {
                    self.log.error("Error building template:", err);
                    fn(err);

                } else {
                    fn(null, html);
                }
            }
        );
    },

    __updateS3Template: function(accountId, pageName, pageId, fn) {
        var self = this;
        var html = '';
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
                if(pageName) {
                    cmsDao.getLatestPageForWebsite(webpageData.website._id, pageName, accountId, function(err, page){
                        if(err) {
                            self.log.error('Error getting latest page for website:', err);
                            cb(err);
                        } else {
                            cb(null, webpageData, page);
                        }
                    });
                } else if(pageId) {
                    cmsDao.getPageById(pageId, function(err, page){
                        if(err ||!page) {
                            self.log.error('Error getting latest page for website:', err);
                            cb(err|| 'No Page found');
                        } else {
                            pageName = page.get('handle');
                            cb(null, webpageData, page);
                        }
                    });
                } else {
                    cb('Both pageName and pageId are null');
                }

            },
            function getFallbackPageIfNeeded(webpageData, page, cb) {
                if(page) {
                    cb(null, webpageData, page);
                } else {
                    self.log.debug('Looking for coming-soon page');
                    cmsDao.getLatestPageForWebsite(webpageData.website._id, 'coming-soon', accountId, function(err, page){
                        if(err) {
                            self.log.error('Error getting coming-soon page:', err);
                            cb(err);
                        } else {
                            cb(null, webpageData, page);
                        }
                    });
                }
            },
            function readComponents(webpageData, page, cb) {
                if(page) {
                    if(page.get('sections') != null && page.get('sections').length > 0) {
                        html = self.buildTemplateMarkup(page);
                    } else {
                        _.each(page.get('components'), function(component, index){
                            var divName = self.getDirectiveNameDivByType(component.type);
                            html = html + divName + ' component="components_' + index + '"></div>';
                        });
                    }

                    cb(null);
                } else {
                    cb('Could not find page with handle ' + pageName);
                }

            },
            function writeTemplate(cb) {
                self.log.debug('Storing to s3');
                var environmentName = 'prod';
                if(appConfig.nonProduction === true) {
                    environmentName = 'test';
                }
                var path = environmentName + '/acct_' + accountId + '/' + pageName;
                var req = s3Client.put(path, {
                    'Content-Length': Buffer.byteLength(html),
                    'Content-Type': 'text/html'
                });
                req.on('response', function(res){
                    if (200 == res.statusCode) {
                        self.log.debug('Success!');
                        cb();
                    }
                });
                req.end(html);

            }],
            function done(err){
                if(err) {
                    self.log.error("Error building template:", err);
                    fn(err);

                } else {
                    fn(null, html);
                }
            }
        );
    },

    getS3TemplateContent: function(accountId, pageName, fn) {
        var self = this;
        self.log.debug(accountId, null, '>> getS3TemplateContent');
        var environmentName = 'prod';
        if(appConfig.nonProduction === true) {
            environmentName = 'test';
        }
        var path = environmentName + '/acct_' + accountId + '/' + pageName;

        var chunks = [];

        s3Client.get(path).on('response', function(res){

            res.setEncoding('utf8');
            res.on('data', function(chunk){

                var string = self.buildRenderTemplateHtml(chunk);
                self.log.debug(accountId, null, '<< getS3TemplateContent');
                fn(null, string);
            });
        }).end();

    },

    buildTemplateFromPage: function(page, wrapHtml, fn){
        var self = this;
        var html = "";
        var string = "";
        if(page.get('sections') != null && page.get('sections').length > 0) {
            html = self.buildPageTemplateMarkup(page);
        }
        if(wrapHtml){
            string = self.buildRenderTemplateHtml(html);
        }
        else{
           string = html; 
        }
        fn(null, string);
    },

    getOrCreateS3Template: function(accountId, pageName, update, resp) {
        var self = this;
        self.log.debug(accountId, null, '>> getOrCreateS3Template(' + accountId + ',' + pageName + ',' + update + ')');
        var environmentName = 'prod';
        if(appConfig.nonProduction === true) {
            environmentName = 'test';
        }
        var path = environmentName + '/acct_' + accountId + '/' + pageName;
        s3Client.get(path).on('response', function(res){
            if(res.statusCode === 200 && !update) {
                //pipe it
                self.log.debug('piping');
                resp.setHeader('Content-Length', res.headers['content-length']);
                resp.setHeader('Content-Type', res.headers['content-type']);

                // cache-control?
                // etag?
                // last-modified?
                // expires?

                res.pipe(resp);
            } else {
                self.log.debug('building');
                var html = '';
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
                            pageDao.getPublishedPageForWebsite(webpageData.website._id, pageName, accountId, function(err, page){
                                if(err) {
                                    self.log.error('Error getting latest page for website:', err);
                                    cb(err);
                                } else {
                                    cb(null, webpageData, page);
                                }
                            });
                        },
                        function getFallbackPageIfNeeded(webpageData, page, cb) {
                            if(page) {
                                cb(null, webpageData, page);
                            } else {
                                self.log.debug('Looking for coming-soon page');
                                cmsDao.getLatestPageForWebsite(webpageData.website._id, 'coming-soon', accountId, function(err, page){
                                    if(err) {
                                        self.log.error('Error getting coming-soon page:', err);
                                        cb(err);
                                    } else {
                                        cb(null, webpageData, page);
                                    }
                                });
                            }
                        },
                        function readComponents(webpageData, page, cb) {
                            if(page) {
                                self.log.debug('got page:', page);
                                if(page.get('sections') != null && page.get('sections').length > 0) {
                                    html = self.buildTemplateMarkup(page);
                                } else {
                                    _.each(page.get('components'), function(component, index){
                                        var divName = self.getDirectiveNameDivByType(component.type);
                                        html = html + divName + ' component="components_' + index + '"></div>';
                                    });
                                }

                                cb(null);
                            } else {
                                cb('Could not find page with handle ' + pageName);
                            }

                        },
                        function writeTemplate(cb) {
                            self.log.debug('Storing to s3');
                            var req = s3Client.put(path, {
                                'Content-Length': Buffer.byteLength(html),
                                'Content-Type': 'text/html'
                            });
                            req.on('response', function(res){
                                if (200 == res.statusCode) {
                                    self.log.debug('Success!');
                                    cb();
                                }
                            });
                            req.end(html);

                        }],
                    function done(err){
                        if(err) {
                            self.log.error("Error building template:", err);
                            resp.send("");

                        } else {
                            resp.send(html);
                        }
                    }
                );
            }
        }).end();
    },

    getCachedPage: function(accountId, pageName, resp) {
        var self = this;
        //check if it's there.
        s3Client.get('acct_' + accountId + '/' + pageName).on('response', function(res){
            //self.log.debug('response: ', res);
            //check the status code

            if(res.statusCode === 200) {
                //pipe it
                resp.setHeader('Content-Length', res.headers['content-length'])
                resp.setHeader('Content-Type', res.headers['content-type'])

                // cache-control?
                // etag?
                // last-modified?
                // expires?

                res.pipe(resp);
            } else {
                self.log.debug('statusCode:' + res.statusCode);
                resp.send('Nothing found?');
            }
        }).end();

    },

    /**
     * Gets the start of an angular component div.  This returns an UNCLOSED div tag... because there might be extra
     * attributes needed (media, control, etc).
     * @param type
     *
     * TODO: can be deprecated when Pages feature is deprecated
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
            return lookup['text-only']();
        }
        return lookup[type]();
    },

    /**
     * Builds and returns a string representing the HTML markup for the page
     * @param page
     *
     * TODO: (maybe) isolate and load layout markup where needed. Currently here and:
     *     - /indigeweb/public/views/main.html
     *     - /indigeweb/public/admin/assets/js/ssb-site-builder/ssb-components/ssb-page-section/ssb-page-section.component.html
     */
    buildTemplateMarkup: function(page) {

        var self = this;
        var html = '';
        var layout = page.get('layout');
        var handle = page.get('handle');

        if (layout === 'ssb-layout__header_2-col_footer') {

            /* example layout data
            {
                "header" : [0,1],
                "2-col-1" : [2],
                "2-col-2" : [3,4,5],
                "footer" : [6]
            }
            */

            var layoutData = page.get('layoutModifiers');
            var isBlogCopy = page.get('isBlogCopy');
            var extraClass = "";
            if(isBlogCopy)
                extraClass = 'blog-list'
            var layoutMarkupString =
                '<div class="ssb-layout__header_2-col_footer ssb-page-' + handle + ' ssb-page-' + extraClass + '" >' +
                    '<div class="ssb-page-layout-row-header ssb-page-layout-row">' +
                        '<div class="col-xs-12">' +
                            '{{header}}' +
                        '</div>' +
                    '</div>' +
                    '<div class="ssb-page-layout-row-2-col ssb-page-layout-row">' +
                        '<div class="col-xs-12 col-md-8">' +
                            '{{2-col-1}}' +
                        '</div>' +
                        '<div class="col-xs-12 col-md-4">' +
                            '{{2-col-2}}' +
                        '</div>' +
                    '</div>' +
                    '<div class="ssb-page-layout-row-footer ssb-page-layout-row">' +
                        '<div class="col-xs-12">' +
                            '{{footer}}' +
                        '</div>' +
                    '</div>' +
                '</div>';

            self.log.debug('buildTemplateMarkup: layoutData', layoutData);

            Object.keys(layoutData).forEach(function(key) {

                var layoutAreaMarkupString = _(layoutData[key]).map(function(index){
                    return '<ssb-page-section section="sections_' + index + '" index="' + index + '" class="ssb-page-section"></ssb-page-section>';
                });

                layoutMarkupString = layoutMarkupString.replace('{{' + key + '}}', layoutAreaMarkupString.join(''));


                self.log.debug('buildTemplateMarkup: layoutAreaMarkupString', layoutAreaMarkupString.join(''));
                self.log.debug('buildTemplateMarkup: updated layoutMarkupString', layoutMarkupString);

            });

            self.log.debug('buildTemplateMarkup: end layoutMarkupString', layoutMarkupString);

            html = layoutMarkupString;

        } else {
            //<ssb-page-section section="section" index="$index" class="ssb-page-section"></ssb-page-section>
            _.each(page.get('sections'), function(section, index){
                html = html + '<ssb-page-section section="sections_' + index + '" index="' + index + '" class="ssb-page-section"></ssb-page-section>';
            });
        }

        return html;
    },

    buildPageTemplateMarkup: function(page) {
        var self = this;
        var html = '';
        _.each(page.get('sections'), function(section, index){            
            html = html + '<ssb-page-section-template section="sections_' + index + '" index="' + index + '" class="ssb-page-section"></ssb-page-section-template>';
        });
        return html;
    },

    buildPageStyles: function(page, fn){
        var self = this;
        _.each(page.get('sections'), function(section, index){
            section.sectionClass = self.buildSectionClass(section);
            section.sectionStyle = self.buildSectionStyles(section);
            section.sectionBGClass = self.buildSectionBGClass(section);
            section.sectionBGStyle = self.buildSectionBGStyle(section);
            section.showSection = self._showSection(section);
            _.each(section.components, function(component, idx){
                component.componentClass = self.buildComponentClass(section, component, idx);
                component.componentStyle = self.buildComponentStyles(component);
            })
        });

        fn(null, page);
    },

    buildSectionStyles: function(section){
        var self = this;
        var styleString = " ";            

        if (section && section.txtcolor) {
            styleString += "color: " + section.txtcolor + ";";
        }

        if (section && section.border && section.border.show && section.border.color) {
            styleString += "border-color: " + section.border.color + ";";
            styleString += "border-width: " + section.border.width + "px;";
            styleString += "border-style: " + section.border.style + ";";
            styleString += "border-radius: " + section.border.radius + "%;"; 
        }
        return styleString;
    },

    buildSectionClass: function(section, index) {
        var self = this;
        var classString = "container-fluid ";
        if (section) {
            var title = section.title || section.name,
                version = section.version;
            if (title) {
                classString += " ssb-page-section-" + self._slugifyText(title);
                if (version) {
                    classString += " ssb-page-section-" + self._slugifyText(title); + "-v" + version;
                }
            }

            if (section.layout) {
                classString += " ssb-page-section-layout-" + section.layout;
                if (version) {
                    classString += " ssb-page-section-layout-" + section.layout + "-v" + version;
                }
            }

            if (section.layoutModifiers) {
                if (section.layoutModifiers.fixed) {
                    classString += " ssb-page-section-layout-" + section.layout + "-fixed";
                    
                    if (!section.fixedLeftNavigation || (section.fixedLeftNavigation && index > 0)) {
                        classString += " ssb-fixed sticky fixedsection";
                    }
                    if (index === 0 && !section.fixedLeftNavigation) {
                        classString += " ssb-fixed-first-element";
                    }
                }
                if (section.layoutModifiers.grid && section.layoutModifiers.grid.isActive) {
                    classString += " ssb-page-section-layout-" + section.layout + "-grid";
                    if (section.layoutModifiers.grid.height && section.layoutModifiers.grid.height < 0) {
                        section.layoutModifiers.grid.height = 350;
                    }
                }
                if (section.layoutModifiers.columns && section.layoutModifiers.columns.columnsNum !== undefined) {
                    var _col = section.layoutModifiers.columns.columnsNum || 1;
                    classString += " ssb-text-column-layout ssb-text-column-" + _col;
                }
            }

            if (self._sectionHasFooter(section)) {
                classString += " ssb-page-section-layout-overflow-visible";
            }

            if (self._sectionHasLegacyUnderNavSetting(section)) {
                classString += " ssb-page-section-layout-legacy-undernav";
            }

            if (section.bg && section.bg.img && section.bg.img.blur) {
                classString += " ssb-page-section-layout-blur-image";
            }

            if (section.bg && section.bg.img && section.bg.img.overlay) {
                classString += " section-background-overlay";
            }

            if (section.spacing && section.spacing.default) {
                classString += " no-component-vertical-space";
            }

            if (section.title && (section.title.toLowerCase() === "nav + hero" || section.title.toLowerCase() === "hero")) {
                if (section.bg && section.bg.img && section.bg.img.show === false) {
                    classString += " hide-hero-bg-image";
                }
                _.each(section.components, function (cmp, index) {
                    if(cmp.type=="navigation" && cmp.navigation){
                        if(cmp.navigation.wideMobileMode){
                            classString += " ssb-section-wmm";
                        }else if(cmp.navigation.alwaysmobileMode){
                            classString += " ssb-section-amm";
                        }
                    }
                });
            }

            if (section.filter) {
                classString += " ssb-section-filter-" + section.filter.replace(/[^0-9a-z]/gi, "-");
            }
            if (section.hideOnlyMobile) {
                classString += " ssb-section-o-desktop";
            }
            if (section.showOnlyMobile) {
                classString += " ssb-section-o-moblie";
            }

        }
        return classString;
    },

    buildSectionBGClass: function(section){
        var classString = " ";
        if (section && section.bg && section.bg.img) {
            if (section.bg.img.blur) {
                classString += " blur-image";
            }
            if (section.bg.img.parallax) {
                classString += " parallax";
            }
        }
        return classString;
    },

    buildSectionBGStyle: function(section) {
        var styleString = " ";
        if (section && section.bg) {
            if (section.bg.color) {
                styleString += "background-color: " + section.bg.color + ";";
            }
            if (section.bg.img && section.bg.img.show && section.bg.img.url && section.bg.img.url !== "") {
                styleString += "background-image: url(" + section.bg.img.url + ")";
            }
        }
        return styleString;
    },

    // Component related styles and classes

    buildComponentClass: function(section, component, index) {
        var self = this;
        var classString = "container-fluid ";
        if (section.layout === "2-col") {
            classString += " col-md-6 ";
        } else if (section.layout === "2-col-right") {
            classString += " col-md-6 ";
            if (index > 1) {
                classString += " ssb-col-md-float-right";
            }
        } else if (section.layout === "3-col") {
            classString += " col-md-4 ";
        }else if (section.layout === "4-col") {
            classString += " col-md-3";
        }
        if (index !== undefined) {
            classString += " ssb-component-index-" + index + " ";
        }
        if (component.slider && component.slider.sliderDotShape) {
            classString += " square-dot";
        }
        if (component.hideOnlyMobile) {
            classString += " ssb-component-o-desktop";
        }
        if (component.showOnlyMobile) {
            classString += " ssb-component-o-moblie";
        }
        if (section.layoutModifiers && section.layoutModifiers.columns) {
            var fixedColumn;
            if (section.layoutModifiers.columns.columnsNum !== undefined) {
                var rowsCount = (section.layoutModifiers.columns.rowsNum ? parseInt(section.layoutModifiers.columns.rowsNum) : 1),
                    firstColIndexes = self._getColumnIndexes(rowsCount, section.layoutModifiers.columns.columnsNum, true),
                    lastColIndexes = self._getColumnIndexes(rowsCount, section.layoutModifiers.columns.columnsNum, false),
                    _lastCoulmnFullWidth = false,
                    actualColumnsToIgnore = [],
                    colCount,
                    newColCount,
                    colClass,
                    totalCoulmns,
                    actualColumnsIndexes;
                if (section.layoutModifiers.columns.ignoreColumns && section.layoutModifiers.columns.ignoreColumns.length) {
                    var ignoreColumns = section.layoutModifiers.columns.ignoreColumns;
                    _.each(ignoreColumns, function (val) {
                        if (val === "last") {
                            actualColumnsToIgnore.push(section.components.length - 1);
                            _lastCoulmnFullWidth = true;
                        } else {
                            actualColumnsToIgnore.push(val - 1);
                        }
                    });
                }
                fixedColumn = actualColumnsToIgnore.indexOf(index) > -1 ? true : false;

                colCount = parseInt(section.layoutModifiers.columns.columnsNum) || 1;
                rowsCount = section.layoutModifiers.columns.rowsNum ? parseInt(section.layoutModifiers.columns.rowsNum) : 1;
                newColCount = colCount * rowsCount;
                colClass = " col-xs-12 col-sm-" + Math.floor(12 / colCount);
                if (!fixedColumn) {
                    classString += colClass;
                    if (colCount == 5) {
                        classString += " col-xs-15 col-md-15";
                    }
                }
                totalCoulmns = newColCount;
                actualColumnsIndexes = [];
                for (var i = 0; i <= section.components.length - 1; i++) {
                    actualColumnsIndexes.push(i);
                }
                if (actualColumnsToIgnore.length) {
                    totalCoulmns = totalCoulmns + actualColumnsToIgnore.length;
                    actualColumnsIndexes = _.difference(actualColumnsIndexes, actualColumnsToIgnore);
                }

                if (index !== undefined && index >= totalCoulmns && !fixedColumn) {
                    classString += " ssb-col-hide";
                }


                if (section.layoutModifiers.columns.columnsSpacing && !fixedColumn) {
                    if (parseInt(section.layoutModifiers.columns.columnsNum) > 1) {

                        if (actualColumnsIndexes.indexOf(index) == 0) {
                            classString += " ssb-component-layout-columns-spacing-first-column-" + section.layoutModifiers.columns.columnsSpacing + " ";
                        } else if (actualColumnsIndexes.indexOf(index) == section.layoutModifiers.columns.columnsNum - 1) {
                            classString += " ssb-component-layout-columns-spacing-last-column-" + section.layoutModifiers.columns.columnsSpacing + " ";
                        } else if (_.contains(lastColIndexes, actualColumnsIndexes.indexOf(index))) {
                            classString += " ssb-component-layout-columns-spacing-last-column-" + section.layoutModifiers.columns.columnsSpacing + " ";
                        } else if (_.contains(firstColIndexes, actualColumnsIndexes.indexOf(index))) {
                            classString += " ssb-component-layout-columns-spacing-first-column-" + section.layoutModifiers.columns.columnsSpacing + " ";
                        } else {
                            classString += " ssb-component-layout-columns-spacing-" + section.layoutModifiers.columns.columnsSpacing + " ";
                        }
                    }

                }

                if (section.layoutModifiers.columns.rowsSpacing && !fixedColumn) {
                    if (parseInt(section.layoutModifiers.columns.columnsNum) > 1) {
                        if (actualColumnsIndexes.indexOf(index) > section.layoutModifiers.columns.columnsNum - 1) {
                            classString += " ssb-component-layout-rows-spacing-" + section.layoutModifiers.columns.rowsSpacing + " ";
                        }
                        if (actualColumnsIndexes.indexOf(index) > 0) {
                            classString += " ssb-component-layout-rows-mobile-spacing-" + section.layoutModifiers.columns.rowsSpacing + " ";
                        }
                    }
                }

                if (!fixedColumn) {
                    if (parseInt(section.layoutModifiers.columns.columnsNum) > 1) {
                        if (_.contains(firstColIndexes, actualColumnsIndexes.indexOf(index))) {
                            classString += " ssb-clear-left ";
                        }
                    }
                }

                if (index === section.components.length - 1 && _lastCoulmnFullWidth) {
                    classString += " ssb-text-last-column-full-width";
                }
            }
        }
        if (component.layoutModifiers) {
            if (component.layoutModifiers.columns) {
                if (component.layoutModifiers.columnsNum) {
                    classString += " ssb-component-layout-columns-" + component.layoutModifiers.columnsNum + " ";
                }
                if (component.layoutModifiers.columnsSpacing) {
                    classString += " ssb-component-layout-columns-spacing-" + component.layoutModifiers.columnsSpacing + " ";
                }
            }
        }
        if (component.slider && component.slider.stretchImage) {
            classString += " ssb-component-stretch-image";
        }
        if(component.navigation){
            if(component.navigation.wideMobileMode){                    
                classString += " ssb-component-wmm";
            }
            else if(component.navigation.alwaysmobileMode){
                classString += " ssb-component-amm";
            }
        }
        return classString;
    },

    buildComponentStyles: function(component){
        var styleString = " ";

        if (component.type.indexOf("ssb-") === 0 && component.type != "ssb-form-builder" && component.type != "ssb-rss-feed" && component.type != "ssb-form-donate") {

            if (component.spacing) {
                if (component.spacing.pt) {
                    styleString += "padding-top: " + component.spacing.pt + "px;";
                }

                if (component.spacing.pb) {
                    styleString += "padding-bottom: " + component.spacing.pb + "px;";
                }

                if (component.spacing.pl) {
                    styleString += "padding-left: " + component.spacing.pl + "px;";
                }

                if (component.spacing.pr) {
                    styleString += "padding-right: " + component.spacing.pr + "px;";
                }

                if (component.spacing.mt) {
                    styleString += "margin-top: " + component.spacing.mt + "px;";
                    
                }

                if (component.spacing.mb) {
                    styleString += "margin-bottom: " + component.spacing.mb + "px;";
                }

                if (component.spacing.ml) {
                    styleString += component.spacing.ml == "auto" ? "margin-left: " + component.spacing.ml + ";float: none;" : "margin-left: " + component.spacing.ml + "px;";
                }

                if (component.spacing.mr) {
                    styleString += (component.spacing.mr == "auto") ? "margin-right: " + component.spacing.mr + ";float: none;" : "margin-right: " + component.spacing.mr + "px;";
                }

                if (component.spacing.mw) {
                    component.spacing.mw = component.spacing.mw.toString();
                    if(component.spacing.mw == "100%" || component.spacing.mw == "auto") {
                      styleString +=   "max-width: " + component.spacing.mw + ";" ;
                    }
                    else{
                        if(component.spacing.mw && component.spacing.mw !== "" && component.spacing.mw.indexOf("%") === -1){
                           var isPx = "";
                           (component.spacing.mw.toLowerCase().indexOf("px") === -1) ? isPx="px" : isPx = "";
                           styleString +=  "max-width: " + component.spacing.mw + isPx +";margin-left:auto!important;margin-right:auto!important;";
                        }
                        else
                        {
                           styleString +=  "max-width: " + component.spacing.mw + ";margin-left:auto!important;margin-right:auto!important;";
                        }
                    }
                }

                if (component.spacing.lineHeight) {
                    styleString += "line-height: " + component.spacing.lineHeight;
                }
            }

            if (component.txtcolor && vm.section && vm.section.txtcolor) {
                styleString += "color: " + component.txtcolor + ";";
            }

            if (component.visibility === false && component.type != "ssb-rss-feed") {
                styleString += "display: none!important;";
            }

            if (component.bg) {
                if (component.bg.color) {
                    styleString += "background-color: " + component.bg.color + ";";
                }

                if (component.bg.img && component.bg.img.show && component.bg.img.url !== "") {
                    styleString += "background-image: url(" + component.bg.img.url + ")";
                }
            }

            if (component.src) {
                if (component.src && component.src !== "") {
                    styleString += "background-image: url(" + component.src + ")";
                }
            }

        }

        if (component.layoutModifiers) {
            if (component.layoutModifiers.columns) {
                if (component.layoutModifiers.columnsMaxHeight) {
                    styleString += " max-height: " + component.layoutModifiers.columnsMaxHeight + "px";
                }
            }
        }

        if (component.border && component.border.show && component.border.color && component.visibility !== false) {
            styleString += " border-color: " + component.border.color + ";";
            styleString += " border-width: " + component.border.width + "px;";
            styleString += " border-style: " + component.border.style + ";";
            styleString += " border-radius: " + component.border.radius + "%;";
        }


        return styleString;
    },

    _showSection: function (section, handle) {
        var _showSection = false;
        if (section) {
            _showSection = section.visibility !== false;
            if (section.global && section.hiddenOnPages) {                
                _showSection = !section.hiddenOnPages[handle];
                section.visibility = _showSection;
            }
        }
        return _showSection;
    },

    _slugifyText: function(s){
        s = s.replace(/[^\w\s-]/g, "").trim().toLowerCase();
        return s.replace(/[-\s]+/g, "-");
    },

    _sectionHasFooter: function(section) {
        return _.findWhere(section.components, {
            type: 'footer'
        });
    },

    _sectionHasLegacyUnderNavSetting: function(section) {
        var isUnderNav = false;
        var masthead = _.findWhere(section.components, {
            type: 'masthead'
        });

        if (masthead && masthead.bg && masthead.bg.img && masthead.bg.img.undernav) {
            isUnderNav = true;
        }
        return isUnderNav;
    },

    _getColumnIndexes: function(rowsNum, colNum, first) {
        var indexes = [];
        for (var index = 0; index <= rowsNum; index++) {
            if (first)
                indexes.push(index * parseInt(colNum));
            else {
                indexes.push((index * parseInt(colNum)) + parseInt(colNum) - 1);
            }
        }
        return indexes;
    },

    buildRenderTemplateHtml: function(html){
        return '<div class="main-include" ssb-data-styles>' + html + '</div>';
    }
};
