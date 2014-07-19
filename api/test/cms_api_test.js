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
var testPageId = '10';
var accountURL = null;
var cookie = null;
var _log = global.getLogger('cms_api_test');
var blogDAO = require('../../cms/dao/blogpost.dao.js');
var cmsDAO = require('../../cms/dao/cms.dao.js');
var Blog = require('../../cms/model/components/blog.js');
var Page = require('../../cms/model/page.js');
var cmsManager = require('../../cms/cms_manager.js');
var freeForm = require('../../cms/model/components/freeform.js');

module.exports.group = {
    setUp: function(cb) {
        if(sessionInitialized !== true) {
            //delete blogplosts
            var promiseAry = [];
            var outerPromise = $.Deferred();
            promiseAry.push(outerPromise);
            blogDAO.findMany({}, $$.m.BlogPost, function(err, posts){

                for(var i =0; i<posts.length; i++) {
                    var p1 = $.Deferred();
                    promiseAry.push(p1);
                    blogDAO.removeById(posts[i].id(), $$.m.BlogPost, function(err, value){
                        p1.resolve();
                    });
                }
                outerPromise.resolve();
            });
            $.when(promiseAry).done(function(){
                var p1 = $.Deferred();
                var p2 = $.Deferred();
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
                //create page for blog posts
                var blogComponent = new $$.m.cms.modules.Blog({
                    _id: $$.u.idutils.generateUUID()
                });

                var page = new $$.m.cms.Page({
                    _id: testPageId,
                    'accountId':1,
                    'websiteId':1,
                    handle: 'Page Handle',
                    title: 'Page Title',
                    components: [blogComponent.toJSON('public')]
                });


                cmsDAO.saveOrUpdate(page, function(err, page){
                    if(err) {
                        test.ok(false, 'error in testCreate');
                    }
                    p2.resolve();
                });
                $.when(p1,p2).done(function(){
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
        test.expect(2);
        var blogPost = new $$.m.BlogPost({
            'post_author': 'Kyle',
            'post_title' : 'Post Title',
            'post_content': 'some content here.'
        });

        var req = request(accountURL).post('/api/1.0/cms/page/10/blog')
            .set('cookie', cookie)
            .send(blogPost);

        req.expect(200, function(err, res){
            test.ok(true);
        });
        var blogPost2 = new $$.m.BlogPost({
            'post_author': 'Kyle',
            'post_title' : 'Post #2 Title',
            'post_content': 'more content here.'
        });

        var req = request(accountURL).post('/api/1.0/cms/page/10/blog')
            .set('cookie', cookie)
            .send(blogPost2);

        req.expect(200, function(err, res){

            test.ok(true);
            test.done();
        });

    },
    testListBlogPosts: function(test) {
        test.expect(1);

        var req = request(accountURL).get('/api/1.0/cms/page/10/blog').set('cookie', cookie);
        //agent.attachCookies(req);
        req.expect(200, function(err, res){

            testcontext.blogposts = [];
            for(var i=0; i<res.body.length; i++) {
                testcontext.blogposts.push(res.body[i]);
            }
            test.equals(2, res.body.length);
            test.done();
        });
    },

    testUpdateBlogPost: function(test) {
        var post = new $$.m.BlogPost(testcontext.blogposts[0]);
        post.set('post_content', 'updated content');
        var postId = post.id();
        _log.info('connecting to: ' + accountURL + ' with cookie: ' + cookie);
        var req = request(accountURL).post('/api/1.0/cms/page/10/blog/' + postId)
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
        var req = request(accountURL).get('/api/1.0/cms/page/10/blog/' + postId)
            .set('cookie', cookie);

        req.expect(200, function(err, res){

            _log.info('retrieved blog post with id: ' + postId);
            //console.dir(res.body);
            var blogPost = new $$.m.BlogPost(res.body);
            test.equals(postId, blogPost.id());

            test.done();
        });
    },

    testDeleteBlogPost: function(test) {
        var post = new $$.m.BlogPost(testcontext.blogposts[0]);
        var postId = post.id();

        var req = request(accountURL).delete('/api/1.0/cms/page/10/blog/' + postId)
            .set('cookie', cookie);

        req.expect(200, function(err, res){
            //console.dir(err);
            //console.dir(res);
            _log.info('deleted blog post with id: ' + postId);
            //console.dir(res.body);

            var req2 = request(accountURL).get('/api/1.0/cms/page/10/blog/' + postId)
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
            var req = request(accountURL).get('/api/1.0/cms/page/10/blog/author/author1')
                .set('cookie', cookie);

            req.expect(200, function(err, res){
                if(err) {
                    test.ok(false, 'Error getting posts by author: ' + err);
                    test.done();
                }
                //console.dir(res.body);
                test.equals(2, res.body.length);
                test.done();
            });
        });


    },

    testGetPostsByTitle: function(test) {
        //website/:id/blog/title/:title
        var req = request(accountURL).get('/api/1.0/cms/page/10/blog/title/title1')
            .set('cookie', cookie);
        req.expect(200, function(err, res){
            if(err) {
                test.ok(false, 'Error getting posts by title: ' + err);
                test.done();
            }
            //console.dir(res.body);
            test.equals(1, res.body.length);
            test.done();
        });
    },

    testGetPostsByContent: function(test) {
        //website/:id/blog/content/:content
        var req = request(accountURL).get('/api/1.0/cms/page/10/blog/content/some')
            .set('cookie', cookie);
        req.expect(200, function(err, res){
            if(err) {
                test.ok(false, 'Error getting posts by content: ' + err);
                test.done();
            }
            //console.dir(res.body);
            test.equals(2, res.body.length);
            test.done();
        });

    },

    testGetPostsByCategory: function(test) {
        //category1
        //website/:id/blog/category/category1
        var req = request(accountURL).get('/api/1.0/cms/page/10/blog/category/category1')
            .set('cookie', cookie);
        req.expect(200, function(err, res){
            if(err) {
                test.ok(false, 'Error getting posts by category: ' + err);
                test.done();
            }
            //console.dir(res.body);
            test.equals(2, res.body.length);
            test.done();
        });
    },

    testGetPostsByTag: function(test) {
        //tag2
        //website/:id/blog/tag/tag2
        var req = request(accountURL).get('/api/1.0/cms/page/10/blog/tag/tag2')
            .set('cookie', cookie);
        req.expect(200, function(err, res){
            if(err) {
                test.ok(false, 'Error getting posts by tag: ' + err);
                test.done();
            }
            //console.dir(res.body);
            test.equals(2, res.body.length);
            test.done();
        });
    },

    testReorderBlogPost: function(test) {
        //page/:id/blog/:postId/reorder/:newOrder
        /*
         * Create 3 posts.  Move 2 to last.  Check order
         */
        test.expect(2);
        var accountId = testcontext.accountId;
        var post1 = new $$.m.BlogPost({
            'accountId': accountId,
            'pageId': testPageId,
            'post_author': 'Kyle',
            'post_title' : 'Post Order #1',
            'post_content': 'some content here.'

        });
        var post2 = new $$.m.BlogPost({
            'accountId': accountId,
            'pageId': testPageId,
            'post_author': 'Kyle',
            'post_title' : 'Post Order #2',
            'post_content': 'some content here.'

        });
        var post3 = new $$.m.BlogPost({
            'accountId': accountId,
            'pageId': testPageId,
            'post_author': 'Kyle',
            'post_title' : 'Post Order #3',
            'post_content': 'some content here.'

        });
        var p1 = $.Deferred();
        cmsManager.createBlogPost(accountId, post1, function(err, post){
            if(err) {
                test.ok(false, 'Error in testReorderBlogPost setup.');
                test.done();
            }

            testcontext.blogposts.push(post.toJSON("public"));

            cmsManager.createBlogPost(accountId, post2, function(err, post){
                if(err) {
                    test.ok(false, 'Error in testReorderBlogPost setup.');
                    test.done();
                }
                testcontext.blogposts.push(post.toJSON("public"));
                cmsManager.createBlogPost(accountId, post3, function(err, post){
                    if(err) {
                        test.ok(false, 'Error in testReorderBlogPost setup.');
                        test.done();
                    }
                    testcontext.blogposts.push(post.toJSON("public"));
                    p1.resolve();
                });
            });
        });

        $.when(p1).done(function(){
            //verify order; modify order; verify order
            cmsManager.listPostIdsByPage(accountId, testPageId, function(err, posts){
                if(err) {
                    test.ok(false, 'Error in testReorderBlogPost verifying post order.');
                    test.done();
                }

                var initialAry = posts.slice(0);
                //move 1 -> 2
                var _postId = posts[1];
                var req = request(accountURL).post('/api/1.0/cms/page/10/blog/' + _postId + '/reorder/2')
                    .set('cookie', cookie);
                req.expect(200, function(err, res){
                    if(err) {
                        test.ok(false, 'Error reordering posts: ' + err);
                        test.done();
                    }

                    cmsManager.listPostIdsByPage(accountId, testPageId, function(err, posts){
                        if(err) {
                            test.ok(false, 'Error in testReorderBlogPost verifying post order.');
                            test.done();
                        }
                        test.equals(initialAry.length, posts.length);
                        test.equals(initialAry[1], posts[2]);
                        test.done();
                    });

                });
            });
        });

    },


    testGetComponentsByPage: function(test) {
        test.expect(1);
        var req = request(accountURL).get('/api/1.0/cms/page/10/components')
            .set('cookie', cookie);
        req.expect(200, function(err, res){
            if(err) {
                test.ok(false, 'Error getting posts by tag: ' + err);
                test.done();
            }
            console.dir(res.body);
            test.equals(1, res.body.length);
            test.done();
        });
    },

    testGetComponentsByType: function(test) {
        test.expect(1);
        var req = request(accountURL).get('/api/1.0/cms/page/10/components/type/blog')
            .set('cookie', cookie);
        req.expect(200, function(err, res){
            if(err) {
                test.ok(false, 'Error getting posts by tag: ' + err);
                test.done();
            }
            console.dir(res.body);
            test.equals(1, res.body.length);
            test.done();
        });
    },

    testAddComponentToPage: function(test) {
        var component = new $$.m.cms.modules.Freeform({
            _id: $$.u.idutils.generateUUID(),
            label:"FreeForm Component",
            description:"The free form component",
            value: "<p>HTML is neat</p>"
        });
        testcontext.componentId = component.id();
        var req = request(accountURL).post('/api/1.0/cms/page/10/components')
            .set('cookie', cookie)
            .send(component);
        req.expect(200, function(err, res){
            if(err) {
                test.ok(false, 'Error getting posts by tag: ' + err);
                test.done();
            }
            console.dir(res.body);
            test.equals(2, res.body['components'].length);
            test.done();
        });

    },

    testUpdateComponent: function(test) {
        //app.post(this.url('page/:id/components/:componentId'), this.isAuthApi, this.updateComponent.bind(this));
        cmsManager.getPageComponentsByType('10', 'freeform', function(err, component) {
            if(err) {
                test.ok(false, 'Error updating component: ' + err);
                test.done();
            }

            component['label'] =  'Updated Label';
            var req = request(accountURL).post('/api/1.0/cms/page/10/components/' + testcontext.componentId)
                .set('cookie', cookie)
                .send(component);

            req.expect(200, function(err, res){
                if(err) {
                    test.ok(false, 'Error getting posts by tag: ' + err);
                    test.done();
                }
                console.dir(res.body);
                test.equals(2, res.body['components'].length);
                test.done();
            });

        });

    },

    testUpdateAllComponents: function(test) {
        test.expect(2);
        //app.post(this.url('page/:id/components/all'), this.isAuthApi, this.updateAllComponents.bind(this));
        cmsManager.getPageComponents(testPageId, function(err, components){
            for(var i=0; i<components.length; i++) {
                components[i]['anchor'] = 'updated';
            }
            var req = request(accountURL).post('/api/1.0/cms/page/10/components/all')
                .set('cookie', cookie)
                .send(components);
            req.expect(200, function(err, res) {
                if (err) {
                    test.ok(false, 'Error updating post order: ' + err);
                    test.done();
                }
                console.dir(res.body);
                test.equals(2, res.body['components'].length);
                test.equals('updated', res.body['components'][0]['anchor']);
                test.done();
            });
        });

    },

    testUpdateComponentOrder: function(test) {
        //app.post(this.url('page/:id/components/:componentId/order/:newOrder'), this.isAuthApi, this.updateComponentOrder.bind(this));
        var req = request(accountURL).post('/api/1.0/cms/page/10/components/' + testcontext.componentId + '/order/0')
            .set('cookie', cookie);
        req.expect(200, function(err, res){
            if(err) {
                test.ok(false, 'Error updating post order: ' + err);
                test.done();
            }
            console.dir(res.body);
            test.done();
        });
    },

    testDeleteComponent: function(test) {
        var req = request(accountURL).delete('/api/1.0/cms/page/10/components/' + testcontext.componentId)
            .set('cookie', cookie);
        req.expect(200, function(err, res){
            if(err) {
                test.ok(false, 'Error getting posts by tag: ' + err);
                test.done();
            }
            console.dir(res.body);
            test.done();
        });
    },

    cleanupTestPosts: function(test) {
        var promiseAry = [];
        testHelpers.destroyTestPosts(testcontext, function(err, posts){
            for(var i=0; i<testcontext.blogposts.length; i++) {
                var p1 = $.Deferred();
                promiseAry.push(p1);
                var blogPost = new $$.m.BlogPost(testcontext.blogposts[i]);
                _log.debug('removing: ' + blogPost.id());
                blogDAO.removeById(blogPost.id(), $$.m.BlogPost, function(err, val){
                    p1.resolve();
                });

            }
            $.when(promiseAry).done(function(){
                test.done();
            });
        });

    }


}
