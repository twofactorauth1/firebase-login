/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var userDao = require('../dao/user.dao.js');
var accountDao = require('../dao/account.dao.js');
var blogPostDao = require('../cms/dao/blogpost.dao.js');

module.exports = {

    createTestUser: function (testClass, fn) {
        if (_.isFunction(testClass)) {
            fn = testClass;
            testClass = null;
        }
        userDao.createUserFromUsernamePassword("__test_user_" + $$.u.idutils.generateUniqueAlphaNumeric(), "password", "testuser@indigenous.io", function (err, value) {
            if (err) {
                throw Error("Failed to create test user: " + err.toString());
            }

            if (testClass) {
                testClass.user = value;

                var accountIds = value.getAllAccountIds();
                testClass.accountId = accountIds[0];
                testClass.userId = value.id();
            }

            fn(null, value);
        });
    },

    destroyTestUser: function (user, fn) {
        var accountIds = user.getAllAccountIds();

        if (accountIds.length > 0) {
            accountIds.forEach(function (id) {
                accountDao.removeById(id, function () {
                });
            });
        }

        userDao.remove(user, function(err, value) {
            if (err) {
                throw Error("Failed to destroy test User: " + err.toString());
            }

            fn(err, value);
        });
    },

    createTestPosts: function(testcontext, accountId, websiteId, cb) {
        var post1, post2, post3;
        var p1 = $.Deferred(), p2 = $.Deferred(), p3 = $.Deferred();
        var _accountId = accountId || 0;
        var _websiteId = websiteId || 0;

        post1 = new $$.m.BlogPost({
            'accountId': _accountId,
            'websiteId': _websiteId,
            'post_author': 'author1',
            'post_content': 'some content',
            'post_title': 'title1',
            'post_category': 'category1',
            'post_tags': ['tag1', 'tag2','tag3']
        });

        post2 = new $$.m.BlogPost({
            'accountId': _accountId,
            'websiteId': _websiteId,
            'post_author': 'author2',
            'post_content': 'some more content',
            'post_title': 'title2',
            'post_category': 'category2',
            'post_tags': ['tag2']
        });

        post3 = new $$.m.BlogPost({
            'accountId': _accountId,
            'websiteId': _websiteId,
            'post_author': 'author1',
            'post_content': 'completely different stuff here.  totally unrelated.',
            'post_title': 'title3',
            'post_category': 'category1',
            'post_tags': ['tag1', 'tag3']
        });
        console.log('about to saveOrUpdate');

        blogPostDao.saveOrUpdate(post1, function(err, value){
            if(err) {
                p1.reject();
            }
            testcontext.posts = testcontext.posts || [];
            testcontext.posts.push(value.get('_id'));
            p1.resolve();
        });
        blogPostDao.saveOrUpdate(post2, function(err, value){
            if(err) {
                p2.reject();
            }
            testcontext.posts = testcontext.posts || [];
            testcontext.posts.push(value.get('_id'));
            p2.resolve();
        });
        blogPostDao.saveOrUpdate(post3, function(err, value){
            if(err) {
                p3.reject();
            }
            testcontext.posts = testcontext.posts || [];
            testcontext.posts.push(value.get('_id'));
            p3.resolve();
        });
        console.log('waiting');
        $.when(p1,p2,p3).done(function(){
            console.log('done waiting');
            cb();
        });
    },

    destroyTestPosts: function(testcontext, cb) {

        var promiseAry = [];
        while(testcontext.posts.length > 0) {
            var id = testcontext.posts.pop();
            var p1 = $.Deferred();
            blogPostDao.removeById(id, function(err, value){
                console.log('value: ' + value + '; err:' + err);
                p1.resolve();
            });
            promiseAry.push(p1);
        }
        $.when(promiseAry).done(function() {
            console.log('done cleaning up.');
            cb();
        });
    },

    getOrCreateAPITestingAccount: function(testcontext, fn) {
        var account = new $$.m.Account({
            company: {
                name:"apitest",
                type:0,
                size:0,
                logo:""
            },

            subdomain:"apitest",
            domain:""
        });
        accountDao.getAccountBySubdomain('apitest', function(err, value){
            if(err || !value) {
                //it doesn't exist yet.  Let's create it.
                accountDao.saveOrUpdate(account, function(err, value){
                    testcontext.accountId = value.get('id');
                    fn(null, value);
                });
            } else {
                console.log('setting accountId to ' + value.id());
                testcontext.accountId = value.id();
                fn(null, value);
            }
        });


    },

    getOrCreateAPITestingUser: function(testcontext, fn) {
        var testUser = new $$.m.User({

            "username" : "apitest@example.com",
            "email" : "apitest@example.com",
            "first" : "API",
            "last" : "Test",
            "gender" : 'm',
            "birthday" : "",
            "_v" : "0.1",
            "created" : {
            "date" : 1404743468927,
                "strategy" : "lo",
                "by" : null,
                "isNew" : true
        },
            "profilePhotos" : [],
            "accounts" : [
            {
                "accountId" : testcontext.accountId,
                "username" : "apitest@example.com",
                "credentials" : [
                    {
                        "username" : "apitest@example.com",
                        "password" : "$2a$12$KcrG/UNpNZmSQ7LpfAnxVO9Wc4gb31LfB9DSa3.oytZi7493AJV.O",
                        "type" : "lo",
                        "_username" : "apitest@example.com"
                    }
                ],
                "permissions" : [
                    "super",
                    "admin",
                    "member"
                ]
            }
        ],
            "credentials" : [
            {
                "type" : "lo",
                "username" : "apitest@example.com",
                "password" : "$2a$12$A2JZ2ZXBBkZqtz7X7qLyNeOC3ZuctPQ.7jNdwHDWo8oYKEMSkcnq6"
            }
        ],
            "details" : [],
            "_username" : "apitest@example.com"

        });

        userDao.getUserByUsername('apitest@example.com', function(err, user){
            if(err || !user) {
                //need to create it
                userDao.saveOrUpdate(testUser, function(err, user){
                    testcontext.userId = user.id();
                    fn(null, user);
                });
            } else {
                testcontext.userId = user.id();
                fn(null, user);
            }
        });

    },

    closeDBConnections: function () {
        if ($$.g.mongos != null) {
            $$.g.mongos.forEach(function (mongo) {
                mongo.db.close();
            });
        }
    },

    shutDown: function () {
        return;

        //This was only required when running from webstorm. When run from grunt or cmd line, it works
        //and we don't need to close all the connections and shut down the server manually.
        this.closeDBConnections();
        if (servers != null) {
            var async = require('async');

            async.eachSeries(servers, function (server, cb) {
                console.log("Closing server after tests");
                server.close();
                cb();

            }, function () {
                setTimeout(function () {
                    process.exit(1);
                }, 1000);
            });
        }
    }
};