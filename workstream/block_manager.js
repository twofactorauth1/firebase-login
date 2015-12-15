/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2015
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var logger = $$.g.getLogger("block_manager");
var blockDao = require('./dao/block.dao');
var accountDao = require('../dao/account.dao');
var pageDao = require('../ssb/dao/page.dao');
var websiteDao = require('../ssb/dao/website.dao');
var assetManager = require('../assets/asset_manager');
var contactDao = require('../dao/contact.dao');
var emailDao = require('../cms/dao/email.dao');
var campaignDao = require('../campaign/dao/campaign.dao');
var socialConfigDao = require('../socialconfig/dao/socialconfig.dao');
var productDao = require('../products/dao/product.dao');
var async = require('async');

module.exports = {
    log: logger,

    getCompletedBlocks: function(accountId, fn) {
        var self = this;
        self.log.debug('>> getCompletedBlocks');

        async.waterfall([
            function getAccount(cb){
                accountDao.getAccountByID(accountId, function(err, account){
                    if(err) {
                        self.log.error('Error fetching account:', err);
                        cb(err);
                    } else {
                        cb(null, account);
                    }
                });
            },
            function getBlocks(account, cb) {
                blockDao.list(function(err, blocks){
                    if(err) {
                        self.log.error('Error fetching blocks:', err);
                        cb(err);
                    } else {
                        cb(null, account, blocks);
                    }
                });
            },
            function handleBlocks(account, blocks, cb) {

                var completedBlocks = account.get('blocks') || [];
                var completedBlockIDs = _.map(completedBlocks, function(block){return block._id;});

                var iterator = function(block, eachCB){

                    if(_.contains(completedBlockIDs, block.id())) {
                        eachCB();
                    } else {
                        this._handleBlock(account, block, function(err, isCompleted){

                            if(isCompleted === true) {
                                completedBlocks.push(block.toJSON());
                                completedBlockIDs.push(block.id());
                            }
                            eachCB(err);
                        });
                    }
                };

                async.each(blocks, iterator.bind(self), function(err){
                    if(err) {
                        self.log.error('Error handling blocks:', err);
                        cb(err);
                    } else {
                        cb(null, account, blocks, completedBlocks);
                    }

                });

            },
            function updateAccount(account, blocks, completedBlocks, cb) {
                self.log.debug('Updating account');
                account.set('blocks', completedBlocks);
                accountDao.saveOrUpdate(account, function(err, updatedAccount){
                    if(err) {
                        self.log.error('Error updating account:', err);
                        cb(err);
                    } else {
                        cb(null, updatedAccount, blocks, completedBlocks);
                    }
                });
            }
        ], function done(err, account, blocks, completedBlocks){
            if(err) {
                self.log.error('Error finding completed blocks:', err);
                return fn(err);
            } else {
                self.log.debug('<< getCompletedBlocks');
                return fn(null, completedBlocks);
            }
        });


    },

    _handleBlock: function(account, block, fn) {
        var self = this;
        var blockId = block.id();
        var lookup = {
            '0': self._handleCreatePage,
            '1': self._handleCreateFormOnPage,
            '2': self._handleFormSettingsForLeads,
            '3': self._handleUploadMedia,
            '4': self._handleWebsiteAndSEO,
            '5': self._handleAssociateDomain,
            '6': self._handleAddContacts,
            '7': self._handleConfigureAutoresponseEmail,
            '8': self._handleConfigureCampaign,
            '9': self._handleSocialMediaIntegration,
            '10': self._handleCreateBlogPost,
            '11': self._handleIntegrateStripe,
            '12': self._handleAddProduct,
            '13': self._handleSetupOnlineStore
        };
        if(typeof lookup[''+blockId] !== 'function') {
            self.log.warn('No handler found for blockId:' + blockId);
            return fn('', false);
        }
        return lookup[''+blockId](account, block, fn);
    },

    _handleCreatePage: function(account, block, fn) {
        //need to ensure at least one page exists
        var self = this;
        //self.log.debug('>> _handleCreatePage');
        var query = {accountId:account.id(), handle: {$nin: ['coming-soon', 'blog', 'single-post']}};
        pageDao.exists(query, $$.m.ssb.Page, function(err, exists){
            if(err) {
                //self.log.error('Error checking for page existence:', err);
                fn(err);
            } else {
                //self.log.debug('<< _handleCreatePage', exists);
                fn(null, exists);
            }
        });
    },

    _handleCreateFormOnPage: function(account, block, fn) {
        //need to ensure at least one page exists with a simple-form component
        var self = this;
        //self.log.debug('>> _handleCreateFormOnPage');
        var query = {accountId:account.id(), latest:true, 'components.type':'simple-form'};
        pageDao.exists(query, $$.m.ssb.Page, function(err, exists){
            if(err) {
                //self.log.error('Error checking for page with form existence:', err);
                fn(err);
            } else {
                //self.log.debug('<< _handleCreateFormOnPage', exists);
                fn(null, exists);
            }
        });
    },

    _handleFormSettingsForLeads: function(account, block, fn) {
        var self = this;
        var query = {accountId:account.id(), latest:true, components: {$elemMatch: {type:'simple-form', contact_type:'ld'}}};
        pageDao.exists(query, $$.m.ssb.Page, function(err, exists){
            if(err) {
                //self.log.error('Error checking for page with form existence:', err);
                fn(err);
            } else {
                //self.log.debug('<< _handleCreateFormOnPage', exists);
                fn(null, exists);
            }
        });
    },

    _handleUploadMedia: function(account, block, fn) {
        //findBySource(S3)
        var self = this;
        assetManager.findBySource(account.id(), 'S3', 0, 0, function(err, assets){
            if(err || !assets) {
                fn(err);
            } else {
                if(assets && assets.length > 0) {
                    return fn(null, true);
                } else {
                    return fn(null, false);
                }

            }
        });
    },

    _handleWebsiteAndSEO: function(account, block, fn) {
        //website.settings.favicon
        //website.title != 'Default Website Title'
        //website.seo.description
        var query = {
            accountId:account.id(),
            'settings.favicon': {$exists:true},
            'seo.description': {$exists:true},
            'title': {$ne: 'Default Website Title'}
        };
        websiteDao.exists(query, $$.m.ssb.Website, function(err, exists){
            if(err) {
                //self.log.error('Error checking for page with form existence:', err);
                fn(err);
            } else {
                //self.log.debug('<< _handleCreateFormOnPage', exists);
                fn(null, exists);
            }
        });
    },

    _handleAssociateDomain: function(account, block, fn) {
        var query = {_id:account.id(), customDomain: {$ne: ''}};
        accountDao.exists(query, $$.m.Account, function(err, exists){
            if(err) {
                //self.log.error('Error checking for page with form existence:', err);
                fn(err);
            } else {
                //self.log.debug('<< _handleCreateFormOnPage', exists);
                fn(null, exists);
            }
        });
    },

    _handleAddContacts: function(account, block, fn) {
        var query = {accountId:account.id()};
        contactDao.exists(query, $$.m.Contact, function(err, exists){
            if(err) {
                fn(err);
            } else {
                fn(null, exists);
            }
        });
    },

    _handleConfigureAutoresponseEmail: function(account, block, fn) {
        //TODO: to verify this block, do the following:
        /*
         * 1. look for any simple-form on their page
         * 2. If the simple-form is tied to a campaign -> VERIFIED
         * 3. If the simple-form is tied to an emailId
         *      3.a If the email is new (type:email) -> VERIFIED
         *      3.b If the email is type:notification AND modified.date > created.date -> VERIFIED
         */
        async.waterfall([
            function verifyCampaign(callback){
                var query = {accountId: account.id(), latest:true, components: {$elemMatch:{type:'simple-form', campaignId:{$ne:''}}}};
                pageDao.exists(query, $$.m.ssb.Page, function(err, exists){
                    callback(err, exists);
                });
            },
            function verifyEmailId(exists, callback) {
                if(exists === true) {
                    callback(null, exists);
                } else {
                    var query = {accountId: account.id(), latest:true, components: {$elemMatch:{type:'simple-form', emailId:{$ne:''}}}};
                    pageDao.findMany(query, $$.m.ssb.Page, function(err, pages){
                        if(err) {
                            callback(err);
                        } else {
                            var emailIdArray = [];
                            _.each(pages, function(page){
                                var components = page.get('components');
                                _.each(components, function(component){
                                    if(component.type === 'simple-form') {
                                        emailIdArray.push(component.emailId);
                                    }
                                });
                            });
                            callback(null, exists, emailIdArray);
                        }
                    });
                }
            },
            function verifyEmailTypeEmail(exists, emailIdArray, callback) {
                if(exists === true) {
                    callback(null, exists);
                } else {
                    async.eachSeries(emailIdArray, function(emailId, cb){
                        if(exists === true) {
                            cb(null);
                        } else {
                            var query = {type:'email', _id:emailId};

                            emailDao.exists(query, $$.m.Email, function(err, emailExists){
                                if(emailExists && emailExists=== true) {
                                    exists = true;
                                }
                                cb(null);
                            });
                        }

                    }, function done(err){
                        callback(err, exists, emailIdArray);
                    });
                }
            },
            function verifyEmailTypeNotification(exists, emailIdArray, callback) {
                if(exists === true) {
                    callback(null, exists);
                } else {
                    var query = {_id: {$in:emailIdArray}, type:'notification'};
                    emailDao.findMany(query, $$.m.Email, function(err, emails){
                        if(err) {
                            callback(err);
                        } else {
                            _.each(emails, function(email){
                                var created = email.get('created').date;
                                var modified = email.get('modified').date;
                                if(moment(modified).isAfter(moment(created))) {
                                    exists = true;
                                }
                            });
                            callback(null, exists);
                        }
                    });
                }
            }
        ], function done(err, exists){
            fn(err, exists);
        });
    },

    _handleConfigureCampaign: function(account, block, fn) {
        var query = {accountId:account.id()};
        campaignDao.exists(query, $$.m.Campaign, function(err, exists){
            if(err) {
                fn(err);
            } else {
                fn(null, exists);
            }
        });
    },

    _handleSocialMediaIntegration: function(account, block, fn) {
        var query={accountId:account.id(), 'socialAccounts.0': {$exists:true}};
        socialConfigDao.exists(query, $$.m.SocialConfig, function(err, exists){
            if(err) {
                fn(err);
            } else {
                fn(null, exists);
            }
        });
    },

    _handleCreateBlogPost: function(account, block, fn) {
        var query = {accountId:account.id(), post_status:'PUBLISHED'};
        pageDao.exists(query, $$.m.BlogPost, function(err, exists){
            if(err) {
                fn(err);
            } else {
                fn(null, exists);
            }
        });
    },

    _handleIntegrateStripe: function(account, block, fn) {
        var query = {_id:account.id(), 'credentials.type':'stripe'};
        accountDao.exists(query, $$.m.Account, function(err, exists){
            if(err) {
                fn(err);
            } else {
                fn(null, exists);
            }
        });
    },

    _handleAddProduct: function(account, block, fn) {
        var query = {accountId:account.id(), status:'active'};
        productDao.exists(query, $$.m.Product, function(err, exists){
            if(err) {
                fn(err);
            } else {
                fn(null, exists);
            }
        });

    },

    _handleSetupOnlineStore: function(account, block, fn) {
        var query = {accountId:account.id(), latest:true, 'components.type':'products'};
        pageDao.exists(query, $$.m.cms.Page, function(err, exists){
            if(err) {
                fn(err);
            } else {
                fn(null, exists);
            }
        });
    }



}