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


    getActivatePageSectionHtml: function(page, fn){
        var self = this;
        var html = "";
        if(page.get('sections') != null && page.get('sections').length > 0) {
            html = self.buildTemplateMarkup(page);
        }
        var string = self.buildRenderTemplateHtml(html);
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

    buildRenderTemplateHtml: function(html){
        return '<div class="main-include" ssb-data-styles>' + html + '</div>';
    }
};
