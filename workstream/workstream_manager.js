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
var campaignDao = require('../campaign/dao/campaign.dao');

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
        self.log.trace('>> listWorkstreams');

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
                var updatedWorkstreams = [];
                async.eachSeries(workstreams, function(workstream, callback){
                    _.each(workstream.get('blocks'), function(block){
                        if(_.contains(completedBlockIDs, block._id)) {
                            block.complete = true;
                            update = true;
                        }
                        if(workstream.get('completed') === false) {
                            var completed = true;
                            _.each(workstream.get('blocks'), function(block){
                                if(block.complete === false && block.optional === false) {
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
                        workstreamDao.updateCompletion(workstream, function(err, updatedWorkstream){
                            updatedWorkstreams.push(updatedWorkstream);
                            callback(err);
                        });
                    } else {
                        updatedWorkstreams.push(workstream);
                        callback(null);
                    }
                }, function done(err){
                    cb(null, updatedWorkstreams);
                });


            }
        ], function done(err, workstreams){
            if(err) {
                self.log.error('Error listing workstreams:', err);
                return fn(err);
            } else {
                self.log.trace('<< listWorkstreams');
                return fn(null, workstreams);
            }
        });
    },

    getWorkstream: function(accountId, workstreamId, fn) {
        var self = this;
        self.log.debug('>> getWorkstream');

        var query = {_id:workstreamId, accountId:accountId};

        workstreamDao.findOne(query, $$.m.Workstream, function(err, workstream){
            if(err || !workstream) {
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
                                if(block.complete === false && block.optional === false) {
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
        self.log.debug('using query:', matchCriteria);
        contactDao.aggregrateWithSumAndDupes(groupCriteria, matchCriteria, $$.m.Contact, function(err, results){

            var total = 0;
            var leadTotal = 0;
            _.each(results, function(result){
                total+= result.count;
                if(result._id._id.tag && result._id._id.tag.indexOf('ld') > -1 ) {
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
            urlAry.push('www.' + url);
            if(accountId === appConfig.mainAccountID) {
                //this is a hack for local
                urlAry.push(appConfig.www_url.replace('http://', '').replace(':3000', ''));
            }
            var query = {
                'accountId': accountId,
                'server_time': {$gt:startDateMillis, $lt:endDateMillis},
                'server_time_dt': {$exists:true}
            };
            self.log.debug('query:', query);
            var groupCriteria = {
                _id: {month: {$month:'$server_time_dt'}, year: {$year:'$server_time_dt'}, day: {$dayOfMonth:'$server_time_dt'}}
            };
            analyticsDao.aggregrateWithSumAndDupes(groupCriteria, query, $$.m.PageEvent, function(err, results){

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

        analyticsDao.aggregrateWithSumAndDupes(groupCriteria, query, $$.m.SessionEvent, function(err, results){


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

    getVisitorsByDayReport: function(accountId, startDate, endDate, fn) {
        var self = this;
        self.log.debug(accountId, null, '>> getVisitorsByDayReport');

        var stageAry = [];
        var match = {
            $match:{
                accountId:accountId,
                server_time_dt:{
                    $gte:startDate,
                    $lte:endDate
                },
                fingerprint:{$ne:0}

            }
        };
        stageAry.push(match);

        var group1 = {
            $group: {
                _id:{
                    permanent_tracker:'$permanent_tracker',
                    yearMonthDay: { $dateToString: { format: "%Y-%m-%d", date: "$server_time_dt" }}
                }
            }
        };
        stageAry.push(group1);

        var group2 = {
            $group: {
                _id: '$_id.yearMonthDay',
                total:{$sum:1}
            }
        };
        stageAry.push(group2);

        analyticsDao.aggregateWithCustomStages(stageAry, $$.m.SessionEvent, function(err, value){
            if(err) {
                self.log.error('Error finding current month:', err);
                fn(err);
            } else {
                var total = 0;
                _.each(value, function(result){
                    total+= result.total;
                });
                var response = {
                    results: _.sortBy(value, '_id'),
                    total:total
                };
                self.log.debug(accountId, null, '<< getVisitorsByDayReport');
                fn(null, response);
            }
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
                _id: "$_id",

                // Count number of matching docs for the group
                count: { $sum: 1 },
                amount: { $max: '$total' }, // total is currently a string (cannot $sum in aggregate)
                tax: {$max: '$total_tax'}
            }
        });

        orderDao.aggregateWithCustomStages(stageAry, $$.m.Order, function(err, results){
            var total = 0;
            var totalAmount = 0;
            var totalTax = 0;

            _.each(results, function(result){
                total+= result.count;

                if(isNaN(parseFloat(result.amount))) {
                    self.log.warn('Order amount for account[' + accountId +']  with id ['+result._id + '] is ', result.amount);
                } else {
                    totalAmount += parseFloat(result.amount);
                }
                if(isNaN(parseFloat(result.tax))) {
                    self.log.warn('Order tax for account[' + accountId +']  with id ['+result._id + '] is ', result.tax);
                } else {
                    totalTax += parseFloat(result.tax);
                }




                delete result._id;
                delete result.count;
                delete result.amount;
                delete result.tax;
            });

            var response = {
                //results: results,
                YTDTotalOrders: total,
                YTDTotalAmount: totalAmount.toFixed(2),
                YTDTotalTax: totalTax.toFixed(2)
            };
            self.log.debug('<< getRevenueByMonthReport: ', response);
            fn(err, response);
        });
    },

    getCampaignStatsByMonthReport: function(accountId, startDate, endDate, fn){
        var self = this;
        self.log.debug('>> getCampaignStatsByMonthReport');
        /*
         {$match:{
         accountId:4
         }
         },
         {$group:{
         _id: {month: {$month:'$created.date'}},
         totalSent: {$sum: '$statistics.emailsSent'},
         totalOpened: {$sum: '$statistics.emailsOpened'},
         totalParticipants: {$sum: '$statistics.participants'}
         }
         */


        var query = {
            accountId:accountId,
            'created.date': {
                $gte: startDate,
                $lte:endDate
            }
        };
        self.log.debug('Using query:', query);
        var groupCriteria = {_id: {month: {$month:'$created.date'}}};
        var stageAry = [];
        stageAry.push({$match: query});
        stageAry.push({
            $group: {
                _id: groupCriteria,

                // Count number of matching docs for the group
                count: { $sum: 1 },
                totalSent: {$sum: '$statistics.emailsSent'},
                totalOpened: {$sum: '$statistics.emailsOpened'},
                totalClicked: {$sum: '$statistics.emailsClicked'},
                totalParticipants: {$sum: '$statistics.participants'}
            }
        });

        campaignDao.aggregateWithCustomStages(stageAry, $$.m.Campaign, function(err, results){
            if(err) {
                self.log.error('Error getting campaign report:', err);
                return fn(err);
            } else {
                var totalSent = 0;
                var totalOpened = 0;
                var totalClicked = 0;
                var totalParticipants =0;

                _.each(results, function(result){
                    result.month = result._id._id.month;
                    totalSent += result.totalSent;
                    totalOpened += result.totalOpened;
                    totalClicked += result.totalClicked;
                    totalParticipants += result.totalParticipants;
                    delete result._id;
                });

                var response = {
                    results: _.sortBy(results, 'month'),
                    totalSent: totalSent,
                    totalOpened: totalOpened,
                    totalClicked: totalClicked,
                    totalPartipants:totalParticipants
                };
                self.log.debug('<< getCampaignStatsByMonthReport');
                return fn(null, response);
            }
        });
    },

    getDashboardAnalytics: function(accountId, startDate, endDate, fn) {
        var self = this;
        self.log.debug('>> getDashboardAnalytics');
        async.parallel([
            function getContactsByDay(callback){
                self.getContactsByDayReport(accountId, startDate, endDate, function(err, results){
                    callback(err, {contacts:results});
                });
            },
            function getPageViews(callback){
                self.getPageViewsByDayReport(accountId, startDate, endDate, function(err, results){
                    callback(err, {pageViews:results});
                });
            },
            function getNewVisitors(callback){
                self.getNewVisitorsByDayReport(accountId, startDate, endDate, function(err, results){
                    callback(err, {visitors:results});
                });
            },
            function getRevenue(callback){
                self.getRevenueByMonthReport(accountId, function(err, results){
                    callback(err, {revenue:results});
                });
            },
            function getCampaignStats(callback){
                self.getCampaignStatsByMonthReport(accountId, startDate, endDate, function(err, results){
                    callback(err, {campaigns:results});
                });
            },
            function getVisitors(callback) {
                self.getVisitorsByDayReport(accountId, startDate, endDate, function(err, results){
                    callback(err, {allvisitors:results});
                });
            }
        ], function done(err, results){
            //compose results and return
            var response = _.reduce(results, function(response, result){
                var key = _.keys(result)[0];
                response[key] = result[key];
                return response;
            }, {});

            self.log.debug('<< getDashboardAnalytics');
            return fn(err, response);
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
