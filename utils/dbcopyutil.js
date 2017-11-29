var mongoConfig = require('../configs/mongodb.config');
var _ = require('underscore');
var mongoskin = require('mongoskin');
var async = require('async');
var STRIPE_CUSTOMER_ID = 'cus_5Rf0LtLeyl1bh0';
var SUBSCRIPTION_ID = 'sub_5Rf0V4RGG9qSxT';
var STRIPE_PLAN_ID = 'pb70x50g7q';
var STRIPE_ACCESS_TOKEN = 'sk_test_osAnWDulUbCkgw0D2kkwo1Ju';
var STRIPE_REFRESH_TOKEN = 'rt_5NU1M6ubOAkICDJs0TpIa8iCRHDUwbSaC7VJgPXQ75MCfFGZ';

var PROD_STRIPE_CUSTOMER_ID = 'cus_5WAjoVo4WgofRd';
var PROD_SUBSCRIPTION_ID = 'EVERGREEN';
var PROD_STRIPE_PLAN_ID = 'EVERGREEN';

var utils = require('./commonutils');
require('../configs/log4js.config').configure();
var UUID = require('node-uuid');
var moment = require('moment');

var defaultSubscriptionPrivs = [
    'integrations/payments',
    'account',
    'analytics',
    'assets',
    'authentication',
    'campaign',
    'cms',
    'contact',
    'courses',
    'dashboard',
    'emaildata',
    'products',
    'user',
    'social/socialconfig',
    'order',
    'all'
];
var defaultPrivileges = [
    'VIEW_ACCOUNT',
    'VIEW_USER',
    'MODIFY_ACCOUNT',
    'MODIFY_USER',
    'VIEW_READINGS',
    'VIEW_CAMPAIGN',
    'MODIFY_CAMPAIGN',
    'VIEW_ANALYTICS',
    'MODIFY_ANALYTICS',
    'VIEW_WEBSITE',
    'MODIFY_WEBSITE',
    'VIEW_THEME',
    'MODIFY_THEME',
    'VIEW_TEMPLATE',
    'MODIFY_TEMPLATE',
    'VIEW_CONTACT',
    'MODIFY_CONTACT',
    'VIEW_COURSE',
    'MODIFY_COURSE',
    'VIEW_EMAIL_SOURCE',
    'MODIFY_EMAIL_SOURCE',
    'VIEW_EMAIL_MESSAGE',
    'MODIFY_PRODUCT',
    'VIEW_PRODUCT',
    'VIEW_PAYMENTS',
    'MODIFY_PAYMENTS',
    'VIEW_ASSET',
    'MODIFY_ASSET',
    'VIEW_DASHBOARD',
    'MODIFY_DASHBOARD',
    'VIEW_SOCIALCONFIG',
    'MODIFY_SOCIALCONFIG',
    'VIEW_ORDER',
    'MODIFY_ORDER',
    'MODIFY_PO',
    'VIEW_PO',
    'MODIFY_PROMOTION',
    'VIEW_PROMOTION',
    'VIEW_QUOTE',
    'MODIFY_QUOTE',
    'ALL'
];

