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
var analyticsDao = require('../analytics/dao/analytics.dao');
var orderDao = require('../orders/dao/order.dao');

var blockManager = require('./block_manager');
var userActivityManager = require('../useractivities/useractivity_manager');
var async = require('async');
var moment = require('moment');
var appConfig = require('../configs/app.config');
var constants = require('./constants');

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
            function createDefaultStreamsIfNotPresent(workstreams, cb) {
                if(!workstreams || workstreams.length === 0) {
                    self.log.debug('Creating default workstreams for account ' + accountId);
                    self.addDefaultWorkstreamsToAccount(accountId, cb);
                } else {
                    cb(null, workstreams);
                }
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
                self._getCompletedBlocks(accountId, function(err, completedBlocks){
                    if(err) {
                        self.log.error('Error getting completed blocks:', err);
                        return fn(err);
                    } else {
                        var update = false;
                        var completedBlockIDs = _.map(completedBlocks, function(block){return block._id;});

                        _.each(workstream.get('blocks'), function(block){
                            if(_.contains(completedBlockIDs, block._id)) {
                                block.complete = true;
                                update = true;
                            }
                        });
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

                        if(update === true) {
                            workstreamDao.saveOrUpdate(workstream, function(err, updatedStream){
                                if(err) {
                                    self.log.error('Error updating completeness on workstream:', err);
                                    return fn(err, null);
                                } else {
                                    self.log.debug('<< getWorkstream');
                                    return fn(null, updatedStream);
                                }
                            });
                        } else {
                            self.log.debug('<< getWorkstream');
                            return fn(null, workstream);
                        }
                    }
                });

            }
        });
    },

    unlockWorkstream: function(accountId, workstreamId, userId, fn) {
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
                        fn(null, updatedWorkstream);
                        var userActivity = new $$.m.UserActivity({
                            accountId: accountId,
                            userId: userId,
                            activityType:$$.m.UserActivity.types.UNLOCK_WORKSTREAM,
                            note: 'Workstream ' + workstreamId
                        });
                        return userActivityManager.createUserActivity(userActivity, function(){});
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
                        fn(null, stream);
                        var userActivity = new $$.m.UserActivity({
                            accountId: accountId,
                            userId: modified.by,
                            activityType:$$.m.UserActivity.types.MARK_BLOCK_COMPLETE,
                            note: 'Workstream ' + workstreamId + 'and Block:' + blockId
                        });
                        return userActivityManager.createUserActivity(userActivity, function(){});
                    }
                });
            }
        });

    },

    /*
     * This may need to go somewhere else
     */
    getContactsByDayReport: function(accountId, startDate, endDate, fn) {
        var self = this;

        //db.contacts.aggregate([{$match:{accountId:4}},{$group:{ _id: {month: {$month:'$created.date'}, year: {$year:'$created.date'}, day: {$dayOfMonth:'$created.date'}}, count:{ "$sum": 1 }}}])
        var groupCriteria = {_id: {month: {$month:'$created.date'}, year: {$year:'$created.date'}, day: {$dayOfMonth:'$created.date'}, tag:'$tags'}};
        var matchCriteria = {accountId:accountId, 'created.date': {$gte: startDate, $lte:endDate}};

        contactDao.aggregateWithSum(groupCriteria, matchCriteria, $$.m.Contact, function(err, results){

            var total = 0;
            var leadTotal = 0;
            _.each(results, function(result){
                total+= result.count;
                if(result._id._id.tag && result._id._id.tag[0] === 'ld') {
                    leadTotal+= result.count;
                }
                if(result._id._id.day < 10) {
                    result._id._id.day = '0' + result._id._id.day;
                }
                result.day = result._id._id.year + '-' + result._id._id.month + '-' + result._id._id.day;
                if(result._id._id.tag && result._id._id.tag.length > 0) {
                    result.tag = result._id._id.tag[0];
                } else {
                    result.tag = 'NONE'
                }
                delete result._id;

            });
            var response = {
                results: _.sortBy(results, 'day'),
                total:total,
                leadTotal:leadTotal
            };
            fn(err, response);
        });

    },

    getPageViewsByDayReport: function(accountId, startDate, endDate, fn) {
        var self = this;
        self.log.debug('>> getPageViewsByDayReport');
        /*
         * query: {
         *  url.domain in accountUrl (+/- www)
         *  server_time gt startDate -> ms AND lt endDate ->  ms ... using server's timezone as startDay/endDay
         * }
         *
         * db.page_events.aggregate([{$match:{
         'url.domain': {$in:['www.indigenous.local', 'indigenous.local']},
         'server_time': {$gt:1448928000000},
         'server_time': {$lt:1449886165000},
         'server_time_dt': {$exists:true}}
         }, {
         $group:{
         _id: {month: {$month:'$server_time_dt'}, year: {$year:'$server_time_dt'}, day: {$dayOfMonth:'$server_time_dt'}}, count: {$sum:1}
         }
         }])
         */
        accountDao.getServerDomainByAccount(accountId, function(err, url){
            if(err || !url) {
                self.log.error('Error getting server domain:', err);
                return fn(err);
            }

            var startDateMillis = startDate.getTime();
            var endDateMillis = endDate.getTime();
            var urlAry = [];
            urlAry.push(url);
            if(accountId === appConfig.mainAccountID) {
                //this is a hack for local
                urlAry.push(appConfig.www_url.replace('http://', '').replace(':3000', ''));
            }
            var query = {
                'url.domain': {$in:urlAry},
                'server_time': {$gt:startDateMillis, $lt:endDateMillis},
                'server_time_dt': {$exists:true}
            };
            self.log.debug('query:', query);
            var groupCriteria = {
                _id: {month: {$month:'$server_time_dt'}, year: {$year:'$server_time_dt'}, day: {$dayOfMonth:'$server_time_dt'}}
            };
            analyticsDao.aggregateWithSum(groupCriteria, query, $$.m.PageEvent, function(err, results){

                var total = 0;
                _.each(results, function(result){
                    if(result._id._id.day < 10) {
                        result._id._id.day = '0' + result._id._id.day;
                    }
                    result.day = result._id._id.year + '-' + result._id._id.month + '-' + result._id._id.day;
                    delete result._id;
                    total+= result.count;
                });
                var response = {
                    results: _.sortBy(results, 'day'),
                    total:total
                };
                self.log.debug('<< getPageViewsByDayReport');
                fn(err, response);
            });

        });

        //db.page_events.find({'url.domain': {$in:['www.indigenous.io', 'indigenous.io']}, server_time : {$gt: 1448928000000}}).count()

    },

    getNewVisitorsByDayReport: function(accountId, startDate, endDate, fn) {
        var self = this;
        self.log.debug('>> getUniqueVisitorsByDayReport');
        var startDateMillis = startDate.getTime();
        var endDateMillis = endDate.getTime();
        //db.session_events.find({accountId:6, server_time_dt:{$exists:true}, new_visitor:true, server_time: {$lt:1449786165000, $gt:1448928000000}})
        var query = {
            accountId:accountId,
            server_time_dt:{$exists:true},
            new_visitor:true,
            server_time: {$gt:startDateMillis, $lt:endDateMillis}
        };
        var groupCriteria = {
            _id: {month: {$month:'$server_time_dt'}, year: {$year:'$server_time_dt'}, day: {$dayOfMonth:'$server_time_dt'}}
        };

        analyticsDao.aggregateWithSum(groupCriteria, query, $$.m.SessionEvent, function(err, results){


            var total = 0;
            _.each(results, function(result){
                if(result._id._id.day < 10) {
                    result._id._id.day = '0' + result._id._id.day;
                }
                result.day = result._id._id.year + '-' + result._id._id.month + '-' + result._id._id.day;
                delete result._id;
                total+= result.count;
            });
            var response = {
                results: _.sortBy(results, 'day'),
                total:total
            };

            self.log.debug('<< getUniqueVisitorsByDayReport');
            fn(err, response);
        });

    },

    getRevenueByMonthReport: function(accountId, fn) {
        var self = this;
        self.log.debug('>> getRevenueByMonthReport');
        var startOfYear= moment().startOf('year').toDate();
        var query = {
            account_id:accountId,
            created_at: {$gte: startOfYear}
        };
        var groupCriteria = {
            _id:{month: {$month:'$created_at'}}
        };

        var stageAry = [];
        stageAry.push({$match: query});
        stageAry.push({
            $group: {
                _id: groupCriteria,

                // Count number of matching docs for the group
                count: { $sum: 1 },
                amount: {$sum: '$total'}
            }
        });

        orderDao.aggregateWithCustomStages(stageAry, $$.m.Order, function(err, results){

            var total = 0;
            var totalAmount = 0;

            _.each(results, function(result){
                total+= result.count;
                totalAmount += result.amount;
                result.amount = result.amount.toFixed(2);
                result.month = result._id._id.month;
                result.orderCount = result.count;
                delete result._id;
                delete result.count;
            });


            var response = {
                results: _.sortBy(results, 'month'),
                total: total,
                totalAmount: totalAmount.toFixed(2)
            };
            self.log.debug('<< getRevenueByMonthReport');
            fn(err, response);
        });
    },

    addDefaultWorkstreamsToAccount: function(accountId, fn) {
        var self = this;
        self.log.debug('>> addDefaultWorkstreamsToAccount');


        var ary = constants.defaultWorkstreams.slice();
        _.each(ary, function(stream, index){
            stream = new $$.m.Workstream(stream);
            stream.set('_id', null);
            stream.set('accountId', accountId);
            stream.set('created', {date: new Date(), by:null});
            ary[index] = stream;
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

    },


    _getCompletedBlocks: function(accountId, fn){
        blockManager.getCompletedBlocks(accountId, fn);
    }


};
