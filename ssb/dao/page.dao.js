/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2015
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseDao = require('./../../dao/base.dao.js');
var page = require('../model/page.js');

var dao = {

    publishedPageObj: {
        db:{
            storage:'mongo',
            table:'published_pages'
        }
    },

    getPageById: function(accountId, pageId, fn) {
        var self = this;
        var query = {_id: pageId, accountId:accountId};
        self.findOne(query, $$.m.ssb.Page, fn);
    },

    getLatestPageByHandle: function(accountId, handle, fn) {
        var self = this;
        var query = {handle: handle, accountId:accountId};
        self.findOne(query, $$.m.ssb.Page, fn);
    },

    getLatestPageForWebsite: function(websiteId, pageName, accountId, fn) {
        var self = this;
        var query = {websiteId: websiteId, handle: pageName, accountId: accountId};
        self.findOne(query, $$.m.ssb.Page, fn);
    },

    getLatestPage: function(pageName, accountId, fn) {
        var self = this;
        var query = {handle: pageName, accountId: accountId, latest: {$ne:false}};
        self.findOne(query, $$.m.ssb.Page, fn);
    },

    getPublishedPageForWebsite: function(websiteId, pageName, accountId, fn) {
        var self = this;
        var query = {websiteId: websiteId, handle: pageName, accountId: accountId};
        self.findOne(query, self.publishedPageObj, fn);
    },

    getPublishedPageByHandle: function(pageName, accountId, fn) {
        var self = this;
        var query = {handle: pageName, accountId: accountId};
        self.findOne(query, self.publishedPageObj, fn);
    },

    savePublishedPage: function(page, fn) {
        var self = this;
        self.addToCollection(page, 'published_pages', fn);
    },

    findPublishedPages: function(query, fn) {
        var self = this;

        self.findMany(query, self.publishedPageObj, fn);
    },

    removePublishedPage: function(accountId, pageId, fn){
        var self = this;
        var query = {accountId:accountId, _id:pageId};
        self.removeByQuery(query, self.publishedPageObj, fn);
    },

    removePublishedPageByHandle: function(accountId, handle, fn){
        var self = this;
        var query = {accountId:accountId, handle:handle};
        self.removeByQuery(query, self.publishedPageObj, fn);
    },

    options: {
        name: "ssb.page.dao",
        defaultModel: $$.m.ssb.Page
    }

};


dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.SSBPageDao = dao;

module.exports = dao;
