var mongoConfig = require('../configs/mongodb.config');
var _ = require('underscore');
var mongoskin = require('mongoskin');
var async = require('async');
var STRIPE_CUSTOMER_ID = 'cus_5Rf0LtLeyl1bh0';
var SUBSCRIPTION_ID = 'sub_6HfA5moT1ErVcM';
var STRIPE_ACCESS_TOKEN = 'sk_test_osAnWDulUbCkgw0D2kkwo1Ju';
var STRIPE_REFRESH_TOKEN = 'rt_5NU1M6ubOAkICDJs0TpIa8iCRHDUwbSaC7VJgPXQ75MCfFGZ';
var utils = require('./commonutils');

var copyutil = {

    copyAccountFromTestToProd : function(accountId, cb) {
        var self = this;
        self._copyAccount(accountId, mongoConfig.TEST_MONGODB_CONNECT, mongoConfig.PROD_MONGODB_CONNECT, cb);
    },

    copyAccountFromProdToTest: function(accountId, cb) {
        var self = this;
        //self._copyAccount(accountId, mongoConfig.PROD_MONGODB_CONNECT, mongoConfig.TEST_MONGODB_CONNECT, cb);
        self._copyAccountWithUpdatedStripeIDs(accountId, mongoConfig.PROD_MONGODB_CONNECT, mongoConfig.TEST_MONGODB_CONNECT, cb);

    },


    _copyAccountWithUpdatedStripeIDs: function(srcAccountId, srcDBUrl, destDBUrl, fn) {
        var srcMongo = mongoskin.db(srcDBUrl, {safe: true});
        var destMongo = mongoskin.db(destDBUrl, {safe: true});

        var accountToSave;
        var websiteToSave;
        var pagesToSaveArray = [];
        var productsToSaveArray = [];
        var postsToSaveArray = [];
        var accounts = srcMongo.collection('accounts');
        var websites = srcMongo.collection('websites');
        var pages = srcMongo.collection('pages');
        var products = srcMongo.collection('products');
        var posts = srcMongo.collection('posts');

        async.waterfall([
            function(cb){
                accounts.find({'_id':srcAccountId}).toArray(function(err, items){
                    if(err) {
                        console.log('Error getting account:', err);
                        cb(err);
                    } else {
                        accountToSave = items[0];
                        cb(null);
                    }

                });
            },
            function(cb) {
                var websiteId = accountToSave.website.websiteId;
                websites.find({'_id':websiteId}).toArray(function(err, websites) {
                    if (err) {
                        console.log('Error getting website: ' + err);
                        return cb(err);
                    }
                    websiteToSave = websites[0];
                    cb(null, websiteId);
                });
            },
            function(websiteId, cb) {
                pages.find({'websiteId':websiteId, latest:true}).toArray(function(err, _pages) {
                    if (err) {
                        console.log('Error getting pages: ' + err);
                        return cb(err);
                    }
                    console.log('retrieved pages');
                    pagesToSaveArray = _pages;
                    cb(null);
                });
            },
            function(cb) {
                products.find({accountId:srcAccountId}).toArray(function(err, products){
                    if(err) {
                        console.log('Error getting products:', err);
                        return cb(err);
                    } else {
                        productsToSaveArray = products;
                        cb(null);
                    }
                });
            },
            function(cb) {
                posts.find({accountId: srcAccountId}).toArray(function (err, posts) {
                    if (err) {
                        console.log('Error getting posts:', err);
                        return cb(err);
                    } else {
                        postsToSaveArray = posts;
                        cb(null);
                    }
                });
            },
            function(cb) {
                console.log('Closing src mongo');
                srcMongo.close();
                cb(null);
            },
            function(cb) {
                var destAccountId = null;
                //look for account by subdomain.  If exists, use that accountId.  Else use new one.
                destMongo.collection('accounts').find({subdomain:accountToSave.subdomain}).toArray(function(err, accounts){
                    if(err) {
                        console.log('Error finding account in destination mongo:', err);
                        cb(null);
                    } else if(accounts && accounts[0]) {
                        destAccountId = accounts[0]._id;
                        destMongo.collection('websites').removeById(websiteToSave._id, function(err, value){
                            cb(null, destAccountId);
                        });
                    } else {
                        destMongo.collection('accounts').findAndModify(
                            { _id: "__counter__" },
                            [],
                            { $inc: { seq: 1 } },
                            { new: true, upsert: true },
                            function (err, value) {
                                if (!err && value != null && value.hasOwnProperty('seq')) {
                                    cb(null, value.seq);
                                } else {
                                    console.log('Error getting nextAccountId:', err);
                                    cb(null, 99999);
                                }
                            }
                        );
                    }
                });
            },
            function(newAccountId, cb) {
                console.log('New AccountId:' + newAccountId);
                accountToSave._id = newAccountId;
                accountToSave.billing.stripeCustomerId = STRIPE_CUSTOMER_ID;
                accountToSave.billing.subscriptionId = SUBSCRIPTION_ID;
                if(accountToSave.credentials['type'=='stripe']) {
                    var credentials = accountToSave.credentials['type'=='stripe'];
                    credentials.accessToken = STRIPE_ACCESS_TOKEN;
                    credentials.refreshToken = STRIPE_REFRESH_TOKEN;
                }
                destMongo.collection('accounts').save(accountToSave, function(err, savedAccount){
                   if(err) {
                       console.log('Error saving account:', err);
                       cb(err);
                   } else {
                       //newAccountId = savedAccount._id;
                       cb(null, newAccountId);
                   }
                });
            },
            function(newAccountId, cb) {
                websiteToSave.accountId = newAccountId;
                if(!websiteToSave._id) {
                    websiteToSave._id = utils.idutils.generateUUID();
                    accountToSave.website.websiteId = websiteToSave._id;
                    destMongo.collection('accounts').save(accountToSave, function(err, savedAccount){
                       console.log('updated account websiteId');
                    });
                }

                destMongo.collection('websites').save(websiteToSave, function(err, savedWebsite){
                    if(err) {
                        console.log('Error saving website:', err);
                        cb(err);
                    } else {
                        console.log('Saved website:', savedWebsite);
                        var newWebsiteId = websiteToSave._id;
                        cb(null, newAccountId, newWebsiteId);

                    }
                });
            },
            function(newAccountId, newWebsiteId, cb) {
                console.log('saving pages with accountId:' + newAccountId + ' and websiteId:' + newWebsiteId);
                var pagesCollection = destMongo.collection('pages');
                var blogPageId = null;
                async.eachSeries(pagesToSaveArray, function(page, callback){
                    page.accountId = newAccountId;
                    page.websiteId = newWebsiteId;

                    pagesCollection.save(page, function(err, savedPage){
                        if(err) {
                            console.log('Error saving page: ' + page._id);
                            callback(err);
                        } else {
                            console.log('saved page [' + page._id + ']');
                            if(page.handle === 'blog') {
                                blogPageId = page._id;
                            }
                            callback();
                        }
                    });
                }, function done(err){
                    cb(err, newAccountId, newWebsiteId, blogPageId);
                });
            },
            function saveProducts(newAccountId, newWebsiteId, blogPageId, cb) {
                console.log('saving products with ' + newAccountId + ', ' + newWebsiteId + ', ' + blogPageId);
                var productsCollection = destMongo.collection('products');
                async.eachSeries(productsToSaveArray, function(product, callback){
                    //product._id = null;
                    product.accountId = newAccountId;
                    productsCollection.save(product, function(err, savedProduct){
                        if(err) {
                            console.log('Error saving product:' + err);
                            callback(err);
                        } else{
                            console.log('Saved Product:' + savedProduct._id);
                            callback(null);
                        }
                    });
                }, function done(err){
                    cb(err, newAccountId, newWebsiteId, blogPageId);
                });
            },
            function savePosts(newAccountId, newWebsiteId, blogPageId, cb) {
                console.log('saving posts with ' + newAccountId + ', ' + newWebsiteId + ', ' + blogPageId);
                var postsCollection = destMongo.collection('posts');
                async.eachSeries(postsToSaveArray, function(post, callback){
                    //post._id = null;
                    post.accountId = newAccountId;
                    post.websiteId = newWebsiteId;
                    post.pageId = blogPageId;
                    postsCollection.save(post, function(err, savedPost){
                        if(err) {
                            console.log('Error saving post:' + err);
                            callback(err);
                        } else {
                            console.log('Saved post:' + savedPost._id);
                            callback();
                        }
                    });
                }, function done(err){
                    cb(err);
                });
            }
        ], function done(err){
            console.log('Closing mongo connections');
            destMongo.close();
            fn();
        });
    },

    _copyAccount: function(accountId, srcDBUrl, destDBUrl, callback) {
        var srcMongo = mongoskin.db(srcDBUrl, {safe: true});
        var destMongo = mongoskin.db(destDBUrl, {safe: true});

        var accountToSave;
        var websiteToSave;
        var pagesToSaveArray = [];
        var productsToSaveArray = [];


        //get accountById
        //get websiteById
        //get pages by websiteId

        var accounts = srcMongo.collection('accounts');
        var websites = srcMongo.collection('websites');
        var pages = srcMongo.collection('pages');
        accounts.find({'_id': accountId}).toArray(function (err, items) {
            if(err) {
                console.log('Error getting account: ' + err);
                return callback(err);
            }
            console.log('retrieved account');
            //only going to do the first result.  Should only be one.
            accountToSave = items[0];
            var websiteId = accountToSave.website.websiteId;
            websites.find({'_id':websiteId}).toArray(function(err, websites){
                if(err) {
                    console.log('Error getting website: ' + err);
                    return callback(err);
                }
                console.log('retrieved website');
                websiteToSave = websites[0];
                pages.find({'websiteId':websiteId}).toArray(function(err, _pages){
                    if(err) {
                        console.log('Error getting pages: ' + err);
                        return callback(err);
                    }
                    console.log('retrieved pages');
                    pagesToSaveArray = _pages;
                    srcMongo.close();
                    destMongo.collection('accounts').save(accountToSave, function(err, savedAccount){
                        console.log('saved account [' + accountToSave._id + '].');
                        destMongo.collection('websites').save(websiteToSave, function(err, savedWebsite){
                            console.log('saved website [' + websiteToSave._id + ']');
                            var pagesCollection = destMongo.collection('pages');
                            async.eachSeries(pagesToSaveArray,
                                function(page, cb){
                                    pagesCollection.save(page, function(err, savedPage){
                                        if(err) {
                                            console.log('Error saving page: ' + page._id);
                                            cb(err);
                                        } else {
                                            console.log('saved page [' + page._id + ']');
                                            cb();
                                        }
                                    });
                                },
                                function(err){
                                    if(err) {
                                        console.log('Error during save: ' + err);
                                        destMongo.close();
                                        callback(err);
                                    } else {
                                        console.log('saved account, website, pages');
                                        destMongo.close();
                                        callback();
                                    }
                                });
                        });
                    });
                });
            });

        });
    },

    updateEmailCollection :function(fn) {
        var srcURL = mongoConfig.TEST_MONGODB_CONNECT;
        //var srcURL = mongoConfig.PROD_MONGODB_CONNECT
        var srcMongo = mongoskin.db(srcURL, {safe: true});

        var emails = srcMongo.collection('emails');
        var accounts = srcMongo.collection('accounts');
        //{_id:'1c7ed756-ad0b-4b5a-967b-47e794c5280d'}
        emails.find().toArray(function(err, emailAry){
            async.each(emailAry, function(email, cb){
                var accountId = parseInt(email.accountId);
                accounts.find({_id: accountId}).toArray(function(err, account){
                    //console.dir(account[0]);
                    if(account[0] && account[0].business && account[0].business.emails) {
                        console.log(account[0].business.name);
                        console.log(account[0].business.emails[0].email);
                        email.fromName = account[0].business.name;
                        email.fromEmail = account[0].business.emails[0].email;
                        email.replyTo = account[0].business.emails[0].email;
                        emails.save(email, function(){
                            cb();
                        });
                    } else {
                        cb();
                    }
                });

            }, function done(){
                console.log('done');
                fn();
            });
        });
    }


};

module.exports = copyutil;