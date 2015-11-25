


var logger = $$.g.getLogger("cms_manager");
var templateDao = require('./dao/template.dao');
var themeDao = require('./dao/theme.dao');
var websiteDao = require('./dao/website.dao');
var pageDao = require('./dao/page.dao');
var sectionDao = require('./dao/section.dao');
var async = require('async');
var slug = require('slug');

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
        var query = {};
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
        self.log.debug('>> getTheme');
        themeDao.getById(themeId, $$.m.ssb.Theme, function(err, theme){
            if(err) {
                self.log.error('Error getting theme:', err);
                return fn(err, null);
            } else {
                self.log.debug('<< getTheme');
                return fn(null, theme);
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
            function createPage(website, theme, template, sections, cb){
                //TODO: make sure this name is unique
                //var pageName = slug(template.get('name') + '-' + $$.u.idutils.generateUniqueAlphaNumeric(5, true, true));

                var pageHandle = slug(template.get('handle')) +  '-' + $$.u.idutils.generateUniqueAlphaNumeric(5, true, true);
                var pageTitle = template.get('name');




                var jsonSections = [];
                _.each(sections, function(section){
                    jsonSections.push(section.toReference());
                });

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
                    modified:created

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

    getPage: function(accountId, pageId, fn) {
        var self = this;
        self.log.debug('>> getPage');

        pageDao.getPageById(accountId, pageId, function(err, page){
            if(err) {
                self.log.error('Error getting page:', err);
                return fn(err, null);
            } else {
                sectionDao.dereferenceSections(page.get('sections'), function(err, sectionAry){
                    page.set('sections', sectionAry);
                    self.log.debug('<< getPage');
                    return fn(null, page);
                });

            }
        });
    },

    updatePage: function(accountId, pageId, page, modified, fn) {
        var self = this;
        self.log.debug('>> updatePage');

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
            function updateThePage(existingPage, cb){
                var sections = page.get('sections');
                page.set('modified', modified);
                var jsonSections = [];
                _.each(sections, function(section){
                    jsonSections.push(section.toReference());
                });
                page.set('sections', jsonSections);
                page.set('created', existingPage.get('created'));
                pageDao.saveOrUpdate(page, function(err, updatedPage){
                    if(err) {
                        self.log.error('Error updating page:', err);
                        cb(err);
                    } else {
                        cb(null, existingPage, updatedPage);
                    }
                });
            },
            function updateSections(existingPage, updatedPage, cb){
                var sections = page.get('sections');
                //figure out if we need to delete any
                sectionDao.saveSections(sections, function(err, updatedSections){
                    if(err) {
                        self.log.error('Error saving sections:', err);
                        cb(err);
                    } else {
                        cb(null, existingPage, updatedPage, updatedSections);
                    }
                });

            },
            function deleteRemovedSections(existingPage, updatedPage, updatedSections, cb){
                var updatedSections = updatedPage.get('sections');
                var updatedSectionIDs = _.pluck(updatedSections, '_id');
                var sectionsToBeDeleted = [];
                /*
                 * If the updatedPage does not have a section with the same
                 * ID as the existing page's section, it must be deleted
                 */
                _.each(existingPage.get('sections'), function(section){
                    if(!_.contains(updatedSectionIDs, section.id())) {
                        sectionsToBeDeleted.push(section);
                    }
                });
                async.each(sectionsToBeDeleted, function(section, cb){
                    sectionDao.removeById(section.id(), $$.m.ssb.Section, function(err, value){
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
                updatedPage.set('sections', updatedSections);
            }
            self.log.debug('<< updatePage');
            return fn(err, updatedPage);
        });


    }
};
