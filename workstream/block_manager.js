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
            '2': self._handleFormSettingsForLeads
        };
        if(typeof lookup[''+blockId] !== 'function') {
            self.log.error('No handler found for blockId:' + blockId);
            return fn('No handler found for blockId:' + blockId);
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
    }


}