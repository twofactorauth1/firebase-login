/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2015
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseDao = require('./../../dao/base.dao.js');
var page = require('../model/page.js');

var dao = {

    getPageById: function(accountId, pageId, fn) {
        var self = this;
        var query = {_id: pageId, accountId:accountId, latest:true};
        self.findOne(query, $$.m.ssb.Page, fn);
    },

    getLatestPageForWebsite: function(websiteId, pageName, accountId, fn) {
        var self = this;
        var query = {
            websiteId: websiteId,
            handle: pageName,
            accountId: accountId,
            latest: true
        };
        self.findOne(query, $$.m.ssb.Page, fn);
    },

    savePublishedPage: function(page, fn) {
        var self = this;
        self.addToCollection(page, 'published_pages', fn);
    },

    options: {
        name: "ssb.page.dao",
        defaultModel: $$.m.ssb.Page
    }

};


dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.SSBPageDao = dao;

module.exports = dao;
