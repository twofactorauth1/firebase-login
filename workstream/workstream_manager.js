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
        //TODO: make these a constant somewhere else
        var defaultWorkstream = new $$.m.Workstream({
            "accountId" : accountId,
            "unlockVideoUrl" : "https://www.youtube.com/watch?v=mlB1aDUDjiU",
            "unlocked" : false,
            "completed" : false,
            "blocks" : [
            {
                "_id" : 0,
                "name" : "Create Page",
                "link" : "/admin/website/pages",
                "helpText" : "Create a page on your website that will collect information on leads.",
                "complete" : true
            },
            {
                "_id" : 1,
                "name" : "Add form to Page",
                "link" : "/admin/website/pages",
                "helpText" : "Add a form to your page that will collection information about Leads.",
                "complete" : true
            },
            {
                "_id" : 2,
                "name" : "Configure Form for Leads",
                "link" : "/admin/website/pages",
                "helpText" : "Configure the form on your page to apply a label of 'Lead' to new contacts.",
                "complete" : true
            }
        ],
            "deepDiveVideoUrls" : [],
            "analyticWidgets" : [
            {
                "name" : "PageViews"
            },
            {
                "name" : "LeadsPerDay"
            }
        ],
            "name" : "Collect Leads",
            "icon" : "",
            "_v" : "0.1",
            "created" : {
            "date" : null,
                "by" : null
        },
            "modified" : {
            "date" : null,
                "by" : null
        }
        });

        var workstreamAry = [];
        workstreamAry.push(defaultWorkstream);

        workstreamDao.saveWorkstreams(workstreamAry, function(err, savedStreams){
            if(err) {
                self.log.error('Error saving default workstreams:', err);
                return fn(err);
            } else {
                self.log.debug('<< addDefaultWorkstreamsToAccount');
                return fn(null, savedStreams);
            }
        });
    },


    _getCompletedBlocks: function(accountId, fn){
        blockManager.getCompletedBlocks(accountId, fn);
    }


};
