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

    convertAccountToSiteTemplate: function(accountId, cb) {
        var self = this;
        self._convertAccountToSiteTemplate(accountId, cb);
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
        var websitesCollection = srcMongo.collection('websites');
        var pagesCollection = srcMongo.collection('pages');
        var templatesCollection = srcMongo.collection('templates');
        var sectionsCollection = srcMongo.collection('sections');
        var sitetemplatesCollection = srcMongo.collection('sitetemplates');
        var siteTemplate = {
            "_id" : utils.idutils.generateUUID(),
            "name" : "Site Template from account:" + accountId,
            "accountId" : 0,
            "public" : true,
            "description" : "Site Template from account:" + accountId,
            "siteThemeId" : "565decfdfa7d8f489a489104",
            "defaultPageTemplates" : [
                // {
                //     "type" : "template",
                //     "pageTemplateId" : "1103202892929",
                //     "pageHandle" : "index",
                //     "pageTitle" : "Home"
                // },
                // {
                //     "type" : "template",
                //     "pageTemplateId" : "110320289292911",
                //     "pageHandle" : "contact-us",
                //     "pageTitle" : "Contact Us"
                // }
            ],
            "defaultTheme" : "565decfdfa7d8f489a489104",
            "created" : {
                "date" : new Date().toISOString(),
                "by" : 0
            },
            "modified" : {
                "date" : new Date().toISOString(),
                "by" : 0
            },
            "previewUrl" : "https://placeholdit.imgix.net/~text?txtsize=33&txt=Site%20Template%20"+accountId+"&w=672&h=383"
        }

        // fn();

        /*
         * 1. Get the website object
         * 2. Update siteTemplate defaultTheme prop with website.themeId
         * 3. Get the ssb pages on the account
         * 4. Save all section _ids to sectionMap
         * 5. Save all sections as new sections with:
         *      - accountId=0
         *      - siteTemplateRef=siteTemplate._id
         *      - enabled=false
         *
         * 6. Save all new _ids to sectionMap mapped to old ids
         * 7. Loop through pages, updating section _ids and saving as templates
         * 8. Update siteTemplate defaultPageTemplates prop with new template _ids, name, handles
         * 9. Save siteTemplate
         */

        async.waterfall([
            function getWebsite(cb) {
                console.log('getWebsite: fetch account website');
                websitesCollection.find({'accountId': accountId}).toArray(function(err, websites){

                    if (err || !websites[0]) {
                        console.log('Error finding account website in test:', err);
                        return cb(err);
                    }

                    siteTemplate.defaultTheme = websites[0].themeId;
                    // siteTemplate.siteThemeId = website.themeId;

                    return cb(null, websites[0]);

                });
            },
            function getPages(website, cb) {
                console.log('getPages: fetch account pages and loop through section data');
                pagesCollection.find({'accountId': accountId, 'ssb': true}).toArray(function(err, pages){
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

                async.each(Object.keys(sectionMap),
                    function(id, _cb){

                        var sectionData;

                        sectionsCollection.find({'_id': id}).toArray(function(err, section){
                            if (err || !section[0]) {
                                return _cb(err);
                            }

                            sectionData = section[0];

                            sectionMap[id] = utils.idutils.generateUUID(); //map new _id to old _id
                            sectionData._id = sectionMap[id]; //set to new _id
                            sectionData.accountId = 0;
                            sectionData.siteTemplateRef = siteTemplate._id;
                            sectionData.enabled = false;

                            sectionsCollection.save(sectionData, function(err, savedSection){
                                return _cb(err);
                            });

                        });


                    },
                    function(err){
                        if (err) {
                            console.log('Error saving new sections:', err);
                            return cb(err);
                        }

                        return cb(null, website, pages, sectionMap);

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

                        page.sections = _(page.sections).map(function(section) {
                            // console.log('old section _id: ' + section._id);
                            // console.log('new section _id: ' + sectionMap[section._id]);
                            section._id = sectionMap[section._id];
                            return section;
                        })

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
    }


};

module.exports = copyutil;
