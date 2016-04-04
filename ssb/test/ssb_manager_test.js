/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */
process.env.NODE_ENV = "testing";
var app = require('../../app');
var manager = require('../ssb_manager');
var dao = require('../dao/page.dao');
var sectionDao = require('../dao/section.dao');
var websiteDao = require('../dao/website.dao');
var async = require('async');
require('../model/section');
require('../model/page');

var _log = $$.g.getLogger("ssb_manager_test");
var testContext = {};
var initialized = false;

//constants for testing
var accountId = 12345;
var userId = 0;

exports.ssb_manager_test = {
    setUp: function (cb) {
        var self = this;
        _log.debug('>> setup');
        if(!initialized) {
            //create our initial page and sections and website
            var website = new $$.m.ssb.Website({
                accountId:accountId,
                linkLists:[]
            });
            var section1 = new $$.m.ssb.Section({
                accountId:accountId,
                name:'Section1',
                title:'Section1'
            });
            var section2 = new $$.m.ssb.Section({
                accountId:accountId,
                name:'Section2',
                title:'Section2'
            });
            var page = new $$.m.ssb.Page({
                accountId:accountId,
                websiteId:'nowebsite',
                handle:'ssb-manager-test',
                title:'Title of the Page',
                sections:[]
            });
            var page2 = new $$.m.ssb.Page({
                accountId:accountId,
                websiteId:'nowebsite',
                handle:'ssb-manager-test2',
                title:'Title of the 2nd Page',
                sections:[]
            });
            async.waterfall([
                function saveWebsite(callback) {
                    websiteDao.saveOrUpdate(website, function(err, savedWebsite){
                        if(savedWebsite) {
                            testContext.website = savedWebsite;
                            page.set('websiteId', savedWebsite.id());
                            page2.set('websiteId', savedWebsite.id());
                        }
                        callback(err);
                    });
                },
                function saveSections(callback) {
                    sectionDao.saveSectionObjects([section1, section2], function(err, value){
                        if(value) {
                            testContext.sections = value;
                        }
                        callback(err, value);
                    });
                },
                function savePages(sections, callback) {
                    var sectionRefAry = _.map(sections, function(section){return section.toReference()});
                    page.set('sections', sectionRefAry);
                    page2.get('sections').push(sectionRefAry[0]);
                    dao.saveOrUpdate(page, function(err, savedPage){
                        if(savedPage) {
                            testContext.page = savedPage;
                        }
                        dao.saveOrUpdate(page2, function(err, otherSavedPage){
                            if(otherSavedPage) {
                                testContext.page2 = otherSavedPage;
                            }
                            callback(err, savedPage);
                        });

                    });
                }
            ], function done(err){
                if(err) {
                    _log.error('Error setting up tests.');
                    cb();
                } else {
                    initialized = true;
                    cb();
                }
            });
        } else {
            cb();
        }

    },

    tearDown: function (cb) {
        var self = this;
        _log.debug('>> teardown');
        cb();
    },

    testOnce: function(test) {
        test.done();
    },

    testGroup: {

        testUpdatePageIncrementsPageVersion: function(test) {
            test.expect(6);
            async.waterfall([
                function(cb) {
                    var page = testContext.page;
                    var currentVersion = page.get('version');
                    var latest = page.get('latest');
                    test.ok(latest);
                    test.equal(currentVersion, 0);
                    var sections = page.get('sections') || [];
                    sectionDao.dereferenceSections(sections, function(err, sectionAry){
                        page.set('sections', _.compact(sectionAry));
                        cb(err, page);
                    });
                },
                function(page, cb) {
                    page.set('Title', 'Updated Title');
                    var modified = {date:new Date(), by:userId};
                    var homePage = null;
                    manager.updatePage(accountId, page.id(), page, modified, homePage, userId, function(err, updatedPage){
                        test.ifError(err);
                        test.ok(updatedPage.get('latest'));
                        test.equal(updatedPage.get('version'), 1);
                        cb();
                    });
                }


            ], function done(err){
                test.ifError(err);
                test.done();
            });
        },

        testUpdateSectionModifiesID: function(test) {
            test.expect(7);
            async.waterfall([
                function(cb) {
                    var page = testContext.page;
                    var currentVersion = page.get('version');
                    var latest = page.get('latest');
                    test.ok(latest);
                    var sections = page.get('sections') || [];
                    sectionDao.dereferenceSections(sections, function(err, sectionAry){
                        page.set('sections', _.compact(sectionAry));
                        cb(err, page, currentVersion);
                    });
                },
                function(page, currentVersion, cb) {
                    page.get('sections')[0].set('name','Updated name');
                    var initialSectionID = page.get('sections')[0].id();
                    var modified = {date:new Date(), by:userId};
                    var homePage = null;
                    manager.updatePage(accountId, page.id(), page, modified, homePage, userId, function(err, updatedPage){
                        test.ifError(err);
                        test.ok(updatedPage.get('latest'));
                        test.equal(updatedPage.get('version'), currentVersion+1);
                        var section0 = updatedPage.get('sections')[0];
                        test.equal(section0.name, 'Updated name');
                        test.notEqual(section0._id, initialSectionID);
                        _log.debug('Initial ID: ' + initialSectionID + ' and now it is: ' + section0._id);
                        _log.debug('page:', updatedPage.toJSON());
                        _log.debug('section:', section0);
                        cb();
                    });
                }
            ], function done(err){
                test.ifError(err);
                test.done();
            });
        },

        testUpdatePageWithSharedSections: function(test) {
            test.expect(8);
            async.waterfall([
                function(cb) {
                    var page = testContext.page;
                    var currentVersion = page.get('version');
                    var latest = page.get('latest');
                    test.ok(latest);
                    var sections = page.get('sections') || [];
                    sectionDao.dereferenceSections(sections, function(err, sectionAry){
                        page.set('sections', _.compact(sectionAry));
                        cb(err, page, currentVersion);
                    });
                },
                function(page, currentVersion, cb) {
                    page.get('sections')[0].set('name','Updated name again');
                    var initialSectionID = page.get('sections')[0].id();
                    var modified = {date:new Date(), by:userId};
                    var homePage = null;
                    manager.updatePage(accountId, page.id(), page, modified, homePage, userId, function(err, updatedPage){
                        test.ifError(err);
                        test.ok(updatedPage.get('latest'));
                        test.equal(updatedPage.get('version'), currentVersion+1);
                        cb(err, initialSectionID);
                    });
                },
                function(initialSectionID, cb) {
                    var page2 = testContext.page2;
                    var initialPageVersion = page2.get('version');
                    var sections = page2.get('sections') || [];
                    sectionDao.dereferenceSections(sections, function(err, sectionAry){
                        page2.set('sections', _.compact(sectionAry));
                        cb(err, page2, initialSectionID, initialPageVersion);
                    });
                },
                function(page, initialSectionID, initialPageVersion, cb) {
                    dao.getPageById(accountId, page.id(), function(err, savedPage){
                        _log.debug('savedPage:', savedPage);
                        test.ifError(err);
                        var section0 = savedPage.get('sections')[0];
                        _log.debug('section0', section0);
                        test.notEqual(initialSectionID, section0._id);
                        test.equal(initialPageVersion, savedPage.get('version'));
                        cb();
                    });
                }
            ], function done(err){
                test.ifError(err);
                test.done();
            });
        },

        testUpdatePageWithNewSections: function(test) {
            _log.debug('>> testUpdatePageWithNewSections');
            test.expect(3);
            async.waterfall([
                function(cb) {
                    var pageId = testContext.page.id();
                    dao.getPageById(accountId, pageId, function(err, savedPage){
                        if(err) {
                            cb(err);
                        } else {
                            var sections = savedPage.get('sections') || [];
                            sectionDao.dereferenceSections(sections, function(err, sectionAry){
                                savedPage.set('sections', _.compact(sectionAry));
                                cb(err, savedPage);
                            });
                        }
                    });
                },
                function(page, cb) {
                    var currentSectionLength = page.get('sections').length;
                    var section3 = new $$.m.ssb.Section({
                        accountId:accountId,
                        name:'Section3',
                        title:'Section3'
                    });
                    page.get('sections').push(section3);
                    var modified = {date:new Date(), by:userId};
                    var homePage = null;
                    manager.updatePage(accountId, page.id(), page, modified, homePage, userId, function(err, updatedPage){
                        test.ifError(err);
                        _log.debug('UpdatedPage:', updatedPage.toJSON());
                        test.equal(updatedPage.get('sections').length, currentSectionLength+1);
                        cb(err);
                    });
                }
            ], function done(err){
                test.ifError(err);
                test.done();
            });
        }
    }

}
