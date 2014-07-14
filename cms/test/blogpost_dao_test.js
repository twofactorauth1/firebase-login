/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

process.env.NODE_ENV = "testing";
var app = require('../../app');
var async = require('async');
var testHelpers = require('../../testhelpers/testhelpers');
var cmsDao = require('../dao/cms.dao.js');
var blogPostDao = require('../dao/blogpost.dao.js');
var _log = $$.g.getLogger("blogpost.dao.test");
var testcontext = {};

module.exports.group =  {


    setUp: function (cb) {
        _log.debug('>> setup');
        testHelpers.createTestPosts(testcontext, null, null, cb);
        _log.debug('<< setup');
    },

    tearDown: function (cb) {
        _log.debug('>> tearDown');
        testHelpers.destroyTestPosts(testcontext, cb);
        _log.debug('>> tearDown');
    },


    testQueries: function (test) {
        test.expect(8);
        _log.info('testing queries');
        blogPostDao.getPostsByAuthor('author1', function(err, posts){
            if(err) {
                test.ok(false, 'Error getting posts by author.');
                test.done();
            }
            test.equals(2, posts.length);
            test.equals('author1', posts[0].get('post_author'));

        });

        blogPostDao.getPostsByCategory('category1', function(err, posts){
            if(err) {
                test.ok(false, 'Error getting posts by category.');
                test.done();
            }
            test.equals(2, posts.length);
            test.equals('category1', posts[0].get('post_category'));

        });

        blogPostDao.getPostsByData('content', function(err, posts){
            if(err) {
                test.ok(false, 'Error getting posts by category.');
                test.done();
            }
            test.equals(2, posts.length);
        });

        blogPostDao.getPostsByTags(['tag1'], function(err, posts){
            if(err) {
                test.ok(false, 'Error getting posts by category.');
                test.done();
            }
            test.equals(2, posts.length);
        });

        blogPostDao.getPostsByTitle('title2', function(err, posts){
            if(err) {
                test.ok(false, 'Error getting posts by category.');
                test.done();
            }
            console.dir(posts);
            test.equals(1, posts.length);
            test.equals('title2', posts[0].get('post_title'));
            test.done();
        });
    }


};