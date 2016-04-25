


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
var cheerio = require('cheerio');
//TODO: update pageCacheManager for life in an SB-only world
var pageCacheManager = require('../cms/pagecache_manager');

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
                self.log.debug('<< getTemplate', template);
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
                var dereferencedSections = [];

                if (!template.get('ssb') && template.get('config').components.length) {
                    sections = self.transformComponentsToSections(template.get('config').components);
                }

                async.eachSeries(sections, function(section, callback){

                    //if template uses section references instead of full section data
                    if (section._id && Object.keys(section).length === 1) {

                        //then we'll get the reference and set the section data, changing out id's and keeping a ref
                        self.log.debug('createPage->createSections: use ref instead of creating new');

                        sectionDao.getById(section._id, $$.m.ssb.Section, function(err, referencedSection){
                            if(err) {
                                callback(err);
                            } else {
                                self.log.debug('referencedSection', referencedSection);
                                var id = $$.u.idutils.generateUUID();
                                if(referencedSection)
                                {
                                    var s = section;
                                    var refId = s._id;
                                    s = referencedSection.toJSON();
                                    s.ref = refId;
                                    s._id = id;
                                    s.anchor = id;
                                    s.accountId = accountId;
                                    self.log.debug('new dereferenced', s);
                                }
                                else{
                                    section._id = id;
                                    section.anchor = id;
                                    section.accountId = accountId;
                                }
                                dereferencedSections.push(s);
                                callback();
                            }
                        });

                    } else {
                        var id = $$.u.idutils.generateUUID();
                        section._id = id;
                        section.anchor = id;
                        section.accountId = accountId;
                        dereferencedSections.push(section);
                        callback();
                    }

                }, function(err){

                    if(err) {
                        self.log.error("Error getting template's referenced sections:", err);
                        cb(err);
                    }

                    sectionDao.saveSections(dereferencedSections, function(err, sectionAry){
                        if(err) {
                            self.log.error('Error saving default sections:', err);
                            cb(err);
                        } else {
                            cb(null, website, theme, template, sectionAry);
                        }
                    });

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
            function getGlobalSections(website, theme, template, sections, header, footer, cb){
                var query = {
                    accountId:accountId,
                    global:true
                };
                sectionDao.findMany(query, $$.m.ssb.Section, function(err, gsections){
                    if(err) {
                        self.log.error('Error finding global sections:', err);
                        cb(err);
                    } else {
                        var latestSections = self.getLatestSections(gsections);
                        cb(null, website, theme, template, sections, header, footer, latestSections);
                    }
                });
            },
            function createPage(website, theme, template, sections, header, footer, gsections, cb){
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
                   if(gsections){
                        gsections = _.filter(gsections, function(section){
                            if(section.get('name') !== 'Header') {
                               return true;
                            }
                        });
                    }

                }



                if(footer) {
                    //find and remove the default footer
                    sections = _.filter(sections, function(section){
                        if(section.get('name') !== 'Footer') {
                            return true;
                        }
                    });

                    if(gsections){
                        gsections = _.filter(gsections, function(section){
                            if(section.get('name') !== 'Footer') {
                               return true;
                            }
                        });
                    }
                }
                _.each(sections, function(section){
                    jsonSections.push(section.toReference());
                });

                if(gsections){
                    _.each(gsections, function(section){
                        jsonSections.push(section.toReference());
                    });
                }
                if(footer) {
                    jsonSections.push(footer.toReference());
                }
                // Get unique sections

               var pageSections = _.uniq(jsonSections, function(section) { return section._id });

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
                    sections: pageSections,
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
            },
            function addLinkToNav(page, sections, cb){
                self.getWebsiteLinklistsByHandle(accountId, page.get('websiteId'),"head-menu",function(err,list){
                    if(err) {
                        self.log.error('Error getting website linklists by handle: ' + err);
                        cb(err);
                    } else {
                        var link={
                            label: page.get('menuTitle') || page.get('title'),
                            type: "link",
                            linkTo: {
                                type:"page",
                                data:page.get('handle')
                            }
                        };
                        list.links.push(link);
                        self.updateWebsiteLinklists(accountId, page.get('websiteId'),"head-menu",list,function(err, linkLists){
                            if(err) {
                                self.log.error('Error updating website linklists by handle: ' + err);
                                cb(err);
                            } else {
                                self.log.debug('<< createPage');
                                cb(null, page, sections);
                            }
                        });
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

    createDuplicatePage: function(accountId, page, created, fn) {
        var self = this;
        self.log.debug('>> createDuplicatePage');

        var pageHandle = slug(page.get('handle')) +  '-' + $$.u.idutils.generateUniqueAlphaNumeric(5, true, true);
        var sections = page.get('sections');

        page.set('_id', null);
        page.set('handle', pageHandle);
        page.set('title', page.get('title') + ' (copy)');
        page.set('created', created);
        page.set('modified', created);
        page.set('ssb', true);

        //reset all section _id's for duplicate page
        if (sections.length) {
            sections = sections.map(function(section) {
                var id = $$.u.idutils.generateUUID();
                section._id = id;
                section.anchor = id;
                return section;
            });
        }

        async.waterfall([
            function createSections(cb){
                sectionDao.saveSections(sections, function(err, sectionAry){
                    if(err) {
                        self.log.error('Error saving duplicate page sections:', err);
                        cb(err);
                    } else {
                        var jsonSections = [];
                        _.each(sectionAry, function(section){
                            jsonSections.push({_id: section.id()});
                        });

                        page.set('sections', jsonSections);

                        cb(null, page);
                    }
                });
            },
            function createPage(page, cb){
                pageDao.saveOrUpdate(page, function(err, value){
                    if(err) {
                        self.log.error('Error creating page:', err);
                        cb(err);
                    } else {
                        cb(null, value);
                    }
                });
            },
            function addLinkToNav(page, cb){
                self.getWebsiteLinklistsByHandle(accountId, page.get('websiteId'),"head-menu",function(err,list){
                    if(err) {
                        self.log.error('Error getting website linklists by handle: ' + err);
                        cb(err);
                    } else {
                        var link={
                            label: page.get('menuTitle') || page.get('title'),
                            type: "link",
                            linkTo: {
                                type:"page",
                                data:page.get('handle')
                            }
                        };
                        list.links.push(link);
                        self.updateWebsiteLinklists(accountId, page.get('websiteId'),"head-menu",list,function(err, linkLists){
                            if(err) {
                                self.log.error('Error updating website linklists by handle: ' + err);
                                cb(err);
                            } else {
                                self.log.debug('<< createPage');
                                cb(null, page);
                            }
                        });
                    }
                });
            }
        ], function done(err, page){
            if(err) {
                fn(err, null);
            } else {
                self.log.debug('<< createDuplicatePage');
                fn(null, page);
            }
        });
    },

    deletePage: function(pageId, accountId, fn) {
        var self = this;

        self.log.debug('>> deletePage');

        pageDao.getPageById(accountId, pageId, function(err, page) {
            if (page) {
                self.getWebsiteLinklistsByHandle(accountId, page.get('websiteId'), "head-menu", function(err, list) {
                    if (err) {
                        self.log.error('Error getting website linklists by handle: ' + err);
                        fn(err, value);
                    } else {
                        if(list && list.links){
                            self.getUpdatedWebsiteLinkList(list, page.get("handle"), true, function(err, updatedList){
                                list = updatedList;
                            })
                        }
                        self.updateWebsiteLinklists(accountId, page.get('websiteId'), "head-menu", list, function(err, linkLists) {
                            if (err) {
                                self.log.error('Error updating website linklists by handle: ' + err);
                                fn(err, page);
                            } else {
                                var query = {};
                                query._id = new RegExp('' + pageId + '(_.*)*');
                                pageDao.removeByQuery(query, $$.m.ssb.Page, function(err, value){
                                    if (err) {
                                        self.log.error('Error deleting page with id [' + pageId + ']: ' + err);
                                        fn(err, null);
                                    } else {
                                        pageDao.removePublishedPage(accountId, pageId, function(err){});
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
                pageDao.removeByQuery(query, $$.m.ssb.Page, function(err, value){
                    if (err) {
                        self.log.error('Error deleting page with id [' + pageId + ']: ' + err);
                        fn(err, null);
                    } else {
                        pageDao.removePublishedPage(accountId, pageId, function(err){});
                        self.log.debug('<< deletePage');
                        fn(null, value);
                   }
                });
            }
        })
    },

    updateWebsiteLinklists: function(accountId, websiteId, handle, linklist, fn) {
        var self = this;
        self.log.debug('>> updateWebsiteLinklists');

        websiteDao.getWebsiteById(accountId, websiteId, function(err, website){
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
                    websiteDao.saveOrUpdate(website, function(err, value){
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

    getUpdatedWebsiteLinkList: function(list, handle, deletePage, fn){
        var self = this;

        var linkList = list.links.filter(function (lnk) {
        return lnk.type === 'link' &&
             lnk.linkTo && deletePage ? (lnk.linkTo.data === handle || lnk.linkTo.page === handle) : lnk.linkTo && lnk.linkTo.data === handle
        })
        if(linkList){
            _.each(linkList, function(link){
                var _index = list.links.indexOf(link);
                if(_index > -1)
                    list.links.splice(_index, 1);
            });
        }
        self.log.debug('>> updatedLinkList is' + list );
        fn(null, list);
    },

    getWebsiteLinklistsByHandle: function(accountId, websiteId, handle, fn) {
        var self = this;
        self.log.debug('>> getWebsiteLinklistsByHandle(' + websiteId + ',' + handle + ')');

        websiteDao.getWebsiteById(accountId, websiteId, function(err, website){
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

                pages.sort(function (a, b) {
                    var p1 = a.attributes.handle.toLowerCase();
                    var p2 = b.attributes.handle.toLowerCase();

                    if (p1 > p2) return 1;
                    if (p2 > p1) return -1;

                    return 0;
                });

                return fn(null, pages);
            }
        });
    },

    listPublishedPages: function(accountId, websiteId, fn) {
        var self = this;
        self.log.debug('>> listPublishedPages');
        var query = {accountId:accountId, websiteId:websiteId, latest:true};
        pageDao.findPublishedPages(query, function(err, pages){
            if(err) {
                self.log.error('Error getting published pages:', err);
                return fn(err);
            } else {
                //handle legacy pages without sections
                _.each(pages, function(page){
                    if(page.get('sections') === null || page.get('sections').length===0) {
                        var section = {};
                        var sections = [];
                        section.components = page.get('components');
                        section.ssb = false;
                        sections.push(section);
                        page.set('sections', sections);
                    }
                });
                self.log.debug('<< listPublishedPages');
                return fn(err, pages);
            }
        });
    },

    listPagesWithSections: function(accountId, websiteId, fn) {
        var self = this;
        self.log.debug('>> listPagesWithSections');
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
                    self.log.debug('<< listPagesWithSections');
                    return fn(err, pages);
                });

            }
        });
    },

    /**
     * Assumes lastest PUBLISH version
     * @param accountId
     * @param pageId
     * @param fn
     */
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
                    page.set('sections', _.compact(sectionAry));
                    self.log.debug('<< getPage');
                    return fn(null, page);
                });

            }
        });
    },

    /**
     * This just needs to get by _id because version is encoded in _id
     */
    getPageByVersion: function(accountId, pageId, fn) {
        var self = this;
        self.log.debug('>> getPageByVersion');
        var query = {
            _id: pageId,
            accountId:accountId
        };
        pageDao.findOne(query, $$.m.ssb.Page, function(err, page){
            if(err || !page) {
                self.log.error('Error getting page:', err);
                return fn(err, null);
            } else {
                var sections = page.get('sections') || [];
                sectionDao.dereferenceSections(sections, function(err, sectionAry){
                    page.set('sections', _.compact(sectionAry));
                    self.log.debug('<< getPageByVersion');
                    return fn(null, page);
                });

            }
        });
    },

    /**
     * Assumes lasted PUBLISH version
     * @param accountId
     * @param handle
     * @param websiteId
     * @param fn
     */
    getPageByHandle: function(accountId, handle, websiteId, fn) {
        var self = this;
        self.log.debug('>> getPageByHandle (' + accountId + ',' + handle + ',' + websiteId + ')');
        //TODO: Add status
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

    /**
     * Gets latest draft page
     */
    getDraftPage: function() {
        //TODO: this
    },

    /**
     * Gets latest draft page
     */
    getDraftPageByHandle: function() {
        //TODO: this
    },

    getPageVersions: function(pageId, version, fn) {
        var self = this;
        self.log.debug('>> getPageVersions');

        var query = {};
        if(version === 'all') {
            query._id = new RegExp('' + pageId + '.*');
        } else if(version === 'latest'){
            query._id = pageId;
        } else {
            query = {$or: [{_id: pageId + '_' + version},{_id: pageId}]};
        }

        pageDao.findMany(query, $$.m.ssb.Page, function(err, list){
            if(err) {
                self.log.error('Error getting pages by version: ' + err);
                return fn(err, null);
            } else {
                if(version !== 'all' && version !== 'latest') {
                    var filteredList = [];
                    _.each(list, function(page){
                        if(page.get('version') === version) {
                            filteredList.push(page);
                        }
                    });
                    list = filteredList;
                }
                self.log.debug('<< getPageVersions');
                return fn(null, list);
            }
        });

    },

    revertPage: function(accountId, pageId, version, userId, fn) {
        var self = this;
        self.log.debug('>> revertPage [' + pageId + ']');

        self.getPageVersions(pageId, version, function(err, pageAry){
            if(err || pageAry === null) {
                self.log.error('Error finding version of page: ' + err);
                return fn(err, null);
            }
            var targetObj = pageAry[0];
            var modified = {date: new Date(), by: userId};
            targetObj.set('created', modified);
            targetObj.set('modified', modified);
            var pageId = targetObj.id().replace(/\_.*/g, '');
            targetObj.set('_id', pageId);
            self.getPageVersions(pageId, 'latest', function(err, latestPageAry){
                if(err || pageAry === null) {
                    self.log.error('Error finding version of page: ' + err);
                    return fn(err, null);
                }
                var latestPage = latestPageAry[0];
                var latestVersion = latestPage.get('version');
                var newVersion = latestVersion + 1;
                targetObj.set('version', newVersion);
                targetObj.set('latest', true);


                pageDao.saveOrUpdate(targetObj, function(err, savedPage){
                    if(err) {
                        self.log.error('Error saving new version:', err);
                        return fn(err);
                    } else {
                        latestPage.set('_id', pageId + '_' + latestVersion);
                        latestPage.set('latest', false);
                        pageDao.saveOrUpdate(latestPage, function(err, latestPageSaved){
                            if(err) {
                                self.log.error('Error saving prior vrsion:', err);
                                return fn(err, savedPage);
                            } else {
                                self.log.debug('<< revertPage');
                                return fn(null, savedPage);
                            }
                        });
                    }
                });
            });
        });

    },

    publishPage: function(accountId, pageId, userId, fn) {
        var self = this;
        self.log.debug('>> publishPage');
        async.waterfall([
            function getExistingPage(cb) {
                pageDao.getPageById(accountId, pageId, function(err, page){
                    if(err) {
                        self.log.error('Error getting page:', err);
                        cb(err);
                    } else {
                        cb(null, page);
                    }
                });
            },
            function updatePagePublishedTimestamp(page, cb) {
              page.set('published', {date:new Date(), by: userId});
              pageDao.saveOrUpdate(page, function(err, updatedPage) {
                if (err) {
                  self.log.error('Error page published timestamp update');
                  cb(err);
                } else {
                  cb(null, updatedPage);
                }
              });
            },
            function dereferenceSections(page, cb) {
                sectionDao.dereferenceSections(page.get('sections'), function(err, sections){
                    if(err) {
                        self.log.error('Error dereferencing sections');
                        cb(err);
                    } else {
                        var sectionJSON = [];
                        _.each(sections, function(section){
                            sectionJSON.push(section.toJSON());
                        });
                        page.set('sections', sectionJSON);
                        cb(null, page);
                    }
                });
            },
            function savePublishedPage(page, cb) {
                page.set('published', {date:new Date(), by: userId});
                pageDao.savePublishedPage(page, function(err, publishedPage){
                    if(err) {
                        self.log.error('Error publishing page:', err);
                        cb(err);
                    } else {
                        pageCacheManager.updateS3Template(accountId, null, pageId, function(err, value){
                            if (err) {
                                console.debug('Error on S3 template update in updatePage/savePublishedPage');
                                console.error(err);
                            }
                        });
                        cb(err, publishedPage);
                    }
                });
            },
            function findOtherPagesToUpdate(page, cb) {
                /*
                 * If any of the sections on the published page exist in earlier versions on other pages, we need to
                 *      update their content.
                 */
                var pagesToUpdate = {};
                async.eachSeries(page.get('sections'), function(sectionJSON, callback){
                    var idNoVersion = sectionJSON._id.replace(/_.*/g, "");
                    //'section._id': new RegExp(idNoVersion + '.*')
                    var query = {
                        accountId:accountId,
                        'sections._id': {$regex: '' +idNoVersion + '.*'}
                    };
                    pageDao.findPublishedPages(query, function(err, pages){
                        if(err) {
                            self.log.error('Error finding other published pages:', err);
                            callback(err);
                        } else {
                            _.each(pages, function(page){
                                pagesToUpdate[page.id()] = page;
                            });
                            callback(null);
                        }
                    });
                }, function(err){
                    cb(err, page, pagesToUpdate);
                });
            },
            function updateOtherPages(page, pagesToUpdate, cb) {
                var pagesToUpdateAry = _.values(pagesToUpdate);
                var pageSections = page.get('sections');
                async.eachSeries(pagesToUpdateAry, function(pageToUpdate, callback){
                    var newPageSections = [];
                    _.each(pageToUpdate.get('sections'), function(section){
                        var sectionID = section._id.replace(/_.*/g, "");
                        var updatedSection = _.find(pageSections, function(pageSection){
                            var pageSectionID = pageSection._id.replace(/_.*/g, "");
                            return sectionID === pageSectionID;
                        });
                        if(updatedSection) {
                            newPageSections.push(updatedSection);
                        } else {
                            newPageSections.push(section);
                        }
                    });
                    pageToUpdate.set('sections', newPageSections);
                    pageDao.savePublishedPage(pageToUpdate, function(err, updatedPage){
                        pageCacheManager.updateS3Template(accountId, null, updatedPage.id(), callback);
                    });
                }, function(err){
                    if(err) {
                        self.log.error('Error updating other pages:', err);
                    }
                    cb(err, page);
                });
            }
        ], function done(err, publishedPage){
            if(err) {
                self.log.error('Error in publishPage:', err);
                fn(err);
            } else {
                self.log.debug('<< publishPage');
                fn(null, publishedPage);
            }
        });
    },

    updatePage: function(accountId, pageId, page, modified, homePage, userId, fn) {
        var self = this;
        self.log.debug('>> updatePage (' + pageId + ')');

        page = self.cleanEditorHTML(page);

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
            function getGlobalHeader(existingPage, cb){
                var query = {
                    accountId:accountId,
                    globalHeader:true
                };
                sectionDao.findOne(query, $$.m.ssb.Section, function(err, section){
                    if(err) {
                        self.log.error('Error finding global header:', err);
                        cb(err);
                    } else {
                        cb(null, existingPage, section);
                    }
                });
            },
            function getGlobalFooter(existingPage, globalHeader, cb){
                self.log.info('getGlobalFooter');
                var query = {
                    accountId:accountId,
                    globalFooter:true
                };
                sectionDao.findOne(query, $$.m.ssb.Section, function(err, section){
                    if(err) {
                        self.log.error('Error finding global footer:', err);
                        cb(err);
                    } else {
                        cb(null, existingPage, globalHeader, section);
                    }
                });
            },
            function getExistingSections(existingPage, globalHeader, globalFooter, cb) {
                self.log.info('getExistingSections');
                if(existingPage.hasSectionReferences()) {
                    sectionDao.dereferenceSections(existingPage.get('sections'), function(err, existingSectionAry){
                        if(err) {
                            self.log.error('Error dereferencing existing sections:', err);
                            cb(err);
                        } else {
                            cb(null, existingPage, globalHeader, globalFooter, existingSectionAry);
                        }
                    });
                } else {
                    cb(null, existingPage, globalHeader, globalFooter, existingPage.get('sections'));
                }
            },
            function getNewSections(existingPage, globalHeader, globalFooter, existingSections, cb) {
                self.log.info('getNewSections');
                if(page.hasSectionReferences()) {
                    sectionDao.dereferenceSections(page.get('sections'), function(err, pageSectionAry){
                        if(err) {
                            self.log.error('Error dereferencing page sections:', err);
                            cb(err);
                        } else {
                            page.set('sections', pageSectionAry);
                            cb(null, existingPage, globalHeader, globalFooter, existingSections);
                        }
                    });
                } else {
                    cb(null, existingPage, globalHeader, globalFooter, existingSections);
                }
            },
            function dereferenceSections(existingPage, globalHeader, globalFooter, existingSections, cb) {
                self.log.info('dereferenceSections');
                var sections = page.get('sections');
                var dereferencedSections = [];

                async.eachSeries(sections, function(section, callback){
                    //if we are not working with an object for some reason, fix it.
                    if(!section ||  typeof section.id === 'undefined') {
                        section = new $$.m.ssb.Section(section);
                    }
                    self.log.debug(section.get('name') + ' :: ' + section.get('title'));

                    if (section.get('accountId') === 0 || section.get('accountId')=== null) {
                        var id = $$.u.idutils.generateUUID();
                        section.set('_id', id);
                        section.set('anchor', id);
                    }

                    // section is globalHeader reference and user already has globalHeader in their account's section collection
                    if (section.get('globalHeader') && globalHeader) {
                        self.log.debug('page has globalHeader ref, account has globalHeader');
                        section.set('_id', globalHeader.id());
                        section.set('refId', section.id());
                    }

                    if (section.get('globalFooter') && globalFooter) {
                        self.log.debug('page has globalFooter ref, account has globalFooter');
                        section.set('_id', globalFooter.id());
                        section.set('refId', section.id());
                    }

                    section.set('accountId', accountId);
                    dereferencedSections.push(section);

                    callback();


                }, function(err){

                    if(err) {
                        self.log.error("Error getting template's referenced sections:", err);
                        cb(err);
                    } else {
                        //Callback here so we can do the actual compare/update next:
                        cb(null, existingPage, globalHeader, globalFooter, existingSections, dereferencedSections);
                    }
                });
            },
            function updateSections(existingPage, globalHeader, globalFooter, existingSections, dereferencedSections, cb) {
                /*
                 * For each section in dereferenced, find partner in existing
                 * - if changed:
                 *  -- bump version
                 *  -- update other pages with reference
                 */
                self.log.info('updateSections');
                var otherPagesWithSectionReferences = [];
                async.eachSeries(dereferencedSections, function(section, callback){

                    var existingSection = _.find(existingSections, function(existingSection) {
                        self.log.debug('existing section?', existingSection);
                        if (existingSection && existingSection.id) {
                            return section.id() === existingSection.id()
                        } else {
                            return false
                        }
                    });

                    if(existingSection) {
                        if(!_.isEqual(existingSection, section)){

                            var oldID = section.id();
                            var newVersion = section.getVersion() + 1;
                            section.setVersion(newVersion);
                            section.set('modified', {
                                date: new Date(),
                                by: userId
                            });
                            otherPagesWithSectionReferences.push({
                                pageId: existingPage.id(),
                                oldId: oldID,
                                newId: section.id()
                            });
                            sectionDao.saveOrUpdate(section, function(err, value){
                                if(err) {
                                    self.log.error('Error updating section:', err);
                                    callback(err);
                                } else {
                                    callback();
                                }
                            });

                        } else {
                            //no change.
                            callback();
                        }
                    } else {
                        //this is a new section...
                        sectionDao.saveOrUpdate(section, function(err, value){
                            if(err) {
                                self.log.error('Error updating section:', err);
                                callback(err);
                            } else {
                                callback();
                            }
                        });
                    }
                }, function done(err){
                    if(err) {
                        self.log.error('Error updating sections:', err);
                        cb(err);
                    } else {
                        cb(null, existingPage, dereferencedSections, otherPagesWithSectionReferences);
                    }
                });

            },
            function updateOtherPagesWithSectionReferences(existingPage, updatedSections, otherPagesWithSectionReferences, cb) {
                self.log.info('updateOtherPagesWithSectionReferences');
                async.eachSeries(otherPagesWithSectionReferences, function(obj, callback){
                    var pageId = obj.pageId;
                    var oldId = obj.oldId;
                    var newId = obj.newId;
                    var query = {pageId:{$ne:pageId}, 'sections._id':oldId};
                    pageDao.findMany(query, $$.m.ssb.Page, function(err, pages){
                        if(err) {
                            self.log.error('Error finding pages with section reference:', err);
                            callback(err);
                        } else {
                            async.eachSeries(pages, function(page, _callback){
                                _.each(page.get('sections'), function(section){
                                    if(section._id === oldId) {
                                        section._id = newId;
                                    }
                                });
                                pageDao.saveOrUpdate(page, function(err, value){
                                    _callback(err);
                                });
                            }, function(err){
                                if(err) {
                                    self.log.error('Error updating page:', err);
                                    callback(err);
                                } else {
                                    callback();
                                }
                            });
                        }
                    });
                }, function(err){
                    if(err) {
                        self.log.error('Error updating other pages:', err);
                        cb(err);
                    } else {
                        cb(null, existingPage, updatedSections);
                    }
                });
            },
            function incrementPageVersion(existingPage, updatedSections, cb) {
                self.log.info('incrementPageVersion');
                //TODO: this is a problem if we are not updating the latest.
                var currentVersion = existingPage.get('version') || 0;
                var newVersion = currentVersion + 1;
                existingPage.set('latest', false);
                existingPage.set('_id', existingPage.id() + '_' + currentVersion);
                pageDao.saveOrUpdate(existingPage, function(err, value){
                    if(err) {
                        self.log.error('Error saving existing page with new id:', err);
                        cb(err);
                    } else {
                        cb(null, value, updatedSections, newVersion);
                    }
                });

            },
            function updateThePage(existingPage, updatedSections, newVersion, cb){
                self.log.info('updateThePage');
                //var sections = page.get('sections');
                page.set('modified', modified);
                var jsonSections = [];
                _.each(updatedSections, function(section){
                    jsonSections.push({_id: section.id()});
                });
                page.set('sections', jsonSections);
                page.set('created', existingPage.get('created'));
                page.set('latest', true);
                page.set('version', newVersion);
                pageDao.saveOrUpdate(page, function(err, updatedPage){
                    if(err) {
                        self.log.error('Error updating page:', err);
                        cb(err);
                    } else {
                        cb(null, existingPage, updatedPage, updatedSections);
                    }
                });
            },
            /*
             * We need to keep around unreferenced sections for reverts.
            function deleteRemovedSections(existingPage, updatedPage, updatedSections, cb){
                self.log.info('deleteRemovedSections');
                var updatedSectionIDs =_.map(updatedSections, function(section){
                    return section.id();
                });
                self.log.debug('updatedSectionIDs:', updatedSectionIDs);
                var sectionsToBeDeleted = [];

                 // If the updatedPage does not have a section with the same
                 // ID as the existing page's section, it must be deleted

                _.each(existingPage.get('sections'), function(section){
                    if(!_.contains(updatedSectionIDs, section._id)) {
                        sectionsToBeDeleted.push(section);
                    }
                });

                async.each(sectionsToBeDeleted, function(section, callback){
                    sectionDao.removeById(section._id, $$.m.ssb.Section, function(err, value){
                        callback(err);
                    });
                }, function done(err){
                    if(err) {
                        self.log.error('Error removing section:', err);
                    }
                    cb(null, existingPage, updatedPage, updatedSections);
                });
            },
            */
            function setAsHomePage(existingPage, updatedPage, updatedSections, cb){
                self.log.info('setAsHomePage');
                if (updatedPage && updatedPage.get("handle") !=='index' && homePage) {
                    self.getPageByHandle(accountId, 'index', updatedPage.get('websiteId'), function(err, page) {
                        if (err) {
                            self.log.error('Error getting index page: ' + err);
                            cb(err);
                        } else {
                            self.log.debug('<< check for index page');
                            if(page){
                                page.set("handle", "index-old-" + new Date().getTime() );
                                var visibility = page.get("visibility");
                                visibility.visible = false;
                                page.set("visibility", visibility );
                                pageDao.saveOrUpdate(page, function(err, value){
                                    if (err) {
                                        self.log.error('Error updating page with id [' + page.get("_id") + ']: ' + err);
                                        cb(err);
                                    } else {
                                            self.getWebsiteLinklistsByHandle(accountId, page.get('websiteId'), "head-menu", function(err, list) {
                                            if (err) {
                                                self.log.error('Error getting website linklists by handle: ' + err);
                                                cb(err);
                                            } else {
                                                    list.links = _(list.links).chain()
                                                    .map(function(link){
                                                        if(link.linkTo && link.linkTo.data === "index"){
                                                            link.linkTo.data = page.get("handle");
                                                        }
                                                        return link
                                                    })
                                                    .uniq(function(link) {
                                                        return link.linkTo;
                                                    })
                                                    .value();
                                                    self.updateWebsiteLinklists(accountId, updatedPage.get('websiteId'), "head-menu", list, function(err, linkLists) {
                                                        if (err) {
                                                            self.log.error('Error updating website linklists by handle: ' + err);
                                                            cb(err);
                                                        } else {
                                                            updatedPage.set("handle", 'index');
                                                            pageDao.saveOrUpdate(updatedPage, function(err, updatedPage){
                                                                if(err) {
                                                                    self.log.error('Error updating page:', err);
                                                                    cb(err);
                                                                } else {
                                                                    cb(null, existingPage, updatedPage, updatedSections);
                                                                }
                                                            });
                                                        }
                                                    });
                                            }
                                        });
                                    }
                                });
                            } else {
                                self.log.debug('<< no index page found');
                                updatedPage.set("handle", 'index');
                                pageDao.saveOrUpdate(updatedPage, function(err, updatedPage){
                                    if(err) {
                                        self.log.error('Error updating page:', err);
                                        cb(err);
                                    } else {
                                        cb(null, existingPage, updatedPage, updatedSections);
                                    }
                                });
                            }
                        }
                    });
                }
                else{
                    cb(null, existingPage, updatedPage, updatedSections);
                }
            },
            function listPages(existingPage, updatedPage, updatedSections, cb){
                self.log.info('listPages');
                self.listPages(accountId, updatedPage.get('websiteId'), function(err, pages){
                    if (err) {
                        self.log.error('Error getting index page: ' + err);
                        cb(err);
                    }
                    else{
                        cb(null, existingPage, updatedPage, updatedSections, pages);
                    }
                })
            },
            function updateLinkList(existingPage, updatedPage, updatedSections, pages, cb){
                self.log.info('updateLinkList');
                if (updatedPage.get('mainmenu') === false) {
                    self.getWebsiteLinklistsByHandle(accountId, updatedPage.get('websiteId'), "head-menu", function(err, list) {
                        if (err) {
                            self.log.error('Error getting website linklists by handle: ' + err);
                            cb(err);
                        } else {
                            if(list && list.links){
                                self.getUpdatedWebsiteLinkList(list, existingPage.get("handle"), false, function(err, updatedList){
                                    list = updatedList;
                                })
                            }
                            self.updateWebsiteLinklists(accountId, updatedPage.get('websiteId'), "head-menu", list, function(err, linkLists) {
                                if (err) {
                                    self.log.error('Error updating website linklists by handle: ' + err);
                                    cb(err);
                                } else {
                                   cb(null, updatedPage, updatedSections, pages);
                                }
                            });
                        }
                    });
                } else {
                    self.getWebsiteLinklistsByHandle(accountId, updatedPage.get('websiteId'), "head-menu", function(err, list) {
                        if (err) {
                            self.log.error('Error getting website linklists by handle: ' + err);
                            cb(err);
                        } else if(!list){
                            self.log.debug('No link lists for this handle.');
                            cb(null, updatedPage, updatedSections, pages);
                        } else {


                            var pageHandles = pages.map(function(page) {
                                if (page.mainmenu || page.mainmenu === undefined) {
                                    return page.get('handle');
                                }
                            });

                            var _exists = false;
                            list.links = _(list.links).chain()
                                .map(function(link){
                                    if(link.linkTo && (link.linkTo.type === 'home' || link.linkTo.type === 'page') && link.linkTo.data === existingPage.get('handle')){
                                        // check if menu title exists
                                        var _label = updatedPage.get('menuTitle');
                                        // check if menu title not exists and page title is changed
                                        if(!_label){
                                           _label = updatedPage.get('title');
                                        }
                                        link.label = _label;
                                        link.linkTo.data = updatedPage.get("handle");
                                        _exists = true;
                                    }
                                    else if(link.linkTo && (link.linkTo.type === 'section') && link.linkTo.page === existingPage.get('handle')){
                                        link.linkTo.page = updatedPage.get("handle");
                                    }
                                    return link
                                })
                                .uniq(function(link) {
                                    return link.linkTo;
                                })
                                .filter(function(link){
                                    //only keep pages that exist and are visible in menu
                                    if(link.linkTo.type === 'section' && link.linkTo.page){
                                        return _.contains(pageHandles, link.linkTo.page)
                                    }
                                    else if(link.linkTo.type === 'page' || link.linkTo.type === 'home'){
                                        return _.contains(pageHandles, link.linkTo.data)
                                    }
                                    else{
                                        return true;
                                    }
                                })
                                .value(); //return array value

                            if(!_exists){
                                var link = {
                                    label: page.get('menuTitle') || page.get('title'),
                                    type: "link",
                                    linkTo: {
                                        type:"page",
                                        data:page.get('handle')
                                    }
                                };
                                list.links.push(link);
                            }

                            self.updateWebsiteLinklists(accountId, updatedPage.get('websiteId'), "head-menu", list, function(err, linkLists) {
                                if (err) {
                                    self.log.error('Error updating website linklists by handle: ' + err);
                                    cb(err);
                                } else {
                                    cb(null, updatedPage, updatedSections, pages);
                                }
                            });
                        }
                    });
                }
            },
            // update existing pages if global sections set as true OR false
            function updateExistingPages(updatedPage, updatedSections, pages, cb){
                self.log.info('updateExistingPages');
                var _update = false;
                self.rejectSystemPages(pages, function(err, filteredPages) {
                    pages = filteredPages;
                });
                if(pages.length <= 1){
                    cb(null, updatedPage, updatedSections);
                } else {
                    /*
                     * The following section could stand some refactoring for clarity.
                     */
                    async.eachSeries(pages, function(_page, p_callback){
                        //loop through each page NOT being updated
                        if(_page.get("_id") !== updatedPage.get("_id")){
                            //loop through each section on page being updated
                            async.each(updatedSections, function(gsection, g_callback){
                                var g_update = false;
                                if(gsection.get("global") === false || gsection.get("global") === true){
                                    _update = true;
                                    if(gsection.get("global") === false){
                                        //if the current section is NOT global but IS found on another page, remove it?
                                        var sections = _.filter(_page.get("sections"), function(section){
                                            if(section._id !== gsection.get("_id")) {
                                                return true;
                                            }
                                        });
                                        _page.set("sections", sections);
                                    }
                                    if(gsection.get("global") === true){
                                        g_update = true;
                                        var sections = _page.get("sections");
                                        //look through the sections on this page to any whose _id matches the global section
                                        //TODO: match irrespective of version
                                        var exists = _.filter(sections, function(section) { return gsection.get("_id").indexOf(section._id) !== -1; });
                                        self.log.debug('exists: ' , exists);
                                        if(!exists.length){// if the global section does NOT already appear on the page
                                            var globalSection = {_id: gsection.get("_id")};
                                            var globalSectionID = gsection.id();
                                            var sectionIds = sections.map(function(sec) { return sec._id});
                                            /*
                                             * If the global section name === "Header" put it at the top.
                                             * If the global section name === "Footer" put it at the bottom.
                                             * Otherwise... stick it above the footer?
                                             */
                                            if(gsection.get('name') === 'Header') {
                                                //replace existing header if it exists
                                                var query = {
                                                    accountId:accountId,
                                                    _id:{$in:sectionIds},
                                                    name:'Header'
                                                }
                                                sectionDao.findOne(query, $$.m.ssb.Section, function(err, existingHeaderSection){
                                                    if(err) {
                                                        self.log.error('Error finding global header:', err);
                                                        g_callback(err);
                                                    } else {
                                                        if(existingHeaderSection) {
                                                            var headerIDtoRemove = _.findWhere(sections, {_id:existingHeaderSection.id()});
                                                            if(headerIDtoRemove) {
                                                                var headerIndex = _.indexOf(sections, headerIDtoRemove);
                                                                sections.splice(headerIndex, 1, globalSection);
                                                            } else {
                                                                self.log.warn('The DB says we have a header but we could not find it on the page');
                                                                sections.splice(0,0, globalSection);
                                                            }
                                                        } else {
                                                            sections.splice(0,0, globalSection);
                                                        }
                                                        _page.set("sections", sections);
                                                        g_callback();
                                                    }
                                                });
                                            } else if(gsection.get('name') === 'Footer') {
                                                //replace existing footer if it exists
                                                var query = {
                                                    accountId:accountId,
                                                    _id: { $in: sectionIds},
                                                    name: 'Footer'
                                                };
                                                sectionDao.findOne(query, $$.m.ssb.Section, function(err, footerSection){
                                                    if(err) {
                                                        self.log.error('Error finding global footer:', err);
                                                        g_callback(err);
                                                    } else {
                                                        if(footerSection) {
                                                            var filteredFooter = _.findWhere(sections, {
                                                                _id: footerSection.get("_id")
                                                            });

                                                            if(filteredFooter) {
                                                                var footerIndex = _.indexOf(sections, filteredFooter);
                                                                self.log.debug('footerIndex: ' , footerIndex);
                                                                self.log.debug('globalSection: ' , globalSection);
                                                                //TODO: this may need to be (footerIndex,1,globalSection) to overwrite
                                                                sections.splice(footerIndex, 0, globalSection);
                                                            } else {
                                                                sections.push(globalSection);
                                                            }

                                                        } else{
                                                            sections.push(globalSection);
                                                        }
                                                        _page.set("sections", sections);
                                                        g_callback();
                                                    }
                                                });
                                            } else {
                                                //put it above the footer
                                                var query = {
                                                    accountId:accountId,
                                                    _id: { $in: sectionIds},
                                                    name: 'Footer'
                                                };
                                                sectionDao.findOne(query, $$.m.ssb.Section, function(err, footerSection) {
                                                    if (err) {
                                                        self.log.error('Error finding global footer:', err);
                                                        g_callback(err);
                                                    } else {
                                                        if(footerSection) {
                                                            //TODO: fix this so sectionIDs match regardless of version
                                                            var filteredFooter = _.filter(sections, function(section) { return footerSection.get("_id").indexOf(section._id) !== -1; });

                                                            filteredFooter = filteredFooter.length ? filteredFooter[0] : null;

                                                            if(filteredFooter) {
                                                                var footerIndex = _.indexOf(sections, filteredFooter);
                                                                self.log.debug('footerIndex: ' , footerIndex);
                                                                self.log.debug('globalSection: ' , globalSection);
                                                                sections.splice(footerIndex, 0, globalSection);
                                                            } else {
                                                                sections.push(globalSection);
                                                            }

                                                        } else{
                                                            sections.push(globalSection);
                                                        }
                                                        _page.set("sections", sections);
                                                        g_callback();
                                                    }
                                                });
                                            }
                                        } else {
                                            _page.set("sections", sections);
                                            g_callback();
                                        }

                                    }
                                    //FIXME: What happens if g_update==true?  where is the cb executed?
                                    if(!g_update){
                                        g_callback();
                                    }
                                } else{
                                    g_callback();
                                }

                            }, function(err){

                                if(err) {
                                    self.log.error("Error getting template's referenced sections:", err);
                                    p_callback(err);
                                } else {
                                    p_callback();
                                }
                            });
                        } else {
                            p_callback();
                        }
                    }, function(err){
                        if(err) {
                            self.log.error("Error getting template's referenced sections:", err);
                            cb(err);
                        } else {
                            if(_update){
                                pageDao.batchUpdate(pages, $$.m.ssb.Page, function(err, value){
                                    if (err) {
                                        self.log.error('Error updating page: ' + err);
                                        cb(err);
                                    } else {
                                        cb(null, updatedPage, updatedSections);
                                    }
                                });
                            } else {
                                cb(null, updatedPage, updatedSections);
                            }
                        }
                    });
                }



            }
        ], function done(err, updatedPage, updatedSections){
            self.log.info('done');
            if(updatedPage) {
                var sectionArray = [];

                _.each(updatedSections, function(section){
                    sectionArray.push(section.toJSON());
                });
                updatedPage.set('sections', sectionArray);

            }
            self.log.debug('<< updatePage');
            fn(err, updatedPage);
        });
    },

    rejectSystemPages: function(pages, fn){
        var routeHandles = ['signup', 'single-post', 'blog'];
        var filteredPages = _.reject(pages, function(page){ return page.get("handle") === "blog" || page.get("handle") === "single-post" || page.get("handle") === "signup" });
        return fn(null, filteredPages);
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
            title: 1,
            version: 1
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
        self.log.debug('query: ', query);
        sectionDao.findOne(query, $$.m.ssb.Section, function(err, section){
            if(err || !section) {
                self.log.error('Error getting section:', err);
                self.log.error('Error getting section:', sectionId);
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
                                                callback(err);
                                            } else {
                                                var templateObj = template.toJSON();
                                                var page = new $$.m.ssb.Page(templateObj);
                                                page.set('_id', pageId);
                                                page.set('created', created);
                                                page.set('accountId', accountId);
                                                page.set('websiteId', websiteId);
                                                page.set('siteTemplateId', siteTemplateId);
                                                page.set('title', pageData.pageTitle);
                                                page.set('handle', pageData.pageHandle);
                                                //reset each section id and accountId
                                                /*
                                                 * The sections Array is an array of section References that belong to the site template.
                                                 * We need to make a copy of these sections for the page.
                                                 */
                                                self._copySectionsForAccount(page.get('sections'), accountId, function(err, sectionRefAry){
                                                    if(err) {
                                                        callback(err);
                                                    } else {
                                                        page.set('sections', sectionRefAry);
                                                        if (page.get('handle') === 'index') {
                                                            indexPageId = pageId;
                                                        }

                                                        self.updatePage(accountId, pageId, page, created, null, created.by, function(err, savedPage){
                                                            self.log.debug('updated page using siteTemplate data');
                                                            callback(err);
                                                        });
                                                    }
                                                });
                                            }
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
                                    cb(err);
                                } else {
                                    self.log.debug('finished updating website linkList', website.get('linkLists'));
                                    //finally done...
                                    cb(err, indexPageId);
                                }
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

    },

    _copySectionsForAccount: function(sectionRefAry, accountId, fn) {
        var self = this;
        /*
         * 1. Deferenece the sections
         * 2. Change accountId
         * 3. Change ID and Anchor
         * 4. Save
         * 5. Return array of new ID references
         */

        async.waterfall([
            function(cb) {
                sectionDao.dereferenceSections(sectionRefAry, cb);
            },
            function(dereffedSections, cb) {
                _.each(dereffedSections, function(section){
                    var id = $$.u.idutils.generateUUID();
                    section.set('accountId', accountId);
                    section.set('_id', id);
                    section.set('anchor', id);
                });
                sectionDao.saveSectionObjects(dereffedSections, cb);
            },
            function(savedSections, cb) {
                var refAry = [];
                _.each(savedSections, function(section){
                    refAry.push(section.toReference());
                });
                cb(null, refAry);
            }
        ], function done(err, sectionRefAry){
            fn(err, sectionRefAry);
        });
    },

    /**
     * Remove helper classes and attributes from editor markup
     *
     * - get page sections
     * - call processHTML on each component
     * - processHTML recurses through data where we might have HTML
     * - if item looks like it would be HTML markup, remove the stuff
     * - save "clean" sections back onto page
     */
    cleanEditorHTML: function(page) {
        var sections = page.get('sections');
        var classesToRemove = 'ng-scope ssb-theme-btn-active-element';
        var attributesToRemove = 'data-compiled';
        var ignoreKeys = ['_id'];

        function processHTML(dataObject) {

            return _.each(dataObject, function(value, key, obj) {

                var isString = typeof value === 'string';
                var isGoodKey = ignoreKeys.indexOf(key) === -1;

                if (isString && isGoodKey) {

                    // $$$ = cheerio.load(value);
                    var $$$ = cheerio.load('<div id="temp_wrap"></div>');
                    $$$('#temp_wrap').append(value);
                    var $classSelection = $$$(classesToRemove.split(' ').map(function(c) { return '.' + c }).join(', '));
                    var $attrSelection = $$$(attributesToRemove.split(' ').map(function(a) { return '[' + a + ']'; }).join(', '));
                    var hasClass = $classSelection.length > 0;
                    var hasAttr = $attrSelection.length > 0;

                    // console.log('hasClass', hasClass);
                    // console.log('hasAttr', hasAttr);

                    if (hasClass || hasAttr) {

                        var htmlString = '';

                        // console.log('before ::', $$$('#temp_wrap').html());

                        $$$('#temp_wrap').find('.ssb-theme-btn')
                            .removeClass(classesToRemove)
                            .removeAttr(attributesToRemove);
                        // console.log('after ::', $$$('#temp_wrap').html());

                        htmlString = $$$('#temp_wrap').html();

                        if (htmlString.length) {
                            obj[key] = htmlString;
                        }
                    }

                } else if(value !== null && typeof value !== 'boolean' && typeof value !== 'string' && typeof value !== 'number') {

                    processHTML(value);

                }

            });
        }

        _(sections)
            .chain()
            .each(function(section) {
                _(section.components)
                    .chain()
                    .each(processHTML)
                    .value();
            })
            .value();

        if (sections.length) {
            page.set('sections', sections);
        }

        return page;

    },

    getLatestSections: function(sections) {
        var self = this;
        var tmp = {};
        var latest = [];
        var oldVersionsOnPages = [];

        sections.forEach(function(section) {
            var sectionIdWithoutVersion = section.id();
            var lastIndex = section.id().lastIndexOf('_');
            if (lastIndex !== -1) {
                version = parseInt(section.id().slice(lastIndex+1));
                sectionIdWithoutVersion = section.id().replace('_' + version, '');
            }
            tmp[sectionIdWithoutVersion] = tmp[sectionIdWithoutVersion] || [];
            tmp[sectionIdWithoutVersion].push(version);
        });

        Object.keys(tmp).forEach(function(sectionId) {
            var arr;
            arr = tmp[sectionId].filter(function(version, index, self){
                return self.indexOf(version) === index;
            })
            arr.sort(function(a, b) {
                return b - a;
            });
            arr.shift();
            arr.forEach(function(version){
                oldVersionsOnPages.push(sectionId + '_' + version);
            });
        });

        latest = sections.filter(function(section) {
            return oldVersionsOnPages.indexOf(section.id()) === -1;
        });

        return latest;
    }

};
