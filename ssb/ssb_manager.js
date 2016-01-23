


var logger = $$.g.getLogger("ssb_manager");
var templateDao = require('./dao/template.dao');
var themeDao = require('./dao/theme.dao');
var websiteDao = require('./dao/website.dao');
var pageDao = require('./dao/page.dao');
var sectionDao = require('./dao/section.dao');
var componentDao = require('./dao/component.dao');
var siteTemplateDao = require('./dao/sitetemplate.dao');
var async = require('async');
var slug = require('slug');
var constants = require('./constants');

var PLATFORM_ID = 0;

module.exports = {
    log: logger,

    listTemplates: function(accountId, fn) {
        var self = this;
        self.log.debug('>> listTemplates');
        var query = {
            $or : [{'accountId': accountId}, {'public': true}],
            ssb:true
        };
        templateDao.findMany(query, $$.m.ssb.Template, function(err, list){
            if(err) {
                self.log.error('Error listing templates:', err);
                return fn(err, null);
            } else {
                self.log.debug('<< listTemplates');
                return fn(null, list);
            }
        });
    },

    getTemplate: function(templateId, fn) {
        var self = this;
        self.log.debug('>> getTemplate');
        templateDao.getById(templateId, $$.m.ssb.Template, function(err, template){
            if(err) {
                self.log.error('Error getting template:', err);
                return fn(err, null);
            } else {
                self.log.debug('<< getTemplate');
                return fn(null, template);
            }
        });
    },

    listThemes: function(accountId, fn) {
        var self = this;
        self.log.debug('>> listThemes');
        var query = {'ssb':true};
        themeDao.findMany(query, $$.m.ssb.Theme, function(err, list){
            if(err) {
                self.log.error('Error listing templates:', err);
                return fn(err, null);
            } else {
                self.log.debug('<< listThemes');
                return fn(null, list);
            }
        });

    },

    getTheme: function(themeId, fn) {
        var self = this;
        self.log.debug('>> getTheme', themeId);
        var query = {_id:themeId};
        themeDao.findOne(query, $$.m.ssb.Theme, function(err, theme){
            if(err) {
                self.log.error('Error getting theme:', err);
                return fn(err, null);
            } else {
                self.log.debug('<< getTheme', theme);
                return fn(null, theme);
            }
        });
    },

    listWebsites: function(accountId, fn) {
        var self = this;
        //TODO: materialize Theme
        self.log.debug('>> listWebsites');
        websiteDao.getWebsitesForAccount(accountId, function(err, list){
            if(err) {
                self.log.error('Error getting websites:', err);
                return fn(err, null);
            } else {
                self.log.debug('<< listWebsites');
                return fn(null, list);
            }
        });
    },

    getWebsite: function(accountId, websiteId, fn) {
        var self = this;

        self.log.debug('>> getWebsite');
        websiteDao.getWebsiteById(accountId, websiteId, function(err, website){
            if(err) {
                self.log.error('Error getting website:', err);
                return fn(err, null);
            } else {
                if(website.get('themeId')){
                    themeDao.getThemeById(website.get('themeId'), function(err, theme){
                        if(err) {
                            self.log.error('Error getting theme:', err);
                            return fn(err, null);
                        } else {
                            website.set('theme', theme);
                            self.log.debug('<< getWebsite');
                            return fn(null, website);
                        }
                    });
                } else {
                    self.log.debug('<< getWebsite');
                    return fn(null, website);
                }

            }
        });
    },

    updateWebsite: function(accountId, websiteId, modified, modifiedWebsite, fn) {
        var self = this;

        self.log.debug('>> updateWebsite');
        websiteDao.getWebsiteById(accountId, websiteId, function(err, website){
            if(err || !website) {
                self.log.error('Error finding website:', err);
                return fn(err, null);
            } else {
                modifiedWebsite.set('modified', modified);
                if(modifiedWebsite.attributes.theme) {
                    delete modifiedWebsite.attributes.theme;
                }

                websiteDao.saveOrUpdate(modifiedWebsite, function(err, updatedWebsite){
                    if(err) {
                        self.log.error('Error updating website:', err);
                        return fn(err, null);
                    } else {
                        if(updatedWebsite.get('themeId')) {
                            themeDao.getThemeById(updatedWebsite.get('themeId'), function (err, theme) {
                                if (err) {
                                    self.log.error('Error getting theme:', err);
                                    return fn(err, null);
                                } else {
                                    updatedWebsite.set('theme', theme);
                                    self.log.debug('<< getWebsite');
                                    return fn(null, updatedWebsite);
                                }
                            });
                        } else {
                            self.log.debug('<< updateWebsite');
                            return fn(null, updatedWebsite);
                        }

                    }
                });
            }
        });
    },

    createPage: function(accountId, websiteId, templateId, created, fn) {
        var self = this;
        self.log.debug('>> createPage');

        /*
         * 1. Get the website
         * 2. Get the theme from the website
         * 3. Get the template
         * 4. Create page from theme and template
         *
         */
        async.waterfall([
            function getWebsite(cb){
                websiteDao.getWebsiteById(accountId, websiteId, function(err, website){
                    if(err) {
                        self.log.error('Error finding website:', err);
                        cb(err);
                    } else {
                        cb(null, website);
                    }
                });
            },
            function getTheme(website, cb){
                if(website.get('themeId')) {
                    var themeId = website.get('themeId');
                    themeDao.getById(themeId, function(err, theme){
                        if(err) {
                            self.log.error('Error finding theme:', err);
                            cb(err);
                        } else {
                            cb(null, website, theme);
                        }
                    });
                } else {
                    cb(null, website, null);
                }

            },
            function getTemplate(website, theme, cb){
                templateDao.getById(templateId, function(err, template){
                    if(err) {
                        self.log.error('Error getting template:', err);
                        cb(err);
                    } else {
                        cb(null, website, theme, template);
                    }
                });
            },
            function createSections(website, theme, template, cb) {
                var sections = template.get('sections');

                if (!template.get('ssb') && template.get('config').components.length) {
                    sections = self.transformComponentsToSections(template.get('config').components);
                }

                _.each(sections, function(section){
                    var id = $$.u.idutils.generateUUID();
                    section._id = id;
                    section.anchor = id;
                    section.accountId = accountId;
                });
                sectionDao.saveSections(sections, function(err, sectionAry){
                    if(err) {
                        self.log.error('Error saving default sections:', err);
                        cb(err);
                    } else {
                        cb(null, website, theme, template, sectionAry);
                    }
                });
            },
            function getGlobalHeader(website, theme, template, sections, cb){
                var query = {
                    accountId:accountId,
                    globalHeader:true
                };
                sectionDao.findOne(query, $$.m.ssb.Section, function(err, section){
                    if(err) {
                        self.log.error('Error finding global header:', err);
                        cb(err);
                    } else {
                        cb(null, website, theme, template, sections, section);
                    }
                });
            },
            function getGlobalFooter(website, theme, template, sections, header, cb){
                var query = {
                    accountId:accountId,
                    globalFooter:true
                };
                sectionDao.findOne(query, $$.m.ssb.Section, function(err, section){
                    if(err) {
                        self.log.error('Error finding global footer:', err);
                        cb(err);
                    } else {
                        cb(null, website, theme, template, sections, header, section);
                    }
                });
            },
            function createPage(website, theme, template, sections, header, footer, cb){
                //TODO: make sure this name is unique
                //var pageName = slug(template.get('name') + '-' + $$.u.idutils.generateUniqueAlphaNumeric(5, true, true));

                var pageHandle = slug(template.get('handle')) +  '-' + $$.u.idutils.generateUniqueAlphaNumeric(5, true, true);
                var pageTitle = template.get('name');




                var jsonSections = [];
                if(header) {
                    jsonSections.push(header.toReference());
                    //find and remove the default header
                   sections = _.filter(sections, function(section){
                       if(section.get('name') !== 'Header') {
                           return true;
                       }
                   });
                }
                if(footer) {
                    //find and remove the default footer
                    sections = _.filter(sections, function(section){
                        if(section.get('name') !== 'Footer') {
                            return true;
                        }
                    });
                }
                _.each(sections, function(section){
                    jsonSections.push(section.toReference());
                });
                if(footer) {
                    jsonSections.push(footer.toReference());
                }

                var page = new $$.m.ssb.Page({
                    accountId:accountId,
                    websiteId:websiteId,
                    handle:pageHandle,
                    title: pageTitle,
                    visibility: {
                        visible:false,
                        asOf:null,
                        displayOn:null
                    },
                    sections: jsonSections,
                    templateId: templateId,
                    created: created,
                    modified:created,
                    ssb:true

                });
                pageDao.saveOrUpdate(page, function(err, value){
                    if(err) {
                        self.log.error('Error creating page:', err);
                        cb(err);
                    } else {
                        cb(null, value, sections);
                    }
                });
            }
        ], function done(err, page, sections){
            if(err) {
                fn(err, null);
            } else {

                page.set('sections', sections);

                self.log.debug('<< createPage');
                fn(null, page);
            }
        });

    },

    listPages: function(accountId, websiteId, fn) {
        var self = this;
        self.log.debug('>> listPages');
        var query = {accountId:accountId, websiteId:websiteId, latest:true};
        pageDao.findMany(query, $$.m.ssb.Page, function(err, pages){
            if(err) {
                self.log.error('error getting pages:', err);
                return fn(err);
            } else {
                self.log.debug('<< listPages');
                return fn(null, pages);
            }
        });
    },

    listPagesWithSections: function(accountId, websiteId, fn) {
        var self = this;
        self.log.debug('>> listPages');
        var query = {accountId:accountId, websiteId:websiteId, latest:true};
        pageDao.findMany(query, $$.m.ssb.Page, function(err, pages){
            if(err) {
                self.log.error('error getting pages:', err);
                return fn(err);
            } else {
                async.each(pages, function(page, cb){
                    var sections = page.get('sections') || [];
                    sectionDao.dereferenceSections(sections, function(err, sectionAry){
                        if(err) {
                            cb(err);
                        } else {
                            //handle legacy pages without sections
                            if(sectionAry && sectionAry.length === 0) {
                                //self.log.debug('Converting legacy page');
                                var section = {};
                                section.components = page.get('components');
                                section.ssb = false;
                                sections.push(section);
                                page.set('sections', sections);
                            } else {
                                page.set('sections', sectionAry);
                            }

                            cb(null);
                        }
                    });
                }, function done(err){
                    self.log.debug('<< listPages');
                    return fn(err, pages);
                });

            }
        });
    },

    getPage: function(accountId, pageId, fn) {
        var self = this;
        self.log.debug('>> getPage');

        pageDao.getPageById(accountId, pageId, function(err, page){
            if(err || !page) {
                self.log.error('Error getting page:', err);
                return fn(err, null);
            } else {
                var sections = page.get('sections') || [];
                sectionDao.dereferenceSections(sections, function(err, sectionAry){
                    page.set('sections', sectionAry);
                    self.log.debug('<< getPage');
                    return fn(null, page);
                });

            }
        });
    },

    getPageByHandle: function(accountId, handle, websiteId, fn) {
        var self = this;
        self.log.debug('>> getPageByHandle (' + accountId + ',' + handle + ',' + websiteId + ')');
        pageDao.getLatestPageForWebsite(websiteId, handle, accountId, function(err, page){
            if(err || !page) {
                self.log.error('Error getting page:', err);
                return fn(err, null);
            } else {
                var sections = page.get('sections') || [];
                sectionDao.dereferenceSections(page.get('sections'), function(err, sectionAry){

                    //handle legacy pages without sections
                    if(sectionAry && sectionAry.length === 0) {
                        //self.log.debug('Converting legacy page');
                        var section = {};
                        section.components = page.get('components');
                        section.ssb = false;
                        sections.push(section);
                        page.set('sections', sections);
                    } else {
                        page.set('sections', sectionAry);
                    }
                    self.log.debug('<< getPage');
                    return fn(null, page);
                });

            }
        });
    },

    updatePage: function(accountId, pageId, page, modified, fn) {
        var self = this;
        self.log.debug('>> updatePage (' + pageId + ')');

        async.waterfall([
            function getExistingPage(cb){
                pageDao.getPageById(accountId, pageId, function(err, existingPage){
                    if(err) {
                        self.log.error('Error getting page:', err);
                        cb(err);
                    } else {
                        cb(null, existingPage);
                    }
                });
            },
            function updateSections(existingPage, cb) {
                var sections = page.get('sections');

                _.each(sections, function(section){
                    //if the accountId is 0, it is a platform section
                    if(section.accountId === 0) {
                        section._id = null;
                    }
                    section.accountId = accountId;
                });

                sectionDao.saveSections(sections, function(err, updatedSections){
                    if(err) {
                        self.log.error('Error saving sections:', err);
                        cb(err);
                    } else {
                        cb(null, existingPage, updatedSections);
                    }
                });
            },
            function updateThePage(existingPage, updatedSections, cb){
                //var sections = page.get('sections');
                page.set('modified', modified);
                var jsonSections = [];
                _.each(updatedSections, function(section){
                    jsonSections.push({_id: section.id()});
                });
                page.set('sections', jsonSections);
                page.set('created', existingPage.get('created'));
                pageDao.saveOrUpdate(page, function(err, updatedPage){
                    if(err) {
                        self.log.error('Error updating page:', err);
                        cb(err);
                    } else {
                        cb(null, existingPage, updatedPage, updatedSections);
                    }
                });
            },
            function deleteRemovedSections(existingPage, updatedPage, updatedSections, cb){

                var updatedSectionIDs =_.map(updatedSections, function(section){
                    return section.id();
                });
                self.log.debug('updatedSectionIDs:', updatedSectionIDs);
                var sectionsToBeDeleted = [];
                /*
                 * If the updatedPage does not have a section with the same
                 * ID as the existing page's section, it must be deleted
                 */
                _.each(existingPage.get('sections'), function(section){
                    if(!_.contains(updatedSectionIDs, section._id)) {
                        sectionsToBeDeleted.push(section);
                    }
                });

                async.each(sectionsToBeDeleted, function(section, cb){
                    sectionDao.removeById(section._id, $$.m.ssb.Section, function(err, value){
                        cb(err);
                    });
                }, function done(err){
                    if(err) {
                        self.log.error('Error removing section:', err);
                    }
                    cb(null, updatedPage, updatedSections);
                });

            }
        ], function done(err, updatedPage, updatedSections){
            if(updatedPage) {
                var sectionArray = [];

                _.each(updatedSections, function(section){
                    sectionArray.push(section.toJSON());
                });
                updatedPage.set('sections', sectionArray);

            }
            self.log.debug('<< updatePage');
            return fn(err, updatedPage);
        });


    },

    listAccountSectionSummaries: function(accountId, fn) {
        var self = this;
        self.log.debug('>> listAccountSectionSummaries');

        var query = {accountId:accountId, reusable:true};
        //var fields = ['_id', 'name', 'type', 'preview', 'filter', 'description', 'enabled'];
        var fields = {
            _id:1,
            name:1,
            type:1,
            preview:1,
            filter:1,
            description:1,
            enabled:1
        };

        sectionDao.findManyWithFields(query, fields, $$.m.ssb.Section, function(err, list){
            if(err) {
                self.log.error('Error listing sections:', err);
                return fn(err);
            } else {
                self.log.debug('<< listAccountSectionSummaries');
                return fn(null, list);
            }
        });
    },

    listAllSectionSummaries: function(accountId, fn) {
        var self = this;
        self.log.debug('>> listAllSectionSummaries');

        var query = {$or: [{accountId:accountId},{accountId:PLATFORM_ID}]};
        //var fields = ['_id', 'name', 'type', 'preview', 'filter', 'description', 'enabled'];
        var fields = {
            _id:1,
            name:1,
            type:1,
            preview:1,
            filter:1,
            description:1,
            enabled:1
        };

        sectionDao.findManyWithFields(query, fields, $$.m.ssb.Section, function(err, list){
            if(err) {
                self.log.error('Error listing sections:', err);
                return fn(err);
            } else {
                self.log.debug('<< listAllSectionSummaries');
                return fn(null, list);
            }
        });
    },

    listPlatformSectionSummaries: function(accountId, fn) {
        var self = this;
        self.log.debug('>> listPlatformSectionSummaries');

        var query = {accountId:PLATFORM_ID};
        //var fields = ['_id', 'name', 'type', 'preview', 'filter', 'description', 'enabled'];
        var fields = {
            _id:1,
            name:1,
            type:1,
            preview:1,
            filter:1,
            description:1,
            enabled:1,
            title: 1
        };

        sectionDao.findManyWithFields(query, fields, $$.m.ssb.Section, function(err, list){
            if(err) {
                self.log.error('Error listing sections:', err);
                return fn(err);
            } else {
                self.log.debug('<< listPlatformSectionSummaries');
                return fn(null, list);
            }
        });
    },

    getSection: function(accountId, sectionId, fn) {
        var self = this;
        self.log.debug('>> getSection');
        var query = {_id: sectionId, accountId: {$in: [accountId, PLATFORM_ID]}};

        sectionDao.findOne(query, $$.m.ssb.Section, function(err, section){
            if(err) {
                self.log.error('Error getting section:', err);
                return fn(err);
            } else {
                self.log.debug('<< getSection');
                return fn(null, section);
            }
        });
    },

    listComponents: function(accountId, fn) {
        var self = this;
        self.log.debug('>> listComponents');

        componentDao.findMany({_id: {$ne:'__counter__'}}, $$.m.ssb.Component, function(err, components){
            if(err) {
                self.log.error('Error listing components:', err);
                return fn(err);
            } else {
                self.log.debug('<< listComponents');
                return fn(null, components);
            }
        });
    },

    /*
     *
     * Transform legacy template components to new section/component model format
     */
    transformComponentsToSections: function(components) {

        var sections = [];

        for (var i = 0; i < components.length; i++) {
            var component = components[i];
            var defaultSectionObj = {
                layout: '1-col',
                name: component.type + ' Section',
                components: [component]
            };

            // defaultSectionObj.name = sectionName(defaultSectionObj) + ' Section';

            sections[i] = defaultSectionObj;

        }

        return sections;
    },

    listSiteTemplates: function(accountId, fn){
        var self = this;
        self.log.debug('>> listSiteTemplates');

        siteTemplateDao.findMany({_id: {$ne:'__counter__'}}, $$.m.ssb.SiteTemplate, function(err, siteTemplates){
            if(err) {
                self.log.error('Error listing site templates:', err);
                return fn(err);
            } else {
                self.log.debug('<< listSiteTemplates');
                return fn(null, siteTemplates);
            }
        });
    },

    getSiteTemplate: function(accountId, siteTemplateId, fn) {
        var self = this;
        self.log.debug('>> getSiteTemplate');
        siteTemplateDao.getById(siteTemplateId, $$.m.ssb.SiteTemplate, function(err, siteTemplate){
            if(err) {
                self.log.error('Error getting site template:', err);
                return fn(err);
            } else {
                self.log.debug('<< getSiteTemplate');
                return fn(null, siteTemplate);
            }
        });
    },

    setSiteTemplate: function(accountId, siteTemplateId, siteThemeId, websiteId, created, fn) {
        var self = this;
        self.log.debug('>> setSiteTemplate', siteTemplateId);

        /*
         * 1. Get the website
         * 2. Set the siteTemplateId
         * 3. Create the default pages
         */

        async.waterfall([
            function getWebsite(cb){
                websiteDao.getWebsiteById(accountId, websiteId, function(err, website){
                    if(err) {
                        self.log.error('Error getting website:', err);
                        cb(err);
                    } else {
                        cb(null, website);
                    }
                });
            },
            function setSiteTemplateAndTheme(website, cb){
                var currentSiteTemplate = website.get('siteTemplateId');
                var createPages = true;
                if(currentSiteTemplate) {
                    createPages = false;
                }
                website.set('siteTemplateId', siteTemplateId);
                website.set('themeId', siteThemeId);
                website.set('modified', created);
                websiteDao.saveOrUpdate(website, function(err, updatedWebsite){
                    if(err) {
                        self.log.error('Error updating website:', err);
                    }
                    self.log.debug('setSiteTemplate', updatedWebsite.get('siteTemplateId'));
                    cb(err, updatedWebsite, createPages);
                });
            },
            function createDefaultPages(website, createPages, cb){
                if(createPages === true) {
                    self.log.debug('createDefaultPages', website.get('siteTemplateId'));
                    self.getSiteTemplate(accountId, website.get('siteTemplateId'), function(err, siteTemplate) {

                        if (err) {
                            self.log.error('Error getting siteTemplate for website:', err);
                            return cb(err);
                        }

                        var pagesToCreate = siteTemplate.get('defaultPageTemplates'); //array of template reference objs
                        var indexPageId = undefined;
                        var linkLists = [{
                            "name" : "Head Menu",
                            "handle" : "head-menu",
                            "links" : []
                        }];

                        if (!pagesToCreate.length) {
                            pagesToCreate = constants.defaultPages; //hard-coded page object(s)
                        }

                        async.eachSeries(pagesToCreate, function(pageData, callback){
                            self.log.debug('pagesToCreate', pagesToCreate);

                            //push page to website's linkList
                            linkLists[0].links.push({
                                "label" : pageData.pageTitle,
                                "type" : "link",
                                "linkTo" : {
                                    "type" : "page",
                                    "data" : pageData.pageHandle
                                }
                            });

                            //need to insert a blank page and then update it.  This allows us to re-use the updatePage functionality
                            var blankPage = new $$.m.ssb.Page({accountId: accountId, created:created});
                            pageDao.saveOrUpdate(blankPage, function(err, updatedPage){
                                if(err) {
                                    callback(err)
                                } else {
                                    var pageId = updatedPage.id();
                                    self.log.debug('Created a page with id:', pageId);

                                    //if pageData has a template reference from the selected site template's defaultPageTemplates prop then use that
                                    if (pageData.type === 'template') {

                                        self.log.debug("using the siteTemplate's defaultPageTemplates to update a default page");
                                        self.getTemplate(pageData.pageTemplateId, function(err, template) {

                                            if (err) {
                                                return callback(err);
                                            }

                                            var templateObj = template.toJSON();
                                            var page = new $$.m.ssb.Page(templateObj);
                                            page.set('_id', pageId);
                                            page.set('created', created);
                                            page.set('accountId', accountId);
                                            page.set('websiteId', websiteId);
                                            page.set('siteTemplateId', siteTemplateId);
                                            page.set('title', pageData.pageTitle);
                                            page.set('handle', pageData.pageHandle);

                                            if (page.get('handle') === 'index') {
                                                indexPageId = pageId;
                                            }

                                            self.updatePage(accountId, pageId, page, created, function(err, savedPage){
                                                self.log.debug('updated page using siteTemplate data');
                                                callback(err);
                                            });
                                        });

                                    //else error pageData doesn't have template reference
                                    } else {
                                        callback("No template referenced in siteTemplate");
                                    }
                                }
                            });
                        }, function(err){
                            self.log.debug('finished updating pages');

                            //update website's linkLists to match the default pages created
                            website.set('linkLists', linkLists);

                            self.updateWebsite(accountId, websiteId, created, website, function(err, website) {

                                if (err) {
                                    return cb(err);
                                }

                                self.log.debug('finished updating website linkList', website.get('linkLists'));

                                //finally done...
                                cb(err, indexPageId);
                            });

                        });

                    });
                } else {
                    self.log.debug('Skipping page creation');
                    cb(null);
                }

            }
        ], function done(err, indexPageId){
            //Note: [Jack] I added id of index page so we know where to send user when we get the response
            self.log.debug('<< setSiteTemplate');

            var responseObj = {
                ok: true
            }

            if (indexPageId) {
                responseObj.indexPageId = indexPageId;
            }

            fn(err, responseObj);
        });

    }
};
