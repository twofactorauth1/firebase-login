/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2015
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var logger = $$.g.getLogger("workstream_manager");
var workstreamDao = require('./dao/workstream.dao');
var blockDao = require('./dao/block.dao');
var accountDao = require('../dao/account.dao');
var contactDao = require('../dao/contact.dao');

var blockManager = require('./block_manager');
var async = require('async');

module.exports = {
    log: logger,

    listBlocks: function(fn){
        var self = this;
        self.log.debug('>> listBlocks');
        blockDao.findMany({}, $$.m.Block, function(err, blocks){
            if(err) {
                self.log.error('Error listing blocks:', err);
                return fn(err);
            } else {
                self.log.debug('<< listBlocks');
                return fn(null, blocks);
            }
        });
    },

    listWorkstreams: function(accountId, fn){
        var self = this;
        self.log.debug('>> listWorkstreams');

        var query = {accountId:accountId};

        async.waterfall([
            function getWorkstreams(cb){
                workstreamDao.findMany(query, $$.m.Workstream, function(err, workstreams){
                    if(err) {
                        self.log.error('Error listing workstreams:', err);
                        cb(err);
                    } else {
                        cb(null, workstreams);
                    }
                });
            },
            function getCompletedBlocks(workstreams, cb){
                self._getCompletedBlocks(accountId, function(err, completedBlocks){
                    if(err) {
                        self.log.error('Error getting completedBlocks:', err);
                        cb(err);
                    } else {
                        cb(null, workstreams, completedBlocks);
                    }
                });
            },
            function markBlocksOnWorkstreams(workstreams, completedBlocks, cb){
                //for each workstream, mark its block completed if it exists in completed blocks
                var update = false;
                var completedBlockIDs = _.map(completedBlocks, function(block){return block._id;});
                _.each(workstreams, function(workstream){
                    _.each(workstream.get('blocks'), function(block){
                        if(_.contains(completedBlockIDs, block._id)) {
                            block.complete = true;
                            update = true;
                        }
                    });
                });
                // for each workstream, mark it completed if all blocks are completed
                _.each(workstreams, function(workstream){
                    if(workstream.get('completed') === false) {
                        var completed = true;
                        _.each(workstream.get('blocks'), function(block){
                            if(block.complete === false) {
                                completed = false;
                            }
                        });
                        if(completed === true) {
                            workstream.set('completed', true);
                            update = true;
                        }
                    }

                });
                if(update === true) {
                    workstreamDao.saveWorkstreams(workstreams, cb);
                } else {
                    cb(null, workstreams);
                }
            }
        ], function done(err, workstreams){
            if(err) {
                self.log.error('Error listing workstreams:', err);
                return fn(err);
            } else {
                self.log.debug('<< listWorkstreams');
                return fn(null, workstreams);
            }
        });
    },

    getWorkstream: function(accountId, workstreamId, fn) {
        var self = this;
        self.log.debug('>> getWorkstream');

        var query = {_id:workstreamId, accountId:accountId};

        workstreamDao.findOne(query, $$.m.Workstream, function(err, workstream){
            if(err) {
                self.log.error('Error getting workstream:', err);
                return fn(err);
            } else {
                self.log.debug('<< getWorkstream');
                return fn(null, workstream);
            }
        });
    },

    unlockWorkstream: function(accountId, workstreamId, fn) {
        var self = this;
        self.log.debug('>> unlockWorkstream');

        var query = { _id: workstreamId, accountId: accountId };
        workstreamDao.findOne(query, $$.m.Workstream, function(err, workstream){
            if(err) {
                self.log.error('Error getting workstream:', err);
                return fn(err);
            } else {
                workstream.set('unlocked', true);
                workstreamDao.saveOrUpdate(workstream, function(err, updatedWorkstream){
                    if(err) {
                        self.log.error('Error updating workstream:', err);
                        return fn(err);
                    } else {
                        self.log.debug('<< unlockWorkstream');
                        return fn(null, updatedWorkstream);
                    }
                });

            }
        });

    },

    markBlockComplete: function(accountId, workstreamId, blockId, modified, fn) {
        var self = this;
        self.log.debug('>> markBlockComplete');
        var query = {_id:workstreamId, accountId:accountId};
        workstreamDao.findOne(query, $$.m.Workstream, function(err, workstream) {
            if (err || !workstream) {
                self.log.error('Error getting workstream:', err);
                return fn(err);
            } else {
                _.each(workstream.get('blocks'), function(block){
                    if(block._id === blockId) {
                        block.complete = true;
                    }
                });
                workstream.set('modified', modified);
                workstreamDao.saveOrUpdate(workstream, function(err, stream){
                    if(err) {
                        self.log.error('Error saving workstream:', err);
                        return fn(err);
                    } else {
                        self.log.debug('<< markBlockComplete');
                        return fn(null, stream);
                    }
                });
            }
        });

    },

    /*
     * This may need to go somewhere else
     */
    getContactsByDayReport: function(accountId, fn) {
        var self = this;

        //db.contacts.aggregate([{$match:{accountId:4}},{$group:{ _id: {month: {$month:'$created.date'}, year: {$year:'$created.date'}, day: {$dayOfMonth:'$created.date'}}, count:{ "$sum": 1 }}}])
        var groupCriteria = {_id: {month: {$month:'$created.date'}, year: {$year:'$created.date'}, day: {$dayOfMonth:'$created.date'}}};
        var matchCriteria = {accountId:accountId, 'created.date': {$gt: new Date(2015,8,1,0,0,0,0)}, tags:'ld'};//TODO: remove this hardcoded time limit

        contactDao.aggregate(groupCriteria, matchCriteria, $$.m.Contact, function(err, results){
            fn(err, results);
        });

    },

    addDefaultWorkstreamsToAccount: function(accountId, fn) {
        var self = this;
        self.log.debug('>> addDefaultWorkstreamsToAccount');
        var query = {accountId:0};
        workstreamDao.findMany(query, $$.m.Workstream, function(err, ary){
            if(err || !ary) {
                self.log.error('Error finding default workstreams:', err);
                return fn(err);
            } else {
                _.each(ary, function(stream){
                    stream.set('_id', null);
                    stream.set('accountId', accountId);
                    stream.set('created', {date: new Date(), by:null});
                });
                workstreamDao.saveWorkstreams(ary, function(err, savedStreams){
                    if(err) {
                        self.log.error('Error saving default workstreams:', err);
                        return fn(err);
                    } else {
                        self.log.debug('<< addDefaultWorkstreamsToAccount');
                        return fn(null, savedStreams);
                    }
                });
            }
        });


    },


    _getCompletedBlocks: function(accountId, fn){
        blockManager.getCompletedBlocks(accountId, fn);
    }


};
