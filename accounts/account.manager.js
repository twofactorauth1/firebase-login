
var LOG = $$.g.getLogger("account.manager");
var accountDao = require('../dao/account.dao');
var appConfig = require('../configs/app.config');
var assetManager = require('../assets/asset_manager');
var websiteDao = require('../ssb/dao/website.dao');
var pageDao = require('../ssb/dao/page.dao');
var sectionDao = require('../ssb/dao/section.dao');
var emailDao = require('../cms/dao/email.dao');
var campaignDao = require('../campaign/dao/campaign.dao');
var productDao = require('../products/dao/product.dao');

var async = require('async');

var defaultBusiness = {
    "logo" : '',
    "name" : '',
    "description" : '',
    "category" : '',
    "size" : '',
    "phones" : [],
    "addresses" : [],
    "type" :'',
    "nonProfit" : false,
    "emails": [],
    'splitHours': false,
    'hours': [
        {'day': "Mon", 'start':"9:00 am",'end':"5:00 pm", 'start2':"9:00 am", 'end2':"5:00 pm", 'closed':false, 'split':false, 'wholeday':false},
        {'day': "Tue", 'start':"9:00 am",'end':"5:00 pm", 'start2':"9:00 am", 'end2':"5:00 pm", 'closed':false, 'split':false, 'wholeday':false},
        {'day': "Wed", 'start':"9:00 am",'end':"5:00 pm", 'start2':"9:00 am", 'end2':"5:00 pm", 'closed':false, 'split':false, 'wholeday':false},
        {'day': "Thu", 'start':"9:00 am",'end':"5:00 pm", 'start2':"9:00 am", 'end2':"5:00 pm", 'closed':false, 'split':false, 'wholeday':false},
        {'day': "Fri", 'start':"9:00 am",'end':"5:00 pm", 'start2':"9:00 am", 'end2':"5:00 pm", 'closed':false, 'split':false, 'wholeday':false},
        {'day': "Sat", 'start':"9:00 am",'end':"5:00 pm", 'start2':"9:00 am", 'end2':"5:00 pm", 'closed':true, 'split':false, 'wholeday':false},
        {'day': "Sun", 'start':"9:00 am",'end':"5:00 pm", 'start2':"9:00 am", 'end2':"5:00 pm", 'closed':true, 'split':false, 'wholeday':false}]
};
var defaultBilling = {
    "userId" : '',
    "stripeCustomerId": '',
    "cardToken": '',
    "signupDate": new Date(),
    "trialLength": 31
};

