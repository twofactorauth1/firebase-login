/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */
process.env.NODE_ENV = "testing";
var app = require('../../app');
var appConfig = require('../../configs/app.config.js');
var testHelpers = require('../../testhelpers/testhelpers');
var cmsAPI = require('../1.0/cms.api.js');
var baseURL = appConfig.server_url;
var request = require('supertest');
var superAgent = require('superagent');
var agent = superAgent.agent();
var testcontext = {};
var sessionInitialized = false;
var testUsername = 'apitest@example.com';
var testPassword = 'password';
var accountURL = null;
var cookie = null;
var _log = global.getLogger('cms_api_test');
var blogDAO = require('../../cms/dao/blogpost.dao.js');

module.exports.group = {
    setUp: function(cb) {
        //TODO: create test account if needed.
        if(sessionInitialized !== true) {
            var p1 = $.Deferred();
            _log.info('getting test account');
            testHelpers.getOrCreateAPITestingAccount(testcontext, function(err, account){
                if(err) {
                    _log.error('Error getting test account');
                    test.done();
                }
                _log.info('getting test user');
                testHelpers.getOrCreateAPITestingUser(testcontext, function(err, user){
                    if(err) {
                        _log.error('Error getting test user');
                        test.done();
                    }
                    _log.info('got user.');
                    p1.resolve();
                });
            });
            $.when(p1).done(function(){
                var loginURL = appConfig.server_url + '/login';
                _log.info('loginURL: ' + loginURL);
                superAgent
                    .post(loginURL)
                    .send({'username': testUsername, 'password': testPassword})
                    .end(function(err, res){
                        console.dir(err);
                        agent.saveCookies(res);
                        sessionInitialized = true;
                        //TODO: establish accountURL
                        accountURL = 'http://apitest.indigenous.local:3000';
                        cookie = res.headers['set-cookie'];
                        cb();
                    });
            });



        } else {
            //anything else?
            _log.debug('already initialized...');
            cb();
        }



    },

    tearDown: function(cb) {
        cb();
    },




    testCreateBlogPost: function(test) {
        test.expect(1);
        var blogPost = new $$.m.BlogPost({
            'post_author': 'Kyle',
            'post_title' : 'Post Title',
            'post_content': 'some content here.'
        });
        _log.info('connecting to: ' + accountURL + ' with cookie: ' + cookie);
        var req = request(accountURL).post('/api/1.0/cms/website/10/blog')
            .set('cookie', cookie)
            .send(blogPost);
        //agent.attachCookies(req);
        req.expect(200, function(err, res){

            test.ok(true);
            test.done();
        });
    },
    testListBlogPosts: function(test) {
        test.expect(1);

        var req = request(accountURL).get('/api/1.0/cms/website/10/blog').set('cookie', cookie);
        //agent.attachCookies(req);
        req.expect(200, function(err, res){

            testcontext.blogposts = [];
            for(var i=0; i<res.body.length; i++) {
                testcontext.blogposts.push(res.body[i]);
            }
            test.ok(true);
            test.done();
        });
    },

    testUpdateBlogPost: function(test) {
        var post = new $$.m.BlogPost(testcontext.blogposts[0]);
        post.set('post_content', 'updated content');
        var postId = post.id();
        _log.info('connecting to: ' + accountURL + ' with cookie: ' + cookie);
        var req = request(accountURL).post('/api/1.0/cms/website/10/blog/' + postId)
            .set('cookie', cookie)
            .send(post);
        req.expect(200, function(err, res){
            //console.dir(err);
            //console.dir(res);
            _log.info('updated blog post with id: ' + postId);
            test.ok(true);
            test.done();
        });

    },

    testGetBlogPost: function(test) {
        test.expect(1);
        var post = new $$.m.BlogPost(testcontext.blogposts[0]);
        var postId = post.id();
        var req = request(accountURL).get('/api/1.0/cms/website/10/blog/' + postId)
            .set('cookie', cookie);

        req.expect(200, function(err, res){
            //console.dir(err);
            //console.dir(res);
            _log.info('retrieved blog post with id: ' + postId);
            console.dir(res.body);
            var blogPost = new $$.m.BlogPost(res.body);
            test.equals(postId, blogPost.id());

            test.done();
        });
    },

    testDeleteBlogPost: function(test) {
        var post = new $$.m.BlogPost(testcontext.blogposts[0]);
        var postId = post.id();

        var req = request(accountURL).delete('/api/1.0/cms/website/10/blog/' + postId)
            .set('cookie', cookie);

        req.expect(200, function(err, res){
            //console.dir(err);
            //console.dir(res);
            _log.info('deleted blog post with id: ' + postId);
            console.dir(res.body);

            var req2 = request(accountURL).get('/api/1.0/cms/website/10/blog/' + postId)
                .set('cookie', cookie);

            req2.expect(404, function(err, res){
                _log.info('404 on GET of blogpost with id of ' + postId);
                test.done();
            });


        });
    },

    testGetPostsByAuthor: function(test) {
        var p1 = $.Deferred();
        testHelpers.createTestPosts(testcontext, testcontext.accountId, 10, function(err, posts){
            _log.info('created test posts');
            p1.resolve();
        });
        $.when(p1).done(function(){
            var req = request(accountURL).get('/api/1.0/cms/website/10/blog/author/author1')
                .set('cookie', cookie);

            req.expect(200, function(err, res){
                if(err) {
                    test.ok(false, 'Error getting posts by author: ' + err);
                    test.done();
                }
                console.dir(res.body);
                test.equals(2, res.body.length);
                test.done();
            });
        });


    },

    testGetPostsByTitle: function(test) {
        //website/:id/blog/title/:title
        var req = request(accountURL).get('/api/1.0/cms/website/10/blog/title/title1')
            .set('cookie', cookie);
        req.expect(200, function(err, res){
            if(err) {
                test.ok(false, 'Error getting posts by title: ' + err);
                test.done();
            }
            console.dir(res.body);
            test.equals(1, res.body.length);
            test.done();
        });
    },

    testGetPostsByContent: function(test) {
        //website/:id/blog/content/:content
        var req = request(accountURL).get('/api/1.0/cms/website/10/blog/content/some')
            .set('cookie', cookie);
        req.expect(200, function(err, res){
            if(err) {
                test.ok(false, 'Error getting posts by content: ' + err);
                test.done();
            }
            console.dir(res.body);
            test.equals(2, res.body.length);
            test.done();
        });

    },

    testGetPostsByCategory: function(test) {
        //category1
        //website/:id/blog/category/category1
        var req = request(accountURL).get('/api/1.0/cms/website/10/blog/category/category1')
            .set('cookie', cookie);
        req.expect(200, function(err, res){
            if(err) {
                test.ok(false, 'Error getting posts by category: ' + err);
                test.done();
            }
            console.dir(res.body);
            test.equals(2, res.body.length);
            test.done();
        });
    },

    testGetPostsByTag: function(test) {
        //tag2
        //website/:id/blog/tag/tag2
        var req = request(accountURL).get('/api/1.0/cms/website/10/blog/tag/tag2')
            .set('cookie', cookie);
        req.expect(200, function(err, res){
            if(err) {
                test.ok(false, 'Error getting posts by tag: ' + err);
                test.done();
            }
            console.dir(res.body);
            test.equals(2, res.body.length);
            test.done();
        });
    },

    cleanupTestPosts: function(test) {
        var promiseAry = [];
        testHelpers.destroyTestPosts(testcontext, function(err, posts){
            for(var i=0; i<testcontext.blogposts.length; i++) {
                var p1 = $.Deferred();
                promiseAry.push(p1);
                blogDAO.removeById(testcontext.blogposts._id, $$.m.BlogPost, function(err, val){
                    p1.resolve();
                });

            }
            $.when(promiseAry).done(function(){
                test.done();
            });
        });

    }


}
