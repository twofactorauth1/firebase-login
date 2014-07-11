/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseDao = require('./../../dao/base.dao.js');
var BlogPost = require('../model/blogpost');

var dao = {

    options: {
        name: "blogpost.dao",
        defaultModel: $$.m.BlogPost
    },

    getPostsByAuthor: function(author, fn) {
        var self = this;
        self.log.debug(">> getPostsByAuthor");
        var query = {'post_author': author};
        this.findMany(query, $$.m.BlogPost, fn);
    },

    getPostsByTitle: function(title, fn) {
        var self = this;
        self.log.debug(">> getPostsByTitle");
        var query = {'post_title': title};
        this.findMany(query, $$.m.BlogPost, fn);
    },

    getPostsByData: function(data, fn) {
        var self = this;
        self.log.debug('>> getPostsByData');
        var query = {'post_content': new RegExp(data)};
        this.findMany(query, $$.m.BlogPost, fn);
    },

    getPostsByCategory: function(category, fn) {
        var self = this;
        self.log.debug('>> getPostsByCategory');
        var query = {'post_category': category};
        this.findMany(query, $$.m.BlogPost, fn);
    },

    getPostsByTags: function(tags, fn) {
        var self = this;
        self.log.debug('>> getPostsByTags');
        var query = {'post_tags': {$in: tags}};
        this.findMany(query, $$.m.BlogPost, fn);
    }

};


dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.BlogpostDao = dao;

module.exports = dao;