var accountManager = {
    log:LOG,

    copyAccountTemplate:function(accountId, userId, srcAccountId, destAccountId, fn){
        var self = this;
        self.log.debug(accountId, userId, '>> copyAccountTemplate');
        var rollbackHandler = {};
        var idMap = {};
        async.waterfall([
            function(cb) {
                accountDao.getAccountByID(srcAccountId, cb);
            },
            function(account, cb) {
                if(!account) {
                    cb('source account with id[' + srcAccountId + '] not found');
                } else {
                    //fetch destination account
                    accountDao.getAccountByID(destAccountId, cb);
                }
            },
            function(account, cb){
                /*
                 * COPY ASSETS
                 */
                if(!account) {
                    cb('Could not find destination account');
                } else {
                    self.log.debug(accountId, userId, 'Found destination account with id:' + account.id());
                    self._copyAssets(accountId, userId, srcAccountId, account.id(), idMap, function(err, updatedIdMap){
                        //I don't think we need the udpatedIdMap... the reference should hold
                        cb(err, account);
                    });
                }
            },
            function(account, cb) {
                /*
                 * COPY WEBSITE
                 */
                websiteDao.getWebsitesForAccount(srcAccountId, function(err, websites){
                    if(err) {
                        self.log.error(accountId, userId, 'Error finding websites:', err);
                        cb(err);
                    } else if(!websites || !websites.length || websites.length < 1) {
                        self.log.error(accountId, userId, 'Could not find website');
                        cb('Could not find websites');
                    } else {
                        var sourceWebsite = websites[0];
                        idMap.website = idMap.website || {};
                        idMap.website.sourceId = sourceWebsite.id();
                        sourceWebsite.set('_id', null);
                        sourceWebsite.set('accountId', account.id());
                        var created = {date:new Date(), by:userId};
                        sourceWebsite.set('created', created);
                        sourceWebsite.set('modified', created);
                        if(sourceWebsite.get('settings') && sourceWebsite.get('settings').favicon) {
                            var settings = sourceWebsite.get('settings');
                            var url = settings.favicon;
                            if(idMap.assets[url]) {
                                settings.favicon = idMap.assets[url];
                                sourceWebsite.set('settings', settings);
                            }
                        }
                        websiteDao.saveOrUpdate(sourceWebsite, function(err, destWebsite){
                            if(err) {
                                self.log.error(accountId, userId, 'Error saving website:', err);
                                cb(err);
                            } else {
                                idMap.website.destId = destWebsite.id();
                                cb(null, account);
                            }
                        });
                    }
                });
            },
            function(account, cb) {
                /*
                 * Copy pages and sections
                 */
                var query = {accountId:srcAccountId, latest:true};
                pageDao.findMany(query, $$.m.ssb.Page, function(err, pages){
                    if(err) {
                        self.log.error(accountId, userId, 'Error finding pages:', err);
                        cb(err);
                    } else {
                        idMap.pages = idMap.pages || {};
                        async.eachSeries(pages, function(page, callback){
                            self._copyPage(accountId, userId, srcAccountId, account.id(), idMap.website.destId, idMap, page, callback);
                        }, function(err){
                            if(err) {
                                self.log.error(accountId, userId, 'Error copyingPage:', err);
                                cb(err);
                            } else {
                                cb(null, account);
                            }
                        });
                    }
                });
            },
            function(account, cb) {
                /*
                 * Copy emails
                 */
                var query = {accountId:srcAccountId, latest:true};
                emailDao.findMany(query, $$.m.cms.Email, function(err, emails){
                    if(err) {
                        self.log.error(accountId, userId, 'Error getting emails:', err);
                        cb(err);
                    } else {
                        idMap.emails = idMap.emails || {};
                        async.eachSeries(emails, function(email, callback){
                            var sourceId = email.id();
                            email.set('_id', null);
                            email.set('accountId', account.id());
                            //not sure about fromName, fromEmail, replyTo
                            email.set('fromName', '');
                            email.set('fromEmail', '');
                            email.set('replyTo', '');
                            var created = {date:new Date(), by:userId};
                            email.set('created', created);
                            email.set('modified', created);
                            var components = email.get('components');
                            _.each(components, function(component){
                                self._fixJSONAssetReferences(component, idMap);
                            });
                            email.set('components', components);
                            emailDao.saveOrUpdate(email, function(err, savedEmail){
                                if(err) {
                                    self.log.error(accountId, userId, 'Error saving email:', err);
                                    callback(err);
                                } else {
                                    var destId = savedEmail.id();
                                    idMap.emails[sourceId] = destId;
                                    callback();
                                }
                            });
                        }, function(err){
                            if(err) {
                                self.log.error(accountId, userId, 'Error copying emails:', err);
                                cb(err);
                            } else {
                                cb(null, account);
                            }
                        });
                    }
                });
            },
            function(account, cb) {
                /*
                 * Copy campaigns
                 */
                self._copyCampaigns(accountId, userId, srcAccountId, account.id(), idMap, function(err, value){
                    if(err) {
                        self.log.error(accountId, userId, 'Error copying campaigns:', err);
                        cb(err);
                    } else {
                        cb(null, account);
                    }
                });

            },
            function(account, cb) {
                /*
                 * Copy Products
                 * -- emailSettings
                 * -- assets
                 */
                var query = {accountId:srcAccountId};
                productDao.findMany(query, $$.m.Product, function(err, products){
                    if(err) {
                        self.log.error(accountId, userId, 'Error finding products');
                        cb(err);
                    } else {
                        idMap.products = idMap.products || {};
                        async.eachSeries(products, function(product, callback){
                            var srcProductId = product.id();
                            product.set('_id', null);
                            product.set('accountId', destAccountId);
                            var created = {date: new Date(), by:userId};
                            product.set('created', created);
                            product.set('modified', created);
                            var emailSettings = product.get('emailSettings');
                            if(emailSettings && emailSettings.emailId) {
                                emailSettings.emailId = idMap.emails[emailSettings.emailId];
                                emailSettings.fromEmail = '';
                                emailSettings.fromName = '';
                                emailSettings.replyTo = '';
                                emailSettings.bcc = '';
                                product.set('emailSettings', emailSettings);
                            }
                            var productJSON = self._fixJSONAssetReferences(product.toJSON(), idMap);
                            var destProduct = new $$.m.Product(productJSON);
                            productDao.saveOrUpdate(destProduct, function(err, savedProduct){
                                if(err) {
                                    self.log.error(accountId, userId, 'Error saving product:', err);
                                    callback(err);
                                } else {
                                    idMap.products[srcProductId] = savedProduct.id();
                                    callback();
                                }
                            });
                        }, function(err){
                            if(err) {
                                self.log.error(accountId, userId, 'Error copying products:', err);
                                cb(err);
                            } else {
                                cb(null, account);
                            }
                        });
                    }
                });
            }
        ], function(err, account){
            if(err) {
                self.log.error(accountId, userId, 'Error copying account:', err);
                fn(err);
            } else {
                self.log.debug(accountId, userId, '<< copyAccountTemplate');
                fn(null, account);
            }
        });
    },

    _copyPage: function(accountId, userId, srcAccountId, destAccountId, destWebsiteId, idMap, page, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> _copyPage [' + page.id() + ']');
        var created = {date:new Date(), by:userId};
        var srcPageId = page.id();
        page.set('_id', null);
        page.set('websiteId', destWebsiteId);
        page.set('accountId', destAccountId);
        page.set('created', created);
        page.set('modified', created);
        page.set('published', null);
        pageDao.saveOrUpdate(page, function(err, destPage){
            if(err) {
                self.log.error(accountId, userId, 'Error saving page:', err);
                fn(err);
            } else {
                var destPageId = destPage.id();
                idMap.pages[srcPageId] = destPageId;
                idMap.sections = idMap.sections || {};
                self._copySections(accountId, userId, srcAccountId, destAccountId, destWebsiteId, destPageId, destPage.get('sections'), idMap, function(err, sectionIdAry){
                    if(err) {
                        self.log.error(accountId, userId, 'Error saving sections:', err);
                        fn(err);
                    } else {
                        destPage.set('sections', sectionIdAry);
                        self.log.debug(accountId, userId, '<< _copyPage');
                        pageDao.saveOrUpdate(page, fn);
                    }
                });
            }
        });
    },

    _copySections: function(accountId, userId, srcAccountId, destAccountId, destWebsiteId, destPageId, sections, idMap, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> _copySections');
        var sectionIdAry = [];
        async.eachSeries(sections, function(sectionRef, cb){
            var sectionId = sectionRef._id;
            self.log.debug(accountId, userId, 'Copying section [' + sectionId + ']');
            sectionDao.getById(sectionId, $$.m.ssb.Section, function(err, section){
                if(err) {
                    self.log.error(accountId, userId, 'Error finding section:', err);
                    cb(err);
                } else {
                    if(!section) {
                        self.log.warn(accountId, userId, 'No section found with id [' + sectionId + ']');
                        cb();
                    }
                    var oldId = sectionId;
                    section.set('_id', null);
                    section.set('accountId', destAccountId);
                    //TODO: check if this works?

                    var sectionJSON = section.toJSON();
                    self.log.debug('Before transformation:', sectionJSON);
                    sectionJSON = self._fixJSONAssetReferences(sectionJSON, idMap);
                    self.log.debug('After transformation:', sectionJSON);
                    section = new $$.m.ssb.Section(sectionJSON);
                    sectionDao.saveOrUpdate(section, function(err, savedSection){
                        if(err) {
                            self.log.error(accountId, userId, 'Error saving sections:', err);
                            cb(err);
                        } else {
                            idMap.sections[oldId] = savedSection.id();
                            sectionIdAry.push(savedSection.id());
                            cb();
                        }
                    });
                }
            });
        }, function(err){
            if(err) {
                self.log.error(accountId, userId, 'Error saving sections:', err);
                fn(err);
            } else {
                self.log.debug(accountId, userId, '<< _copySections');
                fn(null, sectionIdAry);
            }
        });
    },

    _copyAssets: function(accountId, userId, srcAccountId, destAccountId, idMap, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> _copyAssets');

        assetManager.listAssets(srcAccountId, 0, 0, function(err, assets){
            if(err) {
                self.log.error('Error listing assets:', err);
                fn(err);
            } else {
                async.eachLimit(assets, 10, function(asset, cb){
                    asset.set('_id', null);
                    asset.set('accountId', destAccountId);
                    var created = {date:new Date(), by:userId};
                    asset.set('created', created);
                    asset.set('modified', created);
                    var sourceUrl = asset.get('url');
                    var destUrl = sourceUrl.replace(/account_\d+/g, 'account_' + destAccountId);
                    idMap.assets = idMap.assets || {};
                    idMap.assets[sourceUrl] = destUrl;
                    var contentType = asset.get('mimeType');
                    asset.set('url', destUrl);
                    assetManager.copyS3Asset(accountId, userId, sourceUrl, destUrl, contentType, function(err, value){
                        if(err) {
                            self.log.error('Error copying asset:', err);
                            cb(err);
                        } else {
                            assetManager.updateAsset(asset, function(err, value){
                                if(err) {
                                    self.log.error('Error saving asset:', err);
                                    cb();
                                } else {
                                    cb();
                                }
                            });
                        }
                    });
                }, function(err){
                    if(err) {
                        self.log.error(accountId, userId, 'Error copying assets:', err);
                        fn(err);
                    } else {
                        self.log.debug(accountId, userId, '<< _copyAssets');
                        fn(null, idMap);
                    }
                });
            }
        });
    },

    _fixJSONAssetReferences: function(json, idMap) {
        var checkObjectFxn = function(obj){
            /*
             * If obj is an Array, iterate and call checkObj or fixString
             * If obj is an Object, iterate over keys and call checkObj or fixString
             */
            if(_.isArray(obj)) {
                _.each(obj, function(_obj){
                    if(_.isObject(_obj)) {
                        checkObjectFxn(_obj);
                    } else {
                        _obj = fixStringFxn(_obj);
                    }
                });
            } else if(_.isObject(obj)) {
                _.each(_.keys(obj), function(_obj){
                    if(_.isObject(_obj)) {
                        checkObjectFxn(_obj);
                    } else {
                        _obj = fixStringFxn(_obj);
                    }
                });
            }
        };
        var fixStringFxn = function(str) {
            _.each(_.keys(idMap.assets), function(srcUrl){
                /*
                 * This is a neat trick: http://stackoverflow.com/questions/4371565/can-you-create-javascript-regexes-on-the-fly-using-string-variables
                 * s.split(string_to_replace).join(replacement)
                 */
                str = str.split(srcUrl).join(idMap.assets[srcUrl]);
            });
            return str;
        };
        checkObjectFxn(json);
        return json;
    },

    _copyCampaigns: function(accountId, userId, srcAccountId, destAccountId, idMap, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> _copyCampaigns');
        var query = {accountId:srcAccountId};
        idMap.campaigns = idMap.campaigns || {};
        campaignDao.findMany(query, $$.m.Campaign, function(err, campaigns){
            if(err) {
                self.log.error(accountId, userId, 'Error finding campaigns:', err);
                fn(err);
            } else {
                async.each(campaigns, function(campaign, cb){
                    var sourceCampaignId = campaign.id();
                    campaign.set('_id', null);
                    campaign.set('accountId', destAccountId);
                    campaign.set('contacts', []);
                    var statistics = {
                        "emailsBounced" : 0,
                        "emailsSent" : 0,
                        "emailsOpened" : 0,
                        "emailsClicked" : 0,
                        "participants" : 0
                    };
                    campaign.set('statistics', statistics);
                    var emailSettings = campaign.get('emailSettings');
                    if(emailSettings) {
                        var oldEmailId = emailSettings.emailId;
                        emailSettings.fromEmail = '';
                        emailSettings.fromName = '';
                        emailSettings.replyTo = '';
                        emailSettings.emailId = idMap.emails[oldEmailId];
                        campaign.set('emailSettings', emailSettings);
                    }

                    var created = {date:new Date(), by:userId};
                    campaign.set('created', created);
                    campaign.set('modified', created);
                    campaignDao.saveOrUpdate(campaign, function(err, savedCampaign){
                        if(err) {
                            self.log.error(accountId, userId, 'Error saving campaign:', err);
                            cb(err);
                        } else {
                            idMap.campaigns[sourceCampaignId] = savedCampaign.id();
                            cb();
                        }
                    });
                }, function(err){
                    if(err) {
                        self.log.error(accountId, userId, 'Error copying campaigns:', err);
                        fn(err);
                    } else {
                        self.log.debug(accountId, userId, '<< _copyCampaigns');
                        fn(null);
                    }
                });
            }
        });
    }
};

module.exports = accountManager;
$$.u = $$.u||{};
$$.u.AccountManger = accountManager;