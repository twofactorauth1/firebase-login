/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2015
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseDao = require('./../../dao/base.dao.js');
var website = require('../model/website.js');

var dao = {


    getWebsiteById: function(accountId, websiteId, fn) {
        var self = this;
        var query = {accountId:accountId, _id:websiteId};
        self.findOne(query, $$.m.ssb.Website, fn);
    },

    getWebsitesForAccount: function(accountId, fn) {
        var self = this;
        var query = {accountId:accountId};
        self.findMany(query, $$.m.ssb.Website, fn);
    },

    options: {
        name: "ssb.website.dao",
        defaultModel: $$.m.ssb.Website
    }

};


dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.SSBWebsiteDao = dao;

module.exports = dao;