var copyutil = {

    log: $$.g.getLogger("copyutil"),

    //TODO: make this safe!
    copyAccountFromTestToProd : function(accountId, cb) {
         var self = this;
        self._copyAccountWithUpdatedStripeIDs(accountId, mongoConfig.TEST_MONGODB_CONNECT, mongoConfig.PROD_MONGODB_CONNECT, false, true, cb);
    },
    copyAccountFromTestToTest : function(accountId, cb) {
        var self = this;
        self._copyAccountWithUpdatedStripeIDs(accountId, mongoConfig.TEST_MONGODB_CONNECT, mongoConfig.TEST_MONGODB_CONNECT, true, null, cb);
    },

    copyAccountFromProdToTest: function(accountId, cb) {
        var self = this;
        //self._copyAccount(accountId, mongoConfig.PROD_MONGODB_CONNECT, mongoConfig.TEST_MONGODB_CONNECT, cb);
        self._copyAccountWithUpdatedStripeIDs(accountId, mongoConfig.PROD_MONGODB_CONNECT, mongoConfig.TEST_MONGODB_CONNECT, null, null, cb);

    },

    copyAccountFromProdToProd: function(accountId, cb) {
        var self = this;
        self._copyAccountWithUpdatedStripeIDs(accountId, mongoConfig.PROD_MONGODB_CONNECT, mongoConfig.PROD_MONGODB_CONNECT, true, null, cb);

    },

    copyPageFromTestToProd : function(pageId, accountId, cb) {
         var self = this;
        self._copyPage(pageId, accountId, mongoConfig.TEST_MONGODB_CONNECT, mongoConfig.PROD_MONGODB_CONNECT, cb);
    },

    copyPageFromTestToTest : function(pageId, accountId, cb) {
        var self = this;
        self._copyPage(pageId, accountId, mongoConfig.TEST_MONGODB_CONNECT, mongoConfig.TEST_MONGODB_CONNECT, cb);
    },

    copyPageFromProdToTest: function(pageId, accountId, cb) {
        var self = this;
        self._copyPage(pageId, accountId, mongoConfig.PROD_MONGODB_CONNECT, mongoConfig.TEST_MONGODB_CONNECT, cb);

    },

    copyPageFromProdToProd: function(pageId, accountId, cb) {
        var self = this;
        self._copyPage(pageId, accountId, mongoConfig.PROD_MONGODB_CONNECT, mongoConfig.PROD_MONGODB_CONNECT, cb);

    },

    convertAccountToSiteTemplate: function(accountId, cb) {
        var self = this;
        self._convertAccountToSiteTemplate(accountId, cb);
    },
    updateBlogPages: function(cb) {
        var self = this;
        self._updateBlogPages(cb);
    },
    enableSiteBuilderOnLegacyAccountOnTest : function(accountId, cb) {
        var self = this;
        self._enableSiteBuilderOnLegacyAccount(accountId, mongoConfig.TEST_MONGODB_CONNECT, cb);
    },

    enableSiteBuilderOnLegacyAccountOnProd: function(accountId, cb) {
        var self = this;
        //self._copyAccount(accountId, mongoConfig.PROD_MONGODB_CONNECT, mongoConfig.TEST_MONGODB_CONNECT, cb);
        self._enableSiteBuilderOnLegacyAccount(accountId, mongoConfig.PROD_MONGODB_CONNECT, cb);
    },

    migrateToSSBBlogOnTest: function(accountId, cb) {
        var self = this;
        console.log('Migrating TEST account: [' + accountId + ']');
        self._ensureLatestSectionProperty(accountId, mongoConfig.TEST_MONGODB_CONNECT, function(err){
            self._migrateToSSBBlog(accountId, mongoConfig.TEST_MONGODB_CONNECT, cb);
        });

    },

    migateToSSBBlogOnProd: function(accountId, cb) {
        var self = this;
        console.log('Migrating PROD account: [' + accountId + ']');
        self._ensureLatestSectionProperty(accountId, mongoConfig.PROD_MONGODB_CONNECT, function(err){
            self._migrateToSSBBlog(accountId, mongoConfig.PROD_MONGODB_CONNECT, cb);
        });
    },

    updatePlatformSectionsLeadSource :function(fn) {
        var srcURL = mongoConfig.TEST_MONGODB_CONNECT;
        //var srcURL = mongoConfig.PROD_MONGODB_CONNECT
        var srcMongo = mongoskin.db(srcURL, {safe: true});

        var sections = srcMongo.collection('sections');

        sections.find({accountId:0, enabled: true}).toArray(function(err, sectionArry){
            async.each(sectionArry, function(section, cb){
                if(section.filter == 'welcome hero'){
                    section.orgConfig = [
                        {
                            "orgId" : 5,
                            "filter" : "carousels"
                        }
                    ]
                    sections.save(section, function(){
                        cb();
                    });
                }
                else if(section.filter == 'testimonials' && section.version == 2){
                    section.orgConfig = [
                        {
                            "orgId" : 5,
                            "filter" : "carousels"
                        }
                    ]
                    sections.save(section, function(){
                        cb();
                    });
                }
                else if(section.filter == 'products & services' && section.type !== 'products'){
                    section.orgConfig = [
                        {
                            "orgId" : 5,
                            "filter" : "services"
                        }
                    ]
                    sections.save(section, function(){
                        cb();
                    });
                }
                else{
                    cb();
                }
            }, function done(){
                console.log('done');
                fn();
            });
        });
    },


    _ensureLatestSectionProperty: function(accountId, dbConnect, fn) {
        var self = this;
        var srcMongo = mongoskin.db(dbConnect, {safe:true});
        var pagesCollection = srcMongo.collection('pages');
        var sectionsCollection = srcMongo.collection('sections');

        async.waterfall([
            function(cb){
                pagesCollection.find({accountId:accountId, latest:true}).toArray(function(err, items){
                    if(err) {
                        cb(err);
                    } else {
                        var sectionIdAry = [];
                        _.each(items, function(page){
                            sectionIdAry = sectionIdAry.concat(page.sections);
                        });
                        cb(null, sectionIdAry);
                    }
                });
            },
            function(sectionIdAry, cb) {
                //console.log('fixing these sections:', sectionIdAry);
                async.eachSeries(sectionIdAry, function(section, callback){
                    if(section && section._id) {
                        sectionsCollection.find({_id: section._id}).toArray(function(err, items){
                            if(err) {
                                callback(err);
                            } else {
                                if(items && items[0]) {
                                    items[0].latest = true;
                                    console.log('saving:', items[0]._id);
                                    sectionsCollection.save(items[0], function(err, value){
                                        callback(err);
                                    });
                                } else {
                                    callback();
                                }
                            }
                        });
                    } else {
                        callback();
                    }

                }, function(err){
                    cb(err);
                });
            }

        ], function(err){
            if(err) {
                console.log('Error fixing section latest property:', err);
            } else {
                console.log('Fixed section latest property.');
            }
            fn(err);
        });
    },

    _migrateToSSBBlog: function(accountId, dbConnect, fn) {
        var self = this;
        var srcMongo = mongoskin.db(dbConnect, {safe:true});

        /*
         * 1. account.showhide.ssbBlog = true
         * 2. create blog-list and blog-post using global headers
         * 3. Ensure navigation only links to /blog (nothing to do here.)
         * 4. Admin navigation hide link to Blog Posts (nothing to do here.)
         */

        var accountsCollection = srcMongo.collection('accounts');
        var pagesCollection = srcMongo.collection('pages');
        var sectionsCollection = srcMongo.collection('sections');
        var templatesCollection = srcMongo.collection('templates');
        var publishedPagesCollection = srcMongo.collection('published_pages');

        async.waterfall([
            function(cb) {
                accountsCollection.find({'_id':accountId}).toArray(function(err, items){
                    if(err || !items || items.length < 1) {
                        console.log('Error getting account:', err);
                        err = err || 'Account not found';
                        cb(err);
                    } else {
                        cb(null, items[0]);
                    }
                });
            },
            function(accountJSON, cb) {
                accountJSON.showhide.ssbBlog = true;
                //update this last so we know when we are done with account
                templatesCollection.find({handle: {$in:['blog-list', 'blog-post']}}).toArray(function(err, items){
                    if(err || !items || items.length !== 2) {
                        console.log('Wrong number of templates (or error): ', err);
                        err = err || 'Wrong number of templates';
                        cb(err);
                    } else {
                        cb(null, accountJSON, items);
                    }
                });

            },
            function(accountJSON, templateJSONAry, cb) {
                var websiteID = accountJSON.website.websiteId;
                var pageJSONAry = [];
                async.eachSeries(templateJSONAry, function(template, callback){
                    template.accountId = accountId;
                    template.websiteId = websiteID;
                    template._id = UUID.v4();
                    self._copySectionsForAccount(template.sections, accountId, sectionsCollection, function(err, sections){
                        //console.log('sections:', sections);
                        template.sections = sections;
                        pageJSONAry.push(template);
                        callback(err);
                    });

                }, function(err){
                    cb(err, accountJSON, templateJSONAry, pageJSONAry);
                });
            },

            function(accountJSON, templateJSONAry, pageJSONAry, cb) {
                var query = {
                    accountId:accountId,
                    globalHeader:true,
                    global:true,
                    latest: true
                };
                var orderByObj = {};
                orderByObj['modified.date'] = -1;
                var globalHeader = null;
                sectionsCollection.find(query).sort(orderByObj).toArray(function(err, items){
                    if(err) {
                        cb(err);
                    } else {
                        if(items && items.length > 0) {
                            globalHeader = items[0];
                        }
                        cb(null, accountJSON, templateJSONAry, pageJSONAry, globalHeader);
                    }
                });
            },
            function(accountJSON, templateJSONAry, pageJSONAry, globalHeader, cb) {
                if(globalHeader) {
                    _.each(pageJSONAry, function(page){
                        page.sections[0]._id = globalHeader._id;
                    });
                }
                async.eachSeries(pageJSONAry, function(page, callback){
                    pagesCollection.save(page, function(err, savedPage){
                        callback(err);
                    });
                }, function(err){
                    accountsCollection.save(accountJSON, function(err, savedAccount){
                        cb(err, pageJSONAry);
                    });
                });
            },
            function derefSectionsIntoPages(pages, cb) {
                async.eachSeries(pages, function(page, callback){
                    if(page.sections) {
                        self._dereferenceSections(page.sections, sectionsCollection, function(err, sections){
                            if(err) {
                                self.log.error('Error dereferencing sections');
                                callback(err);
                            } else {
                                page.sections =  sections;
                                callback(null);
                            }
                        });
                    } else {
                        callback();
                    }

                }, function(err){
                    if(err) {
                        self.log.error('Error dereferencing sections:', err);
                        cb(err);
                    } else {
                        cb(null, pages);
                    }
                });

            },
            function saveIntoPublishedCollection(pages, cb) {
                self.log.debug('saving published pages');
                async.eachSeries(pages, function(page, callback){
                    publishedPagesCollection.save(page, function(err, savedPage){
                        callback(err);
                    });
                }, function(err){
                    if(err) {
                        self.log.error('Error saving published pages:', err);
                        cb(err);
                    } else {
                        cb(null);
                    }
                });
            }
        ], function done(err){
            if(err) {
                console.log('Error updating account [' + accountId + ']:', err);
            } else {
                console.log('Finished updating account:' + accountId);
            }
            fn();
        });
    },
    copyEmailComponentName : function( dbtype, fn) {
            var srcMongo;
            if(dbtype === 'test'){
                srcMongo = mongoskin.db(mongoConfig.TEST_MONGODB_CONNECT, {safe: true});
                console.log('updating test database emails...');
            }else{
                srcMongo = mongoskin.db(mongoConfig.TEST_MONGODB_CONNECT, {safe: true});
                console.log('updating production database emails...');
            }

            var email = srcMongo.collection('emails');
            var accounts = srcMongo.collection('accounts');

            //get all the accounts
            accounts.find({_id:2816}).toArray(function(err, _accounts){
                    if (err) {
                        console.log('Error getting _page: ' + err);
                        return fn(err);
                    }

                async.eachSeries(_accounts, function(account, account_callback){
                    console.log('updating emails of account : ',account._id);
                    //find all the emails of current account
                    email.find({'accountId':account._id}).toArray(function(err, emails){
                        if (err) {console.log(emails.length);
                            console.log('Error getting _page: ' + err);
                            return fn(err);
                        }

                        console.log('total emails to be updated : ',emails.length);
                        if(emails.length > 0){

                            async.eachSeries(emails, function(_email, callback){

                                var componets_data = _email.components;
                                if(componets_data.length > 0){
                                    var cp=_.map(componets_data, function(com, key){
                                        com.display_name = com.type;
                                        return com;
                                    });

                                     _email.components = cp;
                                     email.update({_id : _email._id}, _email, function(err, savedSection){
                                        if(err) {
                                            console.log('Error saving section:' + err);
                                            callback(err);
                                        } else {
                                            console.log('data upated for email ',_email._id);
                                            callback(null);
                                        }

                                    });

                                 }
                                else{
                                       callback(null);
                                }


                            }, function done(err,result){

                               account_callback();
                            });

                        }
                        else{

                             account_callback();
                        }
                     });

                     }, function done(err,result){
                               fn();
                     });
                   });
            console.log('updating emails....');

    },
    _copyPage: function(srcPageId, destAccountId, srcDBUrl, destDBUrl, fn) {
        var srcMongo = mongoskin.db(srcDBUrl, {safe: true});
        var destMongo = mongoskin.db(destDBUrl, {safe: true});

        var pageToSave;
        var sectionsToSaveArray = [];
        var pages = srcMongo.collection('pages');
        var sections = srcMongo.collection('sections');
        async.waterfall([
            function(cb){
                pages.find({'_id':srcPageId}).toArray(function(err, _page){
                    if (err) {
                        console.log('Error getting _page: ' + err);
                        return cb(err);
                    }
                    pageToSave = _page[0];
                    if(pageToSave){
                        var sectionIdsArray=_.map(pageToSave.sections, function(section, key){ return section._id; });
                        cb(null,sectionIdsArray);
                    }else{
                        console.log("Page not found with this id: "+srcPageId);
                        cb("Page not found with this id.");
                    }
                });
            },
            function(sectionIdsArray, cb) {
                sections.find({ '_id': { $in: sectionIdsArray } }).toArray(function (err, sections) {
                    if (err) {
                        console.log('Error getting sections:', err);
                        return cb(err);
                    } else {
                        sectionsToSaveArray = sections;
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

                var accounts = destMongo.collection('accounts');
                accounts.find({'_id':destAccountId}).toArray(function(err, account){
                    if(err) {
                        console.log('Error getting account:', err);
                        cb(err);
                    } else {
                        var destAccount = account[0];
                        if(destAccount){
                            cb(null,destAccount);
                        } else{
                            console.log("Account not found with this id: "+destAccountId);
                            cb("Account not found with this id.");
                        }
                    }

                });
            },
            function saveSections(destAccount, cb) {
                var sectionsCollection = destMongo.collection('sections');
                var sections=[];
                async.eachSeries(sectionsToSaveArray, function(section, callback){
                    section.accountId = destAccount._id;
                    section._id = utils.idutils.generateUUID();

                    sectionsCollection.save(section, function(err, savedSection){
                        if(err) {
                            console.log('Error saving section:' + err);
                            callback(err);
                        } else {
                            sections.push({'_id':section._id});
                            callback(null);
                        }
                    });
                }, function done(err,result){
                    cb(null, destAccount, sections);
                });
            },
            function (destAccount, sections, cb) {
                    pageToSave.accountId = destAccount._id;
                    pageToSave.websiteId = destAccount.website.websiteId;
                    pageToSave._id = utils.idutils.generateUUID();
                    pageToSave.sections = sections;
                    var pagesCollection = destMongo.collection('pages');
                    pagesCollection.save(pageToSave, function(err, savedPage){
                        if(err) {
                            console.log('Error saving page: ' + pageToSave._id);
                            cb(err);
                        } else {
                            console.log('saved page [' + pageToSave._id + ']');
                            cb();
                        }
                    });
            }
        ], function done(err){
            console.log('Closing mongo connections');
            destMongo.close();
            fn();
        });
    },


    _copyAccountWithUpdatedStripeIDs: function(srcAccountId, srcDBUrl, destDBUrl, forceNewAccount, useProdStripe, fn) {
        var srcMongo = mongoskin.db(srcDBUrl, {safe: true});
        var destMongo = mongoskin.db(destDBUrl, {safe: true});

        var accountToSave;
        var websiteToSave;
        var pagesToSaveArray = [];
        var publishedpagesToSaveArray = [];
        var privilegeToSave = [];
        var productsToSaveArray = [];
        var postsToSaveArray = [];
        var sectionsToSaveArray = [];
        var accounts = srcMongo.collection('accounts');
        var websites = srcMongo.collection('websites');
        var pages = srcMongo.collection('pages');
        var publishedpages = srcMongo.collection('published_pages');
        var privileges = srcMongo.collection('privileges');
        var sections = srcMongo.collection('sections');
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
                privileges.find({'accountId':srcAccountId,'userId':1}).toArray(function(err, _privilege){
                    if(err) {
                        console.log('Error getting _privilege:', err);
                        cb(err);
                    } else {
                        privilegeToSave = _privilege[0];
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
                    cb(null,websiteId);
                });
            },
            function(websiteId, cb) {
                publishedpages.find({'websiteId':websiteId, latest:true}).toArray(function(err, _publishedpages) {
                    if (err) {
                        console.log('Error getting published pages: ' + err);
                        return cb(err);
                    }
                    console.log('retrieved published pages');
                    publishedpagesToSaveArray = _publishedpages;
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
                sections.find({accountId:srcAccountId}).toArray(function (err, sections) {
                    if (err) {
                        console.log('Error getting sections:', err);
                        return cb(err);
                    } else {
                        sectionsToSaveArray = sections;
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

                //if forceNewAccount is true, just create a new account
                if (forceNewAccount) {

                    destMongo.collection('accounts').findAndModify(
                        { _id: "__counter__" },
                        [],
                        { $inc: { seq: 1 } },
                        { new: true, upsert: true },
                        function (err, value) {
                            if(value && value.value && !value.hasOwnProperty('seq')) {
                                value = value.value;
                            }
                            if (!err && value != null && value.hasOwnProperty('seq')) {
                                cb(null, value.seq);
                            } else {
                                console.log('Error getting nextAccountId:', err);
                                cb(null, 99999);
                            }
                        }
                    );

                } else {

                    //else look for account by subdomain.  If exists, use that accountId.  Else use new one.
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
                                    if(value && value.value && !value.hasOwnProperty('seq')) {
                                        value = value.value;
                                    }
                                    if (!err && value != null && value.hasOwnProperty('seq')) {
                                        cb(null, value.seq);
                                    } else {
                                        console.log('Error getting nextAccountId:', err);
                                        cb(null, 999999);
                                    }
                                }
                            );
                        }
                    });

                }

            },
            function(newAccountId, cb) {
                console.log('New AccountId:' + newAccountId);
                accountToSave._id = newAccountId;
                if(useProdStripe === true) {
                    accountToSave.billing.stripeCustomerId = PROD_STRIPE_CUSTOMER_ID;
                    accountToSave.billing.subscriptionId = PROD_SUBSCRIPTION_ID;
                    accountToSave.billing.plan = PROD_STRIPE_PLAN_ID;
                } else {
                    accountToSave.billing.stripeCustomerId = STRIPE_CUSTOMER_ID;
                    accountToSave.billing.subscriptionId = SUBSCRIPTION_ID;
                    accountToSave.billing.plan = STRIPE_PLAN_ID;
                    if(accountToSave.credentials['type'=='stripe']) {
                        var credentials = accountToSave.credentials['type'=='stripe'];
                        credentials.accessToken = STRIPE_ACCESS_TOKEN;
                        credentials.refreshToken = STRIPE_REFRESH_TOKEN;
                    }
                }


                if (forceNewAccount) {
                    var uniqueDomainSuffix = $$.u.idutils.generateUniqueAlphaNumeric(5, true, true);
                    accountToSave.subdomain = accountToSave.subdomain + uniqueDomainSuffix;
                    console.log('New subdomain:', accountToSave.subdomain);
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
                console.log('saving privileges with accountId:' + newAccountId);
                var privilegesCollection = destMongo.collection('privileges');
                privilegeToSave.accountId = newAccountId;

                if (forceNewAccount) {
                    privilegeToSave._id = utils.idutils.generateUUID();
                }

                privilegesCollection.save(privilegeToSave, function(err, savedPrivilege){
                        if(err) {
                            console.log('Error saving privilege: ' + privilegeToSave._id);
                            cb(err, null);
                        } else {
                            console.log('saved privilege [' + privilegeToSave._id + ']');
                            cb(null, newAccountId);
                        }
                });
            },
            function(newAccountId, cb) {
                websiteToSave.accountId = newAccountId;
                if(!websiteToSave._id || forceNewAccount) {
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

                    if (forceNewAccount) {
                        page._id = utils.idutils.generateUUID();
                    }

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
            function(newAccountId, newWebsiteId, blogPageId, cb) {
                console.log('saving pages with accountId:' + newAccountId + ' and websiteId:' + newWebsiteId);
                var publishedpagesCollection = destMongo.collection('published_pages');
                async.eachSeries(publishedpagesToSaveArray, function(publishedpage, callback){
                    publishedpage.accountId = newAccountId;
                    publishedpage.websiteId = newWebsiteId;

                    if (forceNewAccount) {
                        publishedpage._id = utils.idutils.generateUUID();
                    }

                    publishedpagesCollection.save(publishedpage, function(err, savedPublishedPage){
                        if(err) {
                            console.log('Error saving publishedpage: ' + publishedpage._id);
                            callback(err);
                        } else {
                            console.log('saved publishedpage [' + publishedpage._id + ']');
                            if(publishedpage.handle === 'blog') {
                                blogPageId = publishedpage._id;
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

                    if (forceNewAccount) {
                        product._id = utils.idutils.generateUUID();
                    }

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

                    if (forceNewAccount) {
                        post._id = utils.idutils.generateUUID();
                    }

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
                    cb(err, newAccountId);
                });
            },
            function saveSections(newAccountId, cb) {
                var sectionsCollection = destMongo.collection('sections');
                async.eachSeries(sectionsToSaveArray, function(section, callback){
                    section.accountId = newAccountId;

                    if (forceNewAccount) {
                        section.oldId = section._id;
                        section._id = utils.idutils.generateUUID();
                        console.log('saving section and changing id from [' + section.oldId + '] to [' + section._id + ']');
                    }

                    sectionsCollection.save(section, function(err, savedSection){
                        if(err) {
                            console.log('Error saving section:' + err);
                            callback(err);
                        } else {
                            //console.log('Saved section:' + savedSection._id, savedSection);
                            callback();
                        }
                    });
                }, function done(err){
                    cb(err, newAccountId);
                });
            },
            function doSecurity(newAccountId, cb) {
                //create a subscription privs object
                var subpriv = {
                    _id: utils.idutils.generateUUID(),
                    accountId: newAccountId,
                    subscriptionId: STRIPE_PLAN_ID,
                    activePrivs: defaultSubscriptionPrivs,
                    created: {
                        date: new Date(),
                        by: 1
                    }
                };
                var subprivsCollection = destMongo.collection('subscription_privileges');
                subprivsCollection.save(subpriv, function(err, savedPriv){
                    if(err) {
                        console.log('Error saving subscription privs');
                        cb(err);
                    } else {
                        cb(null,newAccountId);
                    }
                });
            },
            function relateUser(newAccountId, cb) {
                console.log('relate User: 1 to accountId:' + newAccountId);
                var usersCollection = destMongo.collection('users');
                usersCollection.findOne({"_id":1}, function(err, user){
                    if(err) {
                        console.log('Error getting user of privs account');
                        cb(err);
                    } else {
                        var userNewAccount=user.accounts[0];
                        userNewAccount.accountId=newAccountId;
                        user.accounts.push(userNewAccount);
                        usersCollection.update({"_id":1},{ $set:{accounts: user.accounts}},function(err, updateduser){
                            if(err) {
                                console.log('Error in updating user of privs account');
                                cb(err);
                            }else{
                                cb();
                            }
                        });
                    }
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
    },

    updateFooterTextYear :function(oldYear, newYear, fn) {
        var srcURL = mongoConfig.TEST_MONGODB_CONNECT;
        //var srcURL = mongoConfig.PROD_MONGODB_CONNECT
        var srcMongo = mongoskin.db(srcURL, {safe: true});

        var sections = srcMongo.collection('sections');
        var _oldyeartext = 'Copyright &copy; '+ oldYear +'. All Rights reserved.';
        var _newyeartext = 'Copyright &copy; '+ newYear +'. All Rights reserved.';
        sections.find({'components.type':'footer', accountId: 0, 'components.text': _oldyeartext}).toArray(function(err, sectionArry){
            async.each(sectionArry, function(section, cb){
                if(section.components && section.components.length && section.components[0].type == 'footer' && section.components[0].text == _oldyeartext){
                    section.components[0].text = _newyeartext;
                    sections.save(section, function(){
                        cb();
                    });
                }
                else{
                    cb();
                }
            }, function done(){
                console.log('done');
                fn();
            });
        });
    },

    updateThumbnailSliderImages :function(fn) {
        var srcURL = mongoConfig.TEST_MONGODB_CONNECT;
        //var srcURL = mongoConfig.PROD_MONGODB_CONNECT
        var srcMongo = mongoskin.db(srcURL, {safe: true});

        var sections = srcMongo.collection('sections');

        sections.find({'components.type':'thumbnail-slider', accountId: {$ne:0},  latest: {$ne:false}}).toArray(function(err, sectionArry){
            async.each(sectionArry, function(section, cb){
                if(section.components && section.components.length && section.components[0].type == 'thumbnail-slider' && section.components[0].thumbnailCollection){
                    _.each(section.components[0].thumbnailCollection, function(image){
                        if(!image.img){
                            image.img = "<img src=\"" + image.url + "\">";
                        }
                    })
                    sections.save(section, function(){
                        cb();
                    });
                }
                else{
                    cb();
                }
            }, function done(){
                console.log('done');
                fn();
            });
        });
    },


    _updateBlogPages :function(fn) {

        var srcURL = mongoConfig.PROD_MONGODB_CONNECT,
        //var srcURL = mongoConfig.PROD_MONGODB_CONNECT
            srcMongo = mongoskin.db(srcURL, {safe: true}) ,
            pagesCollection = srcMongo.collection('pages'),
            sectionCollection = srcMongo.collection('sections'),
            recentPost ,recentTag,recentCategory;
        async.waterfall([
            function getCategorySection(cb){
                console.log("getCategorySection");
                sectionCollection.find({ "accountId": 0, "components.type":"ssb-recent-category"}).toArray(function(err, rp){
                   if(err) {
                        console.log('Error finding category in test:', err);
                        cb(err);
                    } else {
                        console.log("data");
                         console.log(rp);
                        recentCategory=rp[0];
                        cb();
                    }
                });
            },
            function getPostSection(cb){
                console.log("getPostSection");
                sectionCollection.find({ "accountId": 0, "components.type":"ssb-recent-post"}).toArray(function(err, rp){
                   if(err) {
                        console.log('Error finding post in test:', err);
                        cb(err);
                    } else {
                        recentPost=rp[0];
                        cb();
                    }
                });
            },
            function getTagSection(cb){
                console.log("getTagSection");
                sectionCollection.find({ "accountId": 0, "components.type":"ssb-recent-tag"}).toArray(function(err, rp){
                   if(err) {
                        console.log('Error finding tag in test:', err);
                        cb(err);
                    } else {
                        recentTag=rp[0];
                        cb();
                    }
                });
            },
            function getAndUpdate(cb){
                 //utils.idutils.generateUUID(); db.getCollection('pages').find({ handle: 'blog-list', accountId:2616,latest:true})
                //{_id:'1c7ed756-ad0b-4b5a-967b-47e794c5280d'}   {"handle":'blog-list',$where: '(this.sections.length ==9),latest:true'}
                pagesCollection.find({"handle":'blog-list',$where: '(this.sections.length ==9)',latest:true}).toArray(function(err, pagesA){
                    console.log(pagesA.length);
                    async.eachSeries(pagesA, function(page, callback){
                        var section=JSON.parse(JSON.stringify(recentCategory)),id=utils.idutils.generateUUID();
                        section._id=id;
                        section.anchor = id;
                        section.accountId = page.accountId;
                        console.log("post"+recentPost._id);
                        console.log("tag"+recentTag._id);
                        console.log("category"+recentCategory._id);
                        sectionCollection.save(section, function(err, savedSection){
                            if(err) {
                                console.log('Error section save:', err);
                                callback(err);
                            } else {
                                pagesCollection.update(
                                    { handle: 'blog-list', _id: page._id },
                                    { $push: {
                                        sections: {
                                            $each: [{
                                                _id: section._id
                                            }],
                                            $position: 6
                                        },
                                        "layoutModifiers.2-col-2": 8
                                    },
                                     $set: {
                                         "layoutModifiers.footer":[9]
                                     }
                                    });
                                callback();
                            }
                        });
                    }, function(err){
                        if(err){
                            cb(err);
                        }else{
                            cb();
                        }
                    });
                });
            },
            function getAndUpdateRemaining(cb){
                 //utils.idutils.generateUUID(); db.getCollection('pages').find({ handle: 'blog-list', accountId:2616,latest:true})
                //{_id:'1c7ed756-ad0b-4b5a-967b-47e794c5280d'}

                pagesCollection.find({"handle":'blog-list',$where: '(this.sections.length ==7)',latest:true}).toArray(function(err, pagesArray){
                     async.eachSeries(pagesArray, function(page, callback){
                        var sectionCat=JSON.parse(JSON.stringify(recentCategory)),cat_id=utils.idutils.generateUUID();
                        sectionCat._id=cat_id;
                        sectionCat.anchor = cat_id;
                        sectionCat.accountId = page.accountId;

                        var sectionPost=JSON.parse(JSON.stringify(recentPost)),post_id=utils.idutils.generateUUID();
                        sectionPost._id=post_id;
                        sectionPost.anchor = post_id;
                        sectionPost.accountId = page.accountId;

                        var sectionTag=JSON.parse(JSON.stringify(recentTag)),tag_id=utils.idutils.generateUUID();
                        sectionTag._id=tag_id;
                        sectionTag.anchor = tag_id;
                        sectionTag.accountId = page.accountId;
                         async.waterfall([
                             function saveCategory(_cb){
                                 sectionCollection.save(sectionCat, function(err, savedSection){
                                      if(err) {
                                          _cb(err);
                                      } else {
                                          _cb();
                                      }
                                });
                             },
                             function savePost(_cb){
                                 sectionCollection.save(sectionPost, function(err, savedSection){
                                     if(err) {
                                          _cb(err);
                                      } else {
                                          _cb();
                                      }
                                });
                             },
                             function saveTag(_cb){
                                 sectionCollection.save(sectionTag, function(err, savedSection){
                                     if(err) {
                                          _cb(err);
                                      } else {
                                          _cb();
                                      }
                                });
                             },
                             function updatePage(_cb){
                                 var secArray=page.sections;
                                 secArray.splice(3, 0, { "_id" : sectionPost._id });
                                 secArray.splice(5, 0, { "_id" : sectionTag._id });
                                 secArray.splice(6, 0, { "_id" : sectionCat._id });
                                 pagesCollection.update({
                                   handle: 'blog-list',
                                    _id: page._id
                                }, {
                                     $set: {
                                         sections: secArray,
                                        "layoutModifiers.2-col-2": [0,1,2,3,4,5,6,7,8],
                                         "layoutModifiers.footer":[9]
                                     }
                                 });
                                 _cb();
                             }
                         ], function done(err){
                              if(err){
                                  callback(err);
                              }else{
                                  callback();
                              }

                         });
                     }, function(err){
                         if(err){
                            cb(err);
                        }else{
                            cb();
                        }
                    });
                });
            }

        ], function done(err){
            srcMongo.close();
            fn(err);
        });
    },
    syncSSBArtifacts: function(fn) {
        var srcDBUrl = mongoConfig.TEST_MONGODB_CONNECT;
        var destDBUrl = mongoConfig.PROD_MONGODB_CONNECT;
        //var destDBUrl = mongoConfig.LOCAL_MONGODB_CONNECT;

        var srcMongo = mongoskin.db(srcDBUrl, {safe: true});
        var destMongo = mongoskin.db(destDBUrl, {safe: true});

        //themes, templates, sitetemplates, sections
        var themes = srcMongo.collection('themes');
        var templates = srcMongo.collection('templates');
        var sitetemplates = srcMongo.collection('sitetemplates');
        var sections = srcMongo.collection('sections');

        async.waterfall([
            function copyThemes(cb) {
                console.log('copying themes');
                themes.find({'accountId':0}).toArray(function(err, items){
                    if(err) {
                        console.log('Error finding themes in test:', err);
                        cb(err);
                    } else {

                        var themesCollection = destMongo.collection('themes');
                        async.eachSeries(items,
                            function(theme, _cb){
                                themesCollection.save(theme, function(err, savedTheme){
                                    _cb(err);
                                });
                            },
                            function(err){
                                if(err) {
                                    console.log('Error during save: ' + err);
                                    cb(err);
                                } else {
                                    console.log('saved themes');
                                    cb();
                                }
                            }
                        );
                    }
                });
            },
            function copyTemplates(cb) {
                console.log('copying templates');
                templates.find({'accountId':0}).toArray(function(err, items){
                    if(err) {
                        console.log('Error finding templates in test:', err);
                        cb(err);
                    } else {
                        var templatesCollection = destMongo.collection('templates');
                        async.eachSeries(items,
                            function(template, _cb){
                                templatesCollection.save(template, function(err, savedTemplate){
                                    _cb(err);
                                });
                            },
                            function(err){
                                if(err) {
                                    console.log('Error during save: ' + err);
                                    cb(err);
                                } else {
                                    console.log('saved templates');
                                    cb();
                                }
                            }
                        );
                    }
                });
            },
            function copySitetemplates(cb) {
                console.log('copying siteTemplates');
                sitetemplates.find({'accountId':0}).toArray(function(err, items){
                    if(err) {
                        console.log('Error finding sitetemplates in test:', err);
                        cb(err);
                    } else {
                        var sitetemplatesCollection = destMongo.collection('sitetemplates');
                        async.eachSeries(items,
                            function(template, _cb){
                                sitetemplatesCollection.save(template, function(err, savedTemplate){
                                    _cb(err);
                                });
                            },
                            function(err){
                                if(err) {
                                    console.log('Error during save: ' + err);
                                    cb(err);
                                } else {
                                    console.log('saved sitetemplates');
                                    cb();
                                }
                            }
                        );
                    }
                });
            },
            function copySections(cb) {
                console.log('copying sections');
                sections.find({'accountId':0}).toArray(function(err, items){
                    if(err) {
                        console.log('Error finding sections in test:', err);
                        cb(err);
                    } else {
                        var sectionsCollection = destMongo.collection('sections');
                        async.eachSeries(items,
                            function(section, _cb){
                                sectionsCollection.save(section, function(err, savedSection){
                                    _cb(err);
                                });
                            },
                            function(err){
                                if(err) {
                                    console.log('Error during save: ' + err);
                                    cb(err);
                                } else {
                                    console.log('saved sections');
                                    cb();
                                }
                            }
                        );
                    }
                });
            }
        ], function done(err){
            srcMongo.close();
            destMongo.close();
            fn(err);
        });
    },

    _convertAccountToSiteTemplate: function(accountId, fn) {
        var srcDBUrl = mongoConfig.TEST_MONGODB_CONNECT;
        var srcMongo = mongoskin.db(srcDBUrl, {safe: true});
        var accountssCollection = srcMongo.collection('accounts');
        var websitesCollection = srcMongo.collection('websites');
        var pagesCollection = srcMongo.collection('pages');
        var templatesCollection = srcMongo.collection('templates');
        var sectionsCollection = srcMongo.collection('sections');
        var sitetemplatesCollection = srcMongo.collection('sitetemplates');
        var siteTemplate = {
            "_id" : utils.idutils.generateUUID(),
            "subdomain": "#SUBDOMAIN#",
            "name" : "#SUBDOMAIN#",
            "description" : "Site Template #SUBDOMAIN# from account:" + accountId,
            "previewUrl" : "https://placeholdit.imgix.net/~text?txtsize=33&txt=#SUBDOMAIN#&w=672&h=383",
            "accountId" : 0,
            "public" : true,
            "siteThemeId" : "565decfdfa7d8f489a489104",
            "defaultPageTemplates" : [],
            "created" : {
                "date" : new Date().toISOString(),
                "by" : 0
            },
            "modified" : {
                "date" : new Date().toISOString(),
                "by" : 0
            }
        }

        /*
         * 1. Get the account object
         *      - token replace subdomain
         * 2. Get the website object
         * 3. Update siteTemplate siteThemeId prop with website.themeId
         * 4. Get the ssb pages on the account ({latest:true})
         * 5. Save all section _ids to sectionMap
         * 6. Save all sections as new sections with:
         *      - accountId=0
         *      - siteTemplateRef=siteTemplate._id
         *      - enabled=false
         *
         * 7. Save all new _ids to sectionMap mapped to old ids
         * 8. Loop through pages, updating section _ids and saving as templates
         * 9. Update siteTemplate defaultPageTemplates prop with new template _ids, name, handles
         * 10. Save siteTemplate
         */

        async.waterfall([
            function getAccount(cb) {
                console.log('getAccount: fetch account by _id');
                accountssCollection.find({'_id': accountId}).toArray(function(err, account){

                    if (err || !account[0]) {
                        console.log('Error finding account in test:', err);
                        return cb(err);
                    }

                    siteTemplate.subdomain = siteTemplate.name.replace('#SUBDOMAIN#', account[0].subdomain);
                    siteTemplate.name = siteTemplate.name.replace('#SUBDOMAIN#', account[0].subdomain);
                    siteTemplate.description = siteTemplate.description.replace('#SUBDOMAIN#', account[0].subdomain);
                    siteTemplate.previewUrl = siteTemplate.previewUrl.replace('#SUBDOMAIN#', account[0].subdomain);

                    return cb(null);

                });
            },
            function getWebsite(cb) {
                console.log('getWebsite: fetch account website');
                websitesCollection.find({'accountId': accountId}).toArray(function(err, websites){

                    if (err || !websites[0]) {
                        console.log('Error finding account website in test:', err);
                        return cb(err);
                    }

                    siteTemplate.siteThemeId = websites[0].themeId;
                    siteTemplate.siteThemeOverrides = websites[0].themeOverrides;

                    return cb(null, websites[0]);

                });
            },
            function getPages(website, cb) {
                console.log('getPages: fetch account pages and loop through section data');
                pagesCollection.find({'accountId': accountId, 'ssb': true, 'latest': true}).toArray(function(err, pages){
                    if (err) {
                        console.log('Error finding pages:', err);
                        return cb(err);
                    }

                    var sectionMap = {};

                    async.each(pages,
                        function(page, _cb){

                            async.each(page.sections,
                                function(section, _cb2){
                                    sectionMap[section._id] = null;
                                    _cb2();
                                },
                                function(err){
                                    return _cb(err);
                                }
                            );

                        },
                        function(err){
                            if(err) {
                                console.log('Error during getPages: ' + err);
                                return cb(err);
                            }
                            console.log('looped through page sections successfully');
                            return cb(null, website, pages, sectionMap);
                        }
                    );

                });
            },
            function saveNewSections(website, pages, sectionMap, cb) {
                console.log('saveNewSections: save sections as platform sections accountId=0 and save new _id to sectionMap');

                var visibleSections = {};
                async.each(Object.keys(sectionMap),
                    function(id, _cb){

                        var sectionData;

                        sectionsCollection.find({'_id': id}).toArray(function(err, section){
                            if (err || !section[0]) {
                                return _cb(err);
                            }

                            if(section[0].visibility){
                                sectionData = section[0];

                                visibleSections[id] = utils.idutils.generateUUID(); //map new _id to old _id

                                sectionData._id = visibleSections[id]; //set to new _id
                                sectionData.accountId = 0;
                                sectionData.siteTemplateRef = siteTemplate._id;
                                sectionData.enabled = false;
                                // Ensure that no global section for accountId 0 except global header
                                if(section[0].globalHeader !== true){
                                    section[0].global = false;
                                }

                                sectionsCollection.save(sectionData, function(err, savedSection){
                                    return _cb(err);
                                });
                            }
                            else{
                                return _cb();
                            }

                        });
                    },
                    function(err){
                        if (err) {
                            console.log('Error saving new sections:', err);
                            return cb(err);
                        }
                        return cb(null, website, pages, visibleSections);
                    }
                );

            },
            function savePagesAsPageTemplates(website, pages, sectionMap, cb) {
                console.log('savePagesAsPageTemplates: save pages as page templates');

                var newTemplates = [];

                async.each(pages,
                    function(page, _cb){

                        page._id = utils.idutils.generateUUID();
                        page.accountId = 0;
                        page['public'] = false;

                        delete page.websiteId;

                        console.log(page.sections);

                        page.sections = _(page.sections).map(function(section) {
                            // console.log('old section _id: ' + section._id);
                            // console.log('new section _id: ' + sectionMap[section._id]);
                            section._id = sectionMap[section._id];
                            return section;
                        })

                        page.sections =  _.reject(page.sections, function(section){ return !section._id });


                        templatesCollection.save(page, function(err, savedTemplate){
                            if (err) {
                                return _cb(err);
                            }
                            console.log('saved page as template: ', savedTemplate);
                            console.log('page: ', page._id);
                            newTemplates.push(page);
                            return _cb();
                        });

                    },
                    function(err){
                        if (err) {
                            console.log('Error saving new pages as templates:', err);
                            return cb(err);
                        }

                        return cb(null, website, pages, sectionMap, newTemplates);

                    }
                );

            },
            function updateSiteTemplate(website, pages, sectionMap, newTemplates, cb) {
                console.log('updateSiteTemplate: save new sitetemplate');

                console.log('newTemplates:', newTemplates);

                siteTemplate.defaultPageTemplates = _(newTemplates).map(function(template) {
                    return {
                        "type" : "template",
                        "pageTemplateId" : template._id,
                        "pageHandle" : template.handle,
                        "pageTitle" : template.title || template.name
                    }
                })

                console.log('siteTemplate.defaultPageTemplates', siteTemplate.defaultPageTemplates);

                sitetemplatesCollection.save(siteTemplate, function(err, savedSiteTemplate) {
                    if (err) {
                        return cb(err);
                    }

                    console.log('successfully converted account content to sitetemplate: ' + siteTemplate._id);

                    return cb();

                });

            }
        ], function done(err){
            srcMongo.close();
            fn(err);
        });
    },

    _enableSiteBuilderOnLegacyAccount: function(accountId, srcDBUrl, fn) {
        var srcMongo = mongoskin.db(srcDBUrl, {safe: true});
        var websitesCollection = srcMongo.collection('websites');
        var pagesCollection = srcMongo.collection('pages');
        var sectionsCollection = srcMongo.collection('sections');
        var accountsCollection = srcMongo.collection('accounts');

        async.waterfall([
            function setAccountShowHide(cb){
                console.log('setAccountShowHide: fetch account and update showhide.ssbSiteBuilder = true');
                accountsCollection.find({'_id':accountId}).toArray(function(err, accounts){
                    if(err || !accounts[0]) {
                        console.log('Error getting account:', err);
                        cb(err);
                    } else {
                        accounts[0].showhide.ssbSiteBuilder = true;
                        accountsCollection.save(accounts[0], function(err, savedAccount) {
                            if (err) {
                                console.log('Error saving account showhide:', err);
                                return cb(err);
                            }
                            cb(null);
                        });
                    }

                });
            },
            function setWebsiteSBProps(cb) {
                console.log('getWebsite: fetch account website');
                websitesCollection.find({'accountId': accountId}).toArray(function(err, websites){

                    if (err || !websites[0]) {
                        console.log('Error finding account website in test:', err);
                        return cb(err);
                    }

                    websites[0].themeId = '565decfdfa7d8f489a489104';
                    websites[0].ssb = true;

                    websitesCollection.save(websites[0], function(err, savedWebsite) {
                        if (err) {
                            console.log('Error saving website SB props:', err);
                            return cb(err);
                        }

                        return cb(null);
                    });

                });
            },
            function getPages(cb) {
                console.log('getPages: fetch account pages that haven not been saved in SB yet');
                pagesCollection.find({'accountId': accountId, 'ssb': { $exists: false }, 'handle': { $nin: ['blog', 'single-post', 'coming-soon'] } }).toArray(function(err, pages){
                    if (err) {
                        console.log('Error finding pages:', err);
                        return cb(err);
                    }

                    return cb(null, pages);

                });
            },
            function saveNewSections(pages, cb) {
                console.log('saveNewSections: wrap components in section data obj');

                async.each(pages,
                    function(page, _cb){

                        if (page.components) {
                            var sectionIdArray = [];
                            async.each(page.components,
                                function(component, _cb2) {
                                    var id = utils.idutils.generateUUID();
                                    var sectionData = {
                                        _id: id,
                                        accountId: 3,
                                        layout: '1-col',
                                        components: [component],
                                        visibility: true,
                                        transformed: true,
                                        transformedFrom: component._id
                                    };

                                    sectionIdArray.push({ _id: id })

                                    sectionsCollection.save(sectionData, function(err, savedSection){
                                        return _cb2(err);
                                    });
                                },
                                function(err){
                                    if (err) {
                                        console.log('Error saving new sections:', err);
                                        return _cb(err);
                                    }

                                    page.ssb = true;
                                    page.sections = sectionIdArray;

                                    pagesCollection.save(page, function(err, savedPage) {
                                        if (err) {
                                            console.log('Error saving updated page:', err);
                                            return _cb(err);
                                        }

                                        return _cb(null);
                                    });

                                }

                            );
                        }

                    },
                    function(err){
                        if (err) {
                            console.log('Error transforming components to sections:', err);
                            return cb(err);
                        }

                        return cb(null);

                    }
                );

            }
        ], function done(err){
            srcMongo.close();
            console.log('Note: you probably should clear the templates cached in S3 for this account!');
            fn(err);
        });
    },

    publishExistingPages: function(accountId, fn) {
        var self = this;
        var srcDBUrl = mongoConfig.TEST_MONGODB_CONNECT;
        var srcMongo = mongoskin.db(srcDBUrl, {safe: true});
        var pagesCollection = srcMongo.collection('pages');
        var sectionCollection = srcMongo.collection('sections');
        var publishedPagesCollection = srcMongo.collection('published_pages');

        async.waterfall([
            function getPagesByAccount(cb) {
                self.log.debug('Getting pages');
                var query = {
                    latest:true
                };
                if(accountId) {
                    query.accountId = accountId;
                } else {
                    query.accountId = {$exists:true};
                }
                pagesCollection.find(query).toArray(function(err, _pages){
                    if(err) {
                        cb(err);
                    } else {
                        self.log.debug('Fetched ' + _pages.length + ' pages');
                        cb(null, _pages);
                    }
                });
            },
            function derefSectionsIntoPages(pages, cb) {
                self.log.debug('dereferencing sections');
                async.eachSeries(pages, function(page, callback){
                    if(page.sections) {
                        self._dereferenceSections(page.sections, sectionCollection, function(err, sections){
                            if(err) {
                                self.log.error('Error dereferencing sections');
                                callback(err);
                            } else {
                                page.sections =  sections;
                                callback(null);
                            }
                        });
                    } else {
                        callback();
                    }

                }, function(err){
                    if(err) {
                        self.log.error('Error dereferencing sections:', err);
                        cb(err);
                    } else {
                        cb(null, pages);
                    }
                });

            },
            function saveIntoPublishedCollection(pages, cb) {
                self.log.debug('saving published pages');
                async.eachSeries(pages, function(page, callback){
                    publishedPagesCollection.save(page, function(err, savedPage){
                        callback(err);
                    });
                }, function(err){
                    if(err) {
                        self.log.error('Error saving published pages:', err);
                        cb(err);
                    } else {
                        cb(null);
                    }
                });
            }
        ], function done(err){
            self.log.debug('Done.');
            fn();
        });
    },

    _dereferenceSections: function(sectionAry, sectionCollection, fn) {
        var self = this;
        var deReffedAry = [];
        async.eachSeries(sectionAry, function(section, cb){
            self.log.debug('Section:', section);
            if(section._id) {
                sectionCollection.find({"_id":section._id}).toArray( function(err, deReffed){
                    if(err) {
                        cb(err);
                    } else if(deReffed && deReffed[0]){
                        deReffedAry.push(deReffed[0]);
                        cb();
                    } else {
                        //brand new section
                        deReffedAry.push(section);
                        cb();
                    }
                });
            } else {
                self.log.warn('The sectionAry contains a section that cannot be dereferenced:', sectionAry);
                cb();
            }
        }, function done(err){
            fn(err, deReffedAry);
        });
    },

    _copySectionsForAccount: function(sectionRefAry, accountId, sectionCollection, fn) {
        var self = this;
        /*
         * 1. Dereference the sections
         * 2. Change accountId
         * 3. Change ID and Anchor
         * 4. Save
         * 5. Return array of new ID references
         */
        var savedSections = [];
        async.waterfall([
            function(cb) {
                self._dereferenceSections(sectionRefAry, sectionCollection, cb);
            },
            function(dereffedSections, cb) {
                //console.log('dereffedSections:', dereffedSections);
                async.eachSeries(dereffedSections, function(section, callback){
                    var id = section._id + '' + accountId;
                    section.accountId = accountId;
                    section._id = id;
                    section.anchor =  id;
                    //console.log('about to save:', section);
                    sectionCollection.save(section, function(err, savedSection){
                        if(err) {
                            callback(err);
                        } else {
                            savedSections.push(section);
                            callback();
                        }
                    });
                }, function(err){
                    cb(err);
                });
            },
            function(cb) {
                //console.log('savedSections:', savedSections);
                var refAry = [];
                _.each(savedSections, function(section){
                    //console.log('pushing to refAry:', section);
                    refAry.push({_id: section._id});
                });
                cb(null, refAry);
            }

        ], function done(err, sectionRefAry){
            fn(err, sectionRefAry);
        });
    },

    addMaxMindToSessionEvents: function(accountId, fn) {
        var query = {
            maxmind:{$exists:false},
            accountId:6
        };
        if(accountId && accountId !== 0) {
            query.accountId = accountId;
        }
        var srcDBUrl = mongoConfig.PROD_MONGODB_CONNECT;
        var srcMongo = mongoskin.db(srcDBUrl, {safe: true});
        var sessionCollection = srcMongo.collection('session_events');
        var geoiputil = require('./geoiputil');
        sessionCollection.find(query).toArray(function(err, sessionEvents){
            if(err) {
                console.log('Error:', err);
                fn(err);
            } else {
                async.eachLimit(sessionEvents, 20, function(event, cb){
                    if(event.ip_address) {
                        geoiputil.getMaxMindGeoForIP(event.ip_address, function(err, ip_geo_info){
                            var replacementObject = {
                                province: ip_geo_info.region,
                                city: ip_geo_info.city,
                                postal_code: ip_geo_info.postal,
                                continent: ip_geo_info.continent,
                                country: ip_geo_info.countryName
                            };
                            event.maxmind = replacementObject;
                            sessionCollection.save(event, function(err, savedEvent){
                                cb(err);
                            });
                        });
                    } else {
                        cb();
                    }
                }, function(err){
                    if(err) {
                        console.log('Error:', err);
                        fn(err);
                    } else {
                        console.log('Done.');
                        fn();
                    }
                });
            }
        });
    },

    addAccountIdToPageEvents: function(fn) {
        var query = {
            accountId:{$exists:false},
            'url.domain':{$in:['www.indigenous.io', 'indigenous.io']},
            server_time_dt:{$gte:new Date('2015-05-15 00:00:00.000Z'), $lte: new Date('2015-07-25 00:00:00.000Z')}
        };

        var srcDBUrl = mongoConfig.PROD_MONGODB_CONNECT;
        var srcMongo = mongoskin.db(srcDBUrl, {safe: true});
        var pageCollection = srcMongo.collection('page_events');
        var accountsCollection = srcMongo.collection('accounts');
        pageCollection.find(query).toArray(function(err, pageEvents){
            if(err) {
                console.log('Error:', err);
                fn(err);
            } else {
                async.eachLimit(pageEvents, 20, function(pageEvent, cb){
                    var domain = pageEvent.url.domain;
                    var accountQuery = {};
                    if(domain.indexOf('www') === 0 || domain.indexOf('indigenous') < 0) {
                        var customDomain = domain.replace('www.', '');
                        if(domain === 'events.sipofcolor.com') {
                            customDomain = 'sipofcolor.com';
                        }
                        if(customDomain === 'unwindwellness.com') {
                            customDomain = 'unwind-dc.com'
                        }
                        if (customDomain === 'indigenous.local' || customDomain === 'test.indigenous.io' || customDomain === 'indigenous.io') {
                            accountQuery = {_id:6};
                        } else {
                            accountQuery = {customDomain : customDomain.toLowerCase()};
                        }

                        console.log('Custom domain query:', accountQuery);
                    } else {
                        var subdomain = domain.substring(0, domain.indexOf('.'));
                        accountQuery = {subdomain:subdomain};
                        if(subdomain === 'indigenous' && domain==='indigenous.io') {
                            accountQuery = {_id:6}
                        }
                        console.log('subdomain query:', accountQuery);

                    }
                    accountsCollection.find(accountQuery).toArray(function(err, accounts){
                        if(err || !accounts) {
                            console.log('Error:', err);
                            cb(err);
                        } else {
                            var account = accounts[0];
                            if(account) {
                                var accountId = account._id;
                                console.log('Setting accountId: ' + accountId);
                                pageEvent.accountId = accountId;
                                pageCollection.save(pageEvent, function(err, savedEvent){
                                    cb();
                                });

                            } else {
                                console.log(accounts);
                                cb();
                            }
                        }
                    });
                }, function(err){
                    if(err) {
                        console.log('Error:', err);
                        fn(err);
                    } else {
                        console.log('done');
                        fn();
                    }
                });

            }
        });
    },

    fixPagesDates: function(fn) {
        //var query = {'published.date': {$type:2}};
        var query = {'created.date': {$type:2}};
        //var query = {'modified.date': {$type:2}};
        var srcDBUrl = mongoConfig.TEST_MONGODB_CONNECT;
        var srcMongo = mongoskin.db(srcDBUrl, {safe: true});

        //var pagesCollection = srcMongo.collection('published_pages');
        var pagesCollection = srcMongo.collection('pages');
        pagesCollection.find(query).toArray(function(err, pages){
            if(err) {
                console.log('Error:', err);
                fn(err);
            } else {
                async.eachLimit(pages, 20,
                    function(page, cb){
                        page.created.date = new Date(page.created.date);
                        pagesCollection.save(page, function(err, savedPage){
                            cb(err);
                        });
                    },
                    function(err) {
                        if(err) {
                            console.log('Error:', err);
                            fn(err);
                        } else {
                            console.log('Done.');
                            fn();
                        }
                    }
                );
            }
        });
    },

    getUnsentContactIDs: function(fn) {
        var emailMessageQuery = {batchId:'44f26730-11bf-4de7-b1b7-3fc330659df2', events:{$size:0}, sendgridBatchId:{$ne:'M2ZlNzUwMWEtM2NkNS0xMWU3LWEzOGItNTI1NDAwODAzOWJjLTExMThkZmU2Mg'}};
        var srcDBUrl = mongoConfig.PROD_MONGODB_CONNECT;
        var srcMongo = mongoskin.db(srcDBUrl, {safe:true});
        var emailMessagesCollection = srcMongo.collection('emailmessages');
        console.log('querying emails');
        emailMessagesCollection.find(emailMessageQuery, {receiver:true}, {skip:0}).toArray(function(err, msgs){
            console.log('Got ' + msgs.length + ' emails');
            var count = 0;
            var contactEmailAry = _.pluck(msgs, 'receiver');

            var contactQuery = {'details.emails.email':{$in:contactEmailAry}, accountId:1320};
            var contactsCollection = srcMongo.collection('contacts');
            console.log('finding contacts');
            contactsCollection.find(contactQuery, {_id:true}).toArray(function(err,contacts){
                console.log('contact count:', contacts.length);
                var contactAry = _.pluck(contacts, '_id');
                console.log('contactAry:', contactAry);
                fn();
            });

        });
    },

    updateUnsubedContacts: function(fn) {
        var fs = require('fs');
        var srcDBUrl = mongoConfig.PROD_MONGODB_CONNECT;
        var srcMongo = mongoskin.db(srcDBUrl, {safe:true});
        var contactsCollection = srcMongo.collection('contacts');
        var stream = fs.createReadStream("/Users/millkyl/Downloads/suppression_unsubscribes.csv");
        var emailAry = [];

        var csv = require('fast-csv');
        csv
            .fromStream(stream, {headers : ["email", "created"]})
            .on("data", function(data){
                emailAry.push(data.email);
                console.log(data.email);
            })
            .on("end", function(){
                console.log("done with stream");
                async.eachSeries(emailAry, function(email, cb){
                    var query = {'details.emails.email':email, unsubscribed:{$ne:true}};
                    contactsCollection.update(query, {$set:{unsubscribed:true}}, {multi:true}, function(err, result){
                        console.log('updated ' + email);
                        cb(err);
                    });
                }, function(err){
                    console.log('done with updating contacts');
                    fn();
                });
            });

    },

    getBouncedContactIDs: function(fn) {
        var emailMessageQuery = {$or:[{'events.event':'bounce'}, {'events.event':'dropped', 'events.reason':'Bounced Address'}]};
        var srcDBUrl = mongoConfig.PROD_MONGODB_CONNECT;
        var srcMongo = mongoskin.db(srcDBUrl, {safe:true});
        var emailMessagesCollection = srcMongo.collection('emailmessages');
        emailMessagesCollection.find(emailMessageQuery, {receiver:true}, {skip:0}).toArray(function(err, msgs){
            console.log('Got ' + msgs.length + ' emails');
            var count = 0;
            var contactEmailAry = _.pluck(msgs, 'receiver');

            var contactQuery = {'details.emails.email':{$in:contactEmailAry}, 'tags':{$ne:'Bounced'}};
            var contactsCollection = srcMongo.collection('contacts');
            console.log('finding contacts');
            contactsCollection.find(contactQuery, {_id:true}).toArray(function(err,contacts){
                console.log('contact count:', contacts.length);
                var contactAry = _.pluck(contacts, '_id');
                console.log('contactAry:', contactAry);
                async.eachLimit(contactAry, 10, function(contactId, cb){
                    contactsCollection.update({_id:contactId}, {$set:{tags:['Bounced']}});
                    cb();
                }, function(err){
                    console.log('Done with err:', err);
                    fn();

                });
                //console.log('contactAry:', contactAry);

            });
        });

    },

    updateContactActivityTypes: function(fn) {
        var srcDBUrl = mongoConfig.PROD_MONGODB_CONNECT;
        var srcMongo = mongoskin.db(srcDBUrl, {safe:true});
        var contactActivitesCollection = srcMongo.collection('contactactivities');
        var date = new Date(2017, 6, 1, 0, 0, 0, 0);
        var query = {accountId:{$type:2, $ne:0}, contactId:{$ne:null, $type:2}, start:{$lt:date}};
        console.log('query:', query);
        contactActivitesCollection.find(query, {_id:true, accountId:true, contactId:true}).toArray(function(err, activities){
            console.log('activity count:', activities.length);
            async.eachLimit(activities, 10, function(act, cb){
                act.accountId = parseInt(act.accountId);
                act.contactId = parseInt(act.contactId);
                contactActivitesCollection.save(act, function(err, val){cb();});
            }, function(err){
                console.log('err?', err);
                fn();
            });
        });
    },

    updatePrivs: function(fn) {
        var srcDBUrl = mongoConfig.TEST_MONGODB_CONNECT;
        var srcMongo = mongoskin.db(srcDBUrl, {safe:true});
        var accountsCollection = srcMongo.collection('accounts');
        var usersCollection = srcMongo.collection('users');
        var privsCollection = srcMongo.collection('privileges');
        async.waterfall([
            function(cb){
                var query = {orgId:2};
                accountsCollection.find(query, {_id:true}).toArray(function(err, accounts){
                    if(err) {
                        console.log('Error finding accounts:', err);
                        cb(err);
                    } else {
                        console.log('found ' + accounts.length + ' accounts');
                        var accountAry = _.pluck(accounts, '_id');
                        cb(null, accountAry);
                    }
                });
            },
            function(accounts, cb) {
                console.log('accounts:', accounts);
                var query = {'accounts.accountId':{$in:accounts}};
                usersCollection.find(query, {_id:true}).toArray(function(err, users){
                    if(err) {
                        console.log('Error finding users:', err);
                        cb(err);
                    } else {
                        console.log('found ' + users.length + ' users');
                        var userAry = _.pluck(users, '_id');
                        cb(null, accounts, userAry);
                    }
                });
            },
            function(accounts, users, cb) {
                //console.log('users:', users);
                var query = {userId:{$in:users}, accountId:{$in:accounts}};
                console.log('updating...');
                privsCollection.update(query, {$set:{privs:defaultPrivileges}}, {multi:true}, function(err, result){
                    if(err) {
                        console.log('Error updating privs:', err);
                        cb(err);
                    } else {
                        cb();
                    }
                });

            }
        ], function(err){
            if(err) {
                console.log('error:', err);
            } else {
                console.log('done.');
            }
            fn();
        });
    },

    updateStripeIDs: function(fn) {
        var srcDBUrl = mongoConfig.TEST_MONGODB_CONNECT;
        var srcMongo = mongoskin.db(srcDBUrl, {safe:true});
        var accountsCollection = srcMongo.collection('accounts');
        var usersCollection = srcMongo.collection('users');
        async.waterfall([
            function(cb) {
                usersCollection.find({_id:{$gt:4}}).toArray(function(err, users){
                    if(err) {
                        console.log('error:', err);
                        cb(err);
                    } else {
                        cb(null, users);
                    }
                });
            },
            function(users, cb) {
                console.log('Updating ' + users.length + ' users');
                async.eachLimit(users, 10, function(user, callback){
                    if(user && user.accounts && user.accounts[0] && user.accounts[0].accountId) {
                        var accountId = user.accounts[0].accountId;
                        accountsCollection.find({_id:accountId}).toArray(function(err, account){
                            if(account) {
                                var orgId = account.orgId || 0;
                                user.customerIds =  [];
                                if(user.stripeId) {
                                    user.customerIds.push({orgId:orgId, stripeId:user.stripeId});
                                    usersCollection.save(user, function(err, value){
                                        console.log('Updated userId ' + user._id);
                                        callback();
                                    });
                                } else {
                                    callback();
                                }

                            } else {
                                callback();
                            }
                        });
                    } else {
                        callback();
                    }


                }, function(err){
                    cb(err);
                })
            }
        ], function(err){
            console.log('done');
            fn();
        });
    }
};

module.exports = copyutil;
