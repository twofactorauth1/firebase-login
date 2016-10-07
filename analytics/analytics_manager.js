/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */
require('./dao/analytics.dao.js');
var _log = $$.g.getLogger("analytics_manager");
var SEGMENTIO = 'segment.io';
var dao = require('./dao/analytics.dao.js');
var segmentConfig = require('../configs/segmentio.config');
//var Analytics = require('analytics-node');
//var analytics = new Analytics(segmentConfig.SEGMENT_WRITE_KEY);
var contactDao = require('../dao/contact.dao');
var contactActivityManager = require('../contactactivities/contactactivity_manager');
var async = require('async');
var accountDao = require('../dao/account.dao');
var orderDao = require('../orders/dao/order.dao');

module.exports = {


    createEventFromSegment: function(segmentObj, fn) {
        var self = this;
        _log.debug('>> createEventFromSegment');
        /*
         * if there is a groupId, use that
         * if there are traits, use traits[accountId]
         * if there are properties, use properties[accountId]
         * else 0
         */
        var accountId = 0;
        if(segmentObj.hasOwnProperty('groupId')){
            accountId = segmentObj.groupId;
        } else if(segmentObj.hasOwnProperty('traits')){
            accountId = segmentObj.traits['accountId'];
        } else if(segmentObj.hasOwnProperty('properties')){
            accountId = segmentObj.properties['accountId'];
        }
        var analyticEvent = new $$.m.AnalyticsEvent({
            type: segmentObj.type,
            source: SEGMENTIO,
            accountId:accountId,
            timestamp: new Date(),
            body:segmentObj
        });
        dao.saveOrUpdate(analyticEvent, function(err, value){
            if(err) {
                _log.error('Exception saving event: ' + err);
                fn(err, null);
            } else {
                _log.debug('<< createEventFromSegment');
                fn(null, value);
            }
        });
        //associate the event to a contact.

    },

    createEvent: function(analyticsEvent, fn) {
        var self = this;
        _log.debug('>> createEvent');
        dao.saveOrUpdate(analyticsEvent, function(err, value){
            if(err) {
                _log.error('Exception saving event: ' + err);
                fn(err, null);
            } else {
                _log.debug('<< createEvent');
                fn(null, value);
            }
        });
    },

    updateEvent: function(analyticsEvent, fn) {
        var self = this;
        _log.debug('>> updateEvent');
        dao.saveOrUpdate(analyticsEvent, function(err, value){
            if(err) {
                _log.error('Exception updating event: ' + err);
                fn(err, null);
            } else {
                _log.debug('<< updateEvent');
                fn(null, value);
            }
        });
    },

    getEvent: function(eventID, fn) {
        var self = this;
        _log.debug('>> getEvent');
        dao.getById(eventID, $$.m.AnalyticsEvent, function(err, value){
            if(err) {
                _log.error('Exception getting event: ' + err);
                fn(err, null);
            } else {
                _log.debug('<< getEvent');
                fn(null, value);
            }
        });
    },

    removeEvent: function(eventID, fn) {
        var self = this;
        _log.debug('>> removeEvent');
        dao.removeById(eventID, $$.m.AnalyticsEvent, function(err, value){
            if(err) {
                _log.error('Exception removing event: ' + err);
                fn(err, null);
            } else {
                _log.debug('<< removeEvent');
                fn(null, value);
            }
        });
    },

    listEvents: function(accountId, limit, skip, fn) {
        var self = this;
        _log.debug('>> listEvents');
        var query = {};
        if(accountId) {
            query.accountId = accountId;
        }
        dao.findAllWithFieldsAndLimit(query, skip, limit, null, null, $$.m.AnalyticsEvent, function(err, list){
            if(err) {
                _log.error('Exception listing events: ' + err);
                fn(err, null);
            } else {
                _log.debug('<< listEvents');
                fn(null, list);
            }
        });
    },
    /*
    linkUsers: function(oldId, newId, fn) {
        var self = this;
        _log.debug('>> linkUsers');
        analytics.alias({
            previousId: oldId,
            userId: newId
        }, function(err, value){
            if(err) {
                _log.error('Error calling segment to link users: ' + err);
            } else {
                _log.debug('Linked users: ' + value);
            }
            _log.debug('<< linkUsers');
            fn(null, value);
        });
    },
    */

    storeSessionEvent: function(sessionEvent, fn) {
        var self = this;
        _log.debug('>> storeSessionEvent ', sessionEvent.get('fingerprint'), sessionEvent.get('session_id'));
        //check if we have one already....
        dao.findOne({session_id: sessionEvent.get('session_id')}, $$.m.SessionEvent, function(err, value){
            _log.debug('>> found session event ', value);
            if(err) {
                _log.error('Error looking for duplicate sessionEvents: ' + err);
                fn(err, null);
            } else if(value=== null) {


                var fingerprint = sessionEvent.get('fingerprint');
                _log.debug('>> searching for contacts that have fingerprint ', fingerprint);

                $$.dao.ContactDao.findMany({fingerprint:fingerprint}, $$.m.Contact, function(err, list){
                    if(err) {
                        _log.error('error creating contact activity for session event: ' + err);
                    } else {
                        _log.debug('>> found contacts with matching fingerprint ', list);
                        async.each(list, function(contact, cb){
                            var contactActivity = new $$.m.ContactActivity({
                                accountId: contact.get('accountId'),
                                contactId: contact.id(),
                                activityType: $$.m.ContactActivity.types.PAGE_VIEW,
                                start: new Date(),
                                extraFields: {
                                    page: sessionEvent.fullEntrance,
                                    timespent: sessionEvent.session_length
                                }
                            });
                            _log.debug('>> createActivity2 ', contactActivity);
                            contactActivityManager.createActivity(contactActivity, function(err, val){
                                if(err) {
                                    _log.error('error creating contact activity for session event: ' + err);
                                    cb(err);
                                } else {
                                    cb();
                                }
                            });
                        }, function(err){
                            _log.debug('Created contact activities for session event');
                            dao.saveOrUpdate(sessionEvent, fn);
                        });
                    }
                });
            } else {
                //already have one.  Store a ping instead.
                var pingEvent = new $$.m.PingEvent({
                    session_id: sessionEvent.get('session_id'),
                    server_time: sessionEvent.get('server_time')
                });
                dao.saveOrUpdate(pingEvent, fn);
            }
        });


    },

    findSessionEventsByFingerprint: function(fingerprint, accountId, fn) {
        _log.debug('>> findSessionEventsByFingerprint');
        var query = {
            fingerprint: fingerprint,
            accountId: accountId
        };
        dao.findMany(query, $$.m.SessionEvent, function(err, value){
            if(err) {
                _log.error('Error finding session events: ' + err);
                fn(err, null);
            } else {
                _log.debug('<< findSessionEventsByFingerprint');
                fn(null, value);
            }
        });
    },

    storePageEvent: function(pageEvent, fn) {
        //_log.debug('>> storePageEvent');
        dao.saveOrUpdate(pageEvent, fn);
    },

    storePingEvent: function(pingEvent, fn) {
        //_log.debug('>> storePingEvent');
        dao.saveOrUpdate(pingEvent, fn);
    },

    getVisitorReports: function(accountId, userId, startDate, endDate, isAggregate, fn) {
        var self = this;
        self.log = _log;
        self.log.debug(accountId, userId, '>> getVisitorReports');


        var stageAry = [];
        var match = {
            $match:{
                accountId:accountId,
                server_time_dt:{
                    $gte:startDate,
                    $lte:endDate
                },
                new_visitor:true

            }
        };
        if(isAggregate === true) {
            delete match.$match.accountId;
        }
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

        var group2 = {$group:{_id:"$_id.yearMonthDay", visits:{$sum:1} }};
        stageAry.push(group2);

        async.waterfall([
            function(cb){
                dao.aggregateWithCustomStages(stageAry, $$.m.SessionEvent, function(err, value) {
                    //{"result": [{"value": 6, "timeframe": {"start": "2016-06-20T05:00:00.000Z", "end": "2016-06-21T05:00:00.000Z"}}
                    if(err) {
                        self.log.error('Error getting analytics:', err);
                        cb(err);
                    } else {
                        var resultAry = [];
                        _.each(value, function (entry) {
                            var result = {
                                value: entry.visits,
                                timeframe: {
                                    start: entry._id
                                }
                            };
                            result.timeframe.end = moment(entry._id).add(1, 'days').format('YYYY-MM-DD');
                            resultAry.push(result);
                        });
                        resultAry = _.sortBy(resultAry, function(result){return result.timeframe.start;});
                        resultAry = self._zeroMissingDays(resultAry, {value:0}, moment(startDate).format('YYYY-MM-DD'), moment(endDate).format('YYYY-MM-DD'));
                        cb(null, resultAry);
                    }
                });
            },
            function(newVisitorResults, cb) {
                stageAry[0].$match.new_visitor = false;
                dao.aggregateWithCustomStages(stageAry, $$.m.SessionEvent, function(err, value) {
                    //{"result": [{"value": 6, "timeframe": {"start": "2016-06-20T05:00:00.000Z", "end": "2016-06-21T05:00:00.000Z"}}
                    if(err) {
                        self.log.error('Error getting analytics:', err);
                        cb(err);
                    } else {
                        var resultAry = [];
                        _.each(value, function (entry) {
                            var result = {
                                value: entry.visits,
                                timeframe: {
                                    start: entry._id
                                }
                            };
                            result.timeframe.end = moment(entry._id).add(1, 'days').format('YYYY-MM-DD');
                            resultAry.push(result);
                        });
                        resultAry = _.sortBy(resultAry, function(result){return result.timeframe.start;});
                        resultAry = self._zeroMissingDays(resultAry, {value:0}, moment(startDate).format('YYYY-MM-DD'), moment(endDate).format('YYYY-MM-DD'));
                        cb(null, newVisitorResults, resultAry);
                    }
                });
            },
            function combine(newVisitorResults, returningVisitorResults, cb) {
                var result = {
                    newVisitors:newVisitorResults,
                    returning:returningVisitorResults
                };
                cb(null, result);
            }
        ], function(err, result){
            self.log.debug(accountId, userId, '<< getVisitorReports');
            fn(err, result);
        });

    },

    getVisitorLocationsReport: function(accountId, userId, startDate, endDate, isAggregate, fn) {
        var self = this;
        self.log = _log;
        self.log.debug(accountId, userId, '>> getVisitorLocationsReport');

        var stageAry = [];
        var match = {
            $match:{
                accountId:accountId,
                server_time_dt:{
                    $gte:startDate,
                    $lte:endDate
                },
                fingerprint:{$ne:null}

            }
        };
        if(isAggregate === true) {
            delete match.$match.accountId;
        }
        stageAry.push(match);

        var group1 = {
            $group: {
                _id: '$maxmind.province',
                result: {$sum:1}
            }
        };
        stageAry.push(group1);

        dao.aggregateWithCustomStages(stageAry, $$.m.SessionEvent, function(err, value) {
            _.each(value, function(result){
                result['ip_geo_info.province'] = result._id;
            });
            self.log.debug(accountId, userId, '<< getVisitorLocationsReport');
            fn(err, value);
        });
    },

    getVisitorDeviceReport: function(accountId, userId, startDate, endDate, isAggregate, fn) {

        var self = this;
        self.log = _log;
        self.log.debug(accountId, userId, '>> getVisitorDeviceReport');

        var stageAry = [];
        var match = {
            $match:{
                accountId:accountId,
                server_time_dt:{
                    $gte:startDate,
                    $lte:endDate
                },
                fingerprint:{$ne:null}

            }
        };
        if(isAggregate === true) {
            delete match.$match.accountId;
        }
        stageAry.push(match);

        var group1 = {
            $group: {
                _id: '$user_agent.device',
                count: {$sum:1}
            }
        };
        stageAry.push(group1);

        dao.aggregateWithCustomStages(stageAry, $$.m.SessionEvent, function(err, value) {
            //{"result": [{"user_agent.device": "desktop", "result": 123}, {"user_agent.device": "mobile", "result": 14}]}
            var resultAry = [];
            _.each(value, function(entry){
                var res = {
                    'user_agent.device': entry._id,
                    'result': entry.count
                };
                resultAry.push(res);
            });
            var result = {result: resultAry};
            self.log.debug(accountId, userId, '<< getVisitorDeviceReport');
            fn(err, result);
        });
    },


    getUserReport:function(accountId, userId, start, end, previousStart, previousEnd, isAggregate, fn) {
        var self = this;
        self.log = _log;
        self.log.debug(accountId, userId, '>> getUserReport');

        var stageAry = [];
        var match = {
            $match:{
                accountId:accountId,
                server_time_dt:{
                    $gte:start,
                    $lte:end
                },
                fingerprint:{$ne:0}

            }
        };
        if(isAggregate === true) {
            delete match.$match.accountId;
        }
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

        async.waterfall([
            function(cb) {
                dao.aggregateWithCustomStages(stageAry, $$.m.SessionEvent, function(err, value) {
                    if(err) {
                        self.log.error('Error finding current month:', err);
                        cb(err);
                    } else {
                        var resultAry = [];
                        _.each(value, function (entry) {
                            var result = {
                                value: entry.total,
                                timeframe: {
                                    start: entry._id
                                }
                            };
                            result.timeframe.end = moment(entry._id).add(1, 'days').format('YYYY-MM-DD');
                            resultAry.push(result);
                        });
                        resultAry = _.sortBy(resultAry, function(result){return result.timeframe.start;});
                        resultAry = self._zeroMissingDays(resultAry, {value:0}, moment(start).format('YYYY-MM-DD'), moment(end).format('YYYY-MM-DD'));
                        cb(null, resultAry);
                    }
                });
            },
            function (currentMonth, cb) {
                stageAry[0].$match.server_time_dt.$gte = previousStart;
                stageAry[0].$match.server_time_dt.$lte = previousEnd;
                dao.aggregateWithCustomStages(stageAry, $$.m.SessionEvent, function(err, value) {
                    if(err) {
                        self.log.error('Error finding previous month:', err);
                        cb(err);
                    } else {
                        var resultAry = [];
                        _.each(value, function (entry) {
                            var result = {
                                value: entry.total,
                                timeframe: {
                                    start: entry._id
                                }
                            };
                            result.timeframe.end = moment(entry._id).add(1, 'days').format('YYYY-MM-DD');
                            resultAry.push(result);
                        });
                        resultAry = _.sortBy(resultAry, function(result){return result.timeframe.start;});
                        resultAry = self._zeroMissingDays(resultAry, {value:0}, moment(previousStart).format('YYYY-MM-DD'), moment(previousEnd).format('YYYY-MM-DD'));
                        cb(null, currentMonth, resultAry);
                    }
                });
            },
            function(currentMonth, previousMonth, cb) {

                var result = {
                    currentMonth:currentMonth,
                    previousMonth: previousMonth
                };
                cb(null, result);
            }
        ], function(err, results){
            self.log.debug(accountId, userId, '<< getUserReport');
            fn(err, results);
        });

    },

    getPageViewsReport: function(accountId, userId, start, end, previousStart, previousEnd, isAggregate, fn) {
        var self = this;
        self.log = _log;
        self.log.debug(accountId, userId, '>> getPageViewsReport');

        var stageAry = [];
        var match = {
            $match:{
                accountId:accountId,
                server_time_dt:{
                    $gte:start,
                    $lte:end
                }

            }
        };
        if(isAggregate === true) {
            delete match.$match.accountId;
        }
        stageAry.push(match);
        var group = {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$server_time_dt" }},
                count:{$sum:1}
            }
        };
        stageAry.push(group);

        async.waterfall([
            function(cb) {
                dao.aggregateWithCustomStages(stageAry, $$.m.PageEvent, function(err, value) {
                    if(err) {
                        self.log.error('Error finding current month:', err);
                        cb(err);
                    } else {
                        var resultAry = [];
                        _.each(value, function (entry) {
                            var result = {
                                value: entry.count,
                                timeframe: {
                                    start: entry._id
                                }
                            };
                            result.timeframe.end = moment(entry._id).add(1, 'days').format('YYYY-MM-DD');
                            resultAry.push(result);
                        });
                        resultAry = _.sortBy(resultAry, function(result){return result.timeframe.start;});
                        resultAry = self._zeroMissingDays(resultAry, {value:0}, moment(start).format('YYYY-MM-DD'), moment(end).format('YYYY-MM-DD'));
                        cb(null, resultAry);
                    }
                });
            },
            function (currentMonth, cb) {
                stageAry[0].$match.server_time_dt.$gte = previousStart;
                stageAry[0].$match.server_time_dt.$lte = previousEnd;
                dao.aggregateWithCustomStages(stageAry, $$.m.PageEvent, function(err, value) {
                    if(err) {
                        self.log.error('Error finding previous month:', err);
                        cb(err);
                    } else {
                        var resultAry = [];
                        _.each(value, function (entry) {
                            var result = {
                                value: entry.count,
                                timeframe: {
                                    start: entry._id
                                }
                            };
                            result.timeframe.end = moment(entry._id).add(1, 'days').format('YYYY-MM-DD');
                            resultAry.push(result);
                        });
                        resultAry = _.sortBy(resultAry, function(result){return result.timeframe.start;});
                        resultAry = self._zeroMissingDays(resultAry, {value:0}, moment(previousStart).format('YYYY-MM-DD'), moment(previousEnd).format('YYYY-MM-DD'));
                        cb(null, currentMonth, resultAry);
                    }
                });
            },
            function(currentMonth, previousMonth, cb) {
                var result = {
                    currentMonth:currentMonth,
                    previousMonth: previousMonth
                };
                cb(null, result);
            }
        ], function(err, results){
            self.log.debug(accountId, userId, '<< getPageViewsReport');
            fn(err, results);
        });

    },

    getSessionsReport:function(accountId, userId, start, end, previousStart, previousEnd, isAggregate, fn) {
        var self = this;
        self.log = _log;
        self.log.debug(accountId, userId, '>> getSessionsReport');

        var stageAry = [];
        var match = {
            $match:{
                accountId:accountId,
                server_time_dt:{
                    $gte:start,
                    $lte:end
                },
                fingerprint:{$ne:0}

            }
        };
        if(isAggregate === true) {
            delete match.$match.accountId;
        }
        stageAry.push(match);

        var group1 = {
            $group: {
                _id:{
                    session_id:'$session_id',
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

        async.waterfall([
            function(cb) {
                dao.aggregateWithCustomStages(stageAry, $$.m.SessionEvent, function(err, value) {
                    if(err) {
                        self.log.error('Error finding current month:', err);
                        cb(err);
                    } else {
                        var resultAry = [];
                        _.each(value, function (entry) {
                            var result = {
                                total: entry.total,
                                timeframe: {
                                    start: entry._id
                                }
                            };
                            result.timeframe.end = moment(entry._id).add(1, 'days').format('YYYY-MM-DD');
                            resultAry.push(result);
                        });
                        resultAry = _.sortBy(resultAry, function(result){return result.timeframe.start;});
                        resultAry = self._zeroMissingDays(resultAry, {total:0}, moment(start).format('YYYY-MM-DD'), moment(end).format('YYYY-MM-DD'));
                        cb(null, resultAry);
                    }
                });
            },
            function (currentMonth, cb) {
                stageAry[0].$match.server_time_dt.$gte = previousStart;
                stageAry[0].$match.server_time_dt.$lte = previousEnd;
                dao.aggregateWithCustomStages(stageAry, $$.m.SessionEvent, function(err, value) {
                    if(err) {
                        self.log.error('Error finding previous month:', err);
                        cb(err);
                    } else {
                        var resultAry = [];
                        _.each(value, function (entry) {
                            var result = {
                                total: entry.total,
                                timeframe: {
                                    start: entry._id
                                }
                            };
                            result.timeframe.end = moment(entry._id).add(1, 'days').format('YYYY-MM-DD');
                            resultAry.push(result);
                        });
                        resultAry = _.sortBy(resultAry, function(result){return result.timeframe.start;});
                        resultAry = self._zeroMissingDays(resultAry, {total:0}, moment(previousEnd).format('YYYY-MM-DD'));
                        cb(null, currentMonth, resultAry);
                    }
                });
            },
            function(currentMonth, previousMonth, cb) {
                var result = {
                    currentMonth:currentMonth,
                    previousMonth: previousMonth
                };
                cb(null, result);
            }
        ], function(err, results){
            self.log.debug(accountId, userId, '<< getSessionsReport');
            fn(err, results);
        });

    },

    sessionLengthReport: function(accountId, userId, start, end, previousStart, previousEnd, isAggregate, fn) {
        var self = this;
        self.log = _log;
        self.log.debug(accountId, userId, '>> sessionLengthReport');

        var stageAry = [];
        var match = {
            $match:{
                accountId:accountId,
                server_time_dt:{
                    $gte:start,
                    $lte:end
                },
                fingerprint:{$ne:0},
                session_length: {$gte:5000}
            }
        };
        if(isAggregate === true) {
            delete match.$match.accountId;
        }
        stageAry.push(match);

        var group1 = {
            $group: {
                _id:{ $dateToString: { format: "%Y-%m-%d", date: "$server_time_dt" }},
                averageTime:{$avg:'$session_length'},
                count:{$sum:1}
            }
        };
        stageAry.push(group1);

        async.waterfall([
            function nonBounceAverageSessionLength(cb) {
                dao.aggregateWithCustomStages(stageAry, $$.m.SessionEvent, function(err, value) {
                    if(err) {
                        self.log.error('Error finding current month:', err);
                        cb(err);
                    } else {
                        var resultAry = [];
                        _.each(value, function (entry) {
                            var result = {
                                value: entry.averageTime,
                                count: entry.count,
                                timeframe: {
                                    start: entry._id
                                }
                            };
                            result.timeframe.end = moment(entry._id).add(1, 'days').format('YYYY-MM-DD');
                            resultAry.push(result);
                        });
                        resultAry = _.sortBy(resultAry, function(result){return result.timeframe.start;});
                        resultAry = self._zeroMissingDays(resultAry, {value:0, count:0}, moment(start).format('YYYY-MM-DD'), moment(end).format('YYYY-MM-DD'));
                        cb(null, resultAry);
                    }
                });
            },
            function bounceAverageSessionLength(nonBounceAvg, cb) {
                stageAry[0].$match.session_length = {$lte:5000};
                //TODO: re-enable this
                //stageAry[0].$match.page_depth = {$lte:1};
                //self.log.debug('match:', stageAry[0]);
                dao.aggregateWithCustomStages(stageAry, $$.m.SessionEvent, function(err, value) {
                    if(err) {
                        self.log.error('Error finding current month:', err);
                        cb(err);
                    } else {
                        var resultAry = [];
                        _.each(value, function (entry) {
                            var result = {
                                value: entry.averageTime,
                                count: entry.count,
                                timeframe: {
                                    start: entry._id
                                }
                            };
                            result.timeframe.end = moment(entry._id).add(1, 'days').format('YYYY-MM-DD');
                            resultAry.push(result);
                        });
                        resultAry = _.sortBy(resultAry, function(result){return result.timeframe.start;});
                        resultAry = self._zeroMissingDays(resultAry, {value:0,count:0}, moment(start).format('YYYY-MM-DD'), moment(end).format('YYYY-MM-DD'));
                        //self.log.debug('results:', value);
                        cb(null, nonBounceAvg, resultAry);
                    }
                });
            },
            function previousNonBounceAverageSessionLength(nonBounceAvg, bounceAvg, cb) {
                stageAry[0].$match.session_length = {$gte:5000};
                //TODO: re-enable this
                //stageAry[0].$match.page_depth = {$gte:1};
                stageAry[0].$match.server_time_dt.$gte = previousStart;
                stageAry[0].$match.server_time_dt.$lte = previousEnd;
                dao.aggregateWithCustomStages(stageAry, $$.m.SessionEvent, function(err, value) {
                    if(err) {
                        self.log.error('Error finding current month:', err);
                        cb(err);
                    } else {
                        var resultAry = [];
                        _.each(value, function (entry) {
                            var result = {
                                value: entry.averageTime,
                                count: entry.count,
                                timeframe: {
                                    start: entry._id
                                }
                            };
                            result.timeframe.end = moment(entry._id).add(1, 'days').format('YYYY-MM-DD');
                            resultAry.push(result);
                        });
                        resultAry = _.sortBy(resultAry, function(result){return result.timeframe.start;});
                        resultAry = self._zeroMissingDays(resultAry, {value:0,count:0}, moment(previousStart).format('YYYY-MM-DD'), moment(previousEnd).format('YYYY-MM-DD'));
                        cb(null, nonBounceAvg, bounceAvg, resultAry);
                    }
                });
            },
            function previousBounceAverageSessionLength(nonBounceAvg, bounceAvg, prevNonBounceAvg, cb) {
                stageAry[0].$match.session_length = {$lte:5000};
                //TODO: re-enable this
                //stageAry[0].$match.page_depth = {$lte:1};
                dao.aggregateWithCustomStages(stageAry, $$.m.SessionEvent, function(err, value) {
                    if(err) {
                        self.log.error('Error finding current month:', err);
                        cb(err);
                    } else {
                        var resultAry = [];
                        _.each(value, function (entry) {
                            var result = {
                                value: entry.averageTime,
                                count: entry.count,
                                timeframe: {
                                    start: entry._id
                                }
                            };
                            result.timeframe.end = moment(entry._id).add(1, 'days').format('YYYY-MM-DD');
                            resultAry.push(result);
                        });
                        resultAry = _.sortBy(resultAry, function(result){return result.timeframe.start;});
                        resultAry = self._zeroMissingDays(resultAry, {value:0, count:0}, moment(previousStart).format('YYYY-MM-DD'), moment(previousEnd).format('YYYY-MM-DD'));
                        cb(null, nonBounceAvg, bounceAvg, prevNonBounceAvg, resultAry);
                    }
                });
            },
            function compileResults(nonBounceAvg, bounceAvg, prevNonBounceAvg, prevBounceAvg, cb) {
                var result = {
                    nonBounceAvg:nonBounceAvg,
                    bounceAvg:bounceAvg,
                    prevNonBounceAvg:prevNonBounceAvg,
                    prevBounceAvg:prevBounceAvg
                };
                var currentMonthAvg = 0;
                var currentMonthCount = 0;
                var prevMonthAvg = 0;
                var prevMonthCount = 0;
                _.each(nonBounceAvg.concat(bounceAvg), function(nb){
                    if(nb.value >0) {
                        nb.valueSeconds = nb.value / 1000;
                        currentMonthAvg+= (nb.value * nb.count);
                        currentMonthCount += nb.count;
                    } else {
                        nb.valueSeconds = 0;
                    }
                });
                result.currentMonthAverage = (currentMonthAvg / currentMonthCount);
                _.each(prevNonBounceAvg.concat(prevBounceAvg), function(nb){
                    if(nb.value >0) {
                        nb.valueSeconds = nb.value / 1000;
                        prevMonthAvg+= (nb.value * nb.count);
                        prevMonthCount += nb.count;
                    } else {
                        nb.valueSeconds = 0;
                    }
                });
                result.previousMonthAverage = (prevMonthAvg / prevMonthCount);
                result.previousMonthBounceCount = 0;
                _.each(prevBounceAvg, function(ba){
                    result.previousMonthBounceCount += ba.count;
                });

                cb(null, result);
            }
        ], function(err, result){
            self.log.debug(accountId, userId, '<< sessionLengthReport');
            fn(err, result);
        });

    },

    trafficSourcesReport: function(accountId, userId, start, end, isAggregate, fn) {
        var self = this;
        self.log = _log;
        self.log.debug(accountId, userId, '>> trafficSourcesReport');

        var stageAry = [];
        var match = {
            $match:{
                accountId:accountId,
                server_time_dt:{
                    $gte:start,
                    $lte:end
                },
                fingerprint:{$ne:0}
            }
        };
        if(isAggregate === true) {
            delete match.$match.accountId;
        }
        stageAry.push(match);

        var group = {
            $group:{
                _id:'$referrer.domain',
                result:{$sum:1}
            }
        };
        stageAry.push(group);

        dao.aggregateWithCustomStages(stageAry, $$.m.SessionEvent, function(err, value) {
            if(err) {
                self.log.error('Error finding current month:', err);
                fn(err);
            } else {
                _.each(value, function(result){
                    result['referrer.domain'] = result._id;
                });
                self.log.debug(accountId, userId, '<< trafficSourcesReport');
                fn(null, value);
            }
        });
    },

    newVsReturningReport: function(accountId, userId, start, end, isAggregate, fn) {
        var self = this;
        self.log = _log;
        self.log.debug(accountId, userId, '>> newVsReturningReport');

        var stageAry = [];
        var match = {
            $match:{
                accountId:accountId,
                server_time_dt:{
                    $gte:start,
                    $lte:end
                },
                fingerprint:{$ne:0},
                permanent_tracker: {$ne:null},
                new_visitor: {$ne:null}
            }
        };
        if(isAggregate === true) {
            delete match.$match.accountId;
        }
        stageAry.push(match);

        var group1 = {
            $group:{
                _id:{
                    permanent_tracker: '$permanent_tracker',
                    new_visitor: '$new_visitor'
                },
                count:{$sum:1}
            }
        };
        stageAry.push(group1);

        var group2 = {
            $group:{
                _id:'$_id.new_visitor',
                count:{$sum:1}
            }
        };
        stageAry.push(group2);
        dao.aggregateWithCustomStages(stageAry, $$.m.SessionEvent, function(err, value) {
            if(err) {
                self.log.error('Error finding current month:', err);
                fn(err);
            } else {
                _.each(value, function(result){
                    if(result._id === false) {
                        result._id = 'returning';
                    } else {
                        result._id = 'new';
                    }
                });
                self.log.debug(accountId, userId, '<< newVsReturningReport');
                fn(null, value);
            }
        });
    },

    pageAnalyticsReport: function(accountId, userId, start, end, isAggregate, fn) {
        /*
         var params2 = {
         event_collection: 'page_data',
         analyses: {
         "pageviews": {
         "analysis_type": "count"
         },
         "uniquePageviews": {
         "analysis_type": "count_unique",
         "target_property": "session_id"
         },
         "timeOnPage": {
         "analysis_type": "sum",
         "target_property": "timeOnPage"
         },
         "avgTimeOnPage": {
         "analysis_type": "average",
         "target_property": "timeOnPage"
         },
         "entrances": {
         "analysis_type": "count",
         "target_property": "entrance"
         },
         "exits": {
         "analysis_type": "count",
         "target_property": "exit"
         }
         },
         timeframe: {
         "start": date.startDate,
         "end": date.endDate
         },
         group_by: 'url.path',
         filters: filters
         };
         */
        var self = this;
        self.log = _log;
        self.log.debug(accountId, userId, '>> pageAnalyticsReport');

        var stageAry = [];
        if(isAggregate === true) {
            var match = {
                $match:{
                    server_time_dt:{
                        $gte:start,
                        $lte:end
                    }
                }
            };
            stageAry.push(match);

            var group1 = {
                $group:{
                    _id: {
                        path: '$accountId',
                        sessionId: '$session_id'
                    },
                    pageviews:{$sum:1},
                    timeOnPage:{$sum:'$timeOnPage'},
                    avgTimeOnPage:{$avg:'$timeOnPage'}
                }
            };
            stageAry.push(group1);

            var group2 = {
                $group: {
                    _id: '$_id.path',
                    uniquePageviews: {$sum:1},
                    pageviews: {$sum:'$pageviews'},
                    timeOnPage: {$sum:'$timeOnPage'},
                    avgTimeOnPage:{$avg:'$avgTimeOnPage'}
                }
            };
            stageAry.push(group2);
        } else {
            var match = {
                $match:{
                    accountId:accountId,
                    server_time_dt:{
                        $gte:start,
                        $lte:end
                    }
                }
            };
            stageAry.push(match);

            var group1 = {
                $group:{
                    _id: {
                        path: '$url.path',
                        sessionId: '$session_id'
                    },
                    pageviews:{$sum:1},
                    timeOnPage:{$sum:'$timeOnPage'},
                    avgTimeOnPage:{$avg:'$timeOnPage'}
                }
            };
            stageAry.push(group1);

            var group2 = {
                $group: {
                    _id: '$_id.path',
                    uniquePageviews: {$sum:1},
                    pageviews: {$sum:'$pageviews'},
                    timeOnPage: {$sum:'$timeOnPage'},
                    avgTimeOnPage:{$avg:'$avgTimeOnPage'}
                }
            };
            stageAry.push(group2);
        }


        dao.aggregateWithCustomStages(stageAry, $$.m.PageEvent, function(err, value) {
            if(err) {
                self.log.error('Error finding current month:', err);
                fn(err);
            } else {
                _.each(value, function(result){
                    result['url.path'] = result._id;
                });
                if(isAggregate === true) {
                    accountDao.findMany({_id:{$exists:true}}, $$.m.Account, function(err, accounts){
                        if(err) {
                            self.log.error('Error finding accounts:', err);
                            return fn(null, value);
                        } else {
                            var map = {};
                            _.each(accounts, function(account){
                                map[account.id()] = account.get('subdomain');
                            });
                            _.each(value, function(result){
                                result['id'] = result['url.path'];
                                result['url.path'] = map[result['url.path']];
                            });
                            self.log.debug(accountId, userId, '<< trafficSourcesReport');
                            fn(null, value);
                        }

                    });
                } else {
                    self.log.debug(accountId, userId, '<< trafficSourcesReport');
                    fn(null, value);
                }

            }
        });
    },

    _zeroMissingDays: function(resultAry, blankResult, firstDate, lastDate) {
        var currentDate = firstDate;
        var zeroedResultAry = [];
        _.each(resultAry, function(result){
            while(moment(currentDate).isBefore(result.timeframe.start)) {

                zeroedResultAry.push({
                    timeframe:{
                        start : currentDate,
                        end : moment(currentDate).add(1, 'days').format('YYYY-MM-DD')
                    }
                });
                zeroedResultAry.push(_.extend(zeroedResultAry.pop(), blankResult));
                currentDate = moment(currentDate).add(1, 'days').format('YYYY-MM-DD');
            }
            zeroedResultAry.push(result);
            currentDate = moment(result.timeframe.start).add(1, 'days').format('YYYY-MM-DD');
        });
        while(moment(currentDate).isBefore(moment(lastDate)) || moment(currentDate).isSame(moment(lastDate), 'day')) {
            zeroedResultAry.push({
                timeframe:{
                    start : currentDate,
                    end : moment(currentDate).add(1, 'days').format('YYYY-MM-DD')
                }
            });
            zeroedResultAry.push(_.extend(zeroedResultAry.pop(), blankResult));
            currentDate = moment(currentDate).add(1, 'days').format('YYYY-MM-DD');
        }

        return zeroedResultAry;
    },

    getUserAgentReport: function(accountId, userId, start, end, isAggregate, fn) {
        var self = this;
        self.log = _log;
        self.log.debug(accountId, userId, '>> getUserAgentReport');

        var stageAry = [];
        var match = {
            $match:{
                accountId:accountId,
                server_time_dt:{
                    $gte:start,
                    $lte:end
                }
            }
        };
        if(isAggregate === true) {
            delete match.$match.accountId;
        }
        stageAry.push(match);

        var group1 = {
            $group: {
                _id:{
                    browserName:'$user_agent.browser.name',
                    //browserVersion:'$user_agent.browser.version',
                    osName:'$user_agent.os.name'
                    //osVersion:'$user_agent.os.version'
                },
                count: {$sum:1}
            }
        };
        stageAry.push(group1);

        dao.aggregateWithCustomStages(stageAry, $$.m.SessionEvent, function(err, value) {
            var sortedResults = _.sortBy(value, function(result){return result.count;});
            self.log.debug(accountId, userId, '<< getUserAgentReport');
            fn(err, sortedResults);
        });
    },

    getDailyActiveUsers: function(accountId, userId, start, end, fn) {
        var self = this;
        self.log = _log;
        self.log.debug(accountId, userId, '>> getDailyActiveUsers');

        var stageAry = [];
        var match = {
            $match:{
                activityType:'LOGIN',
                start:{
                    $gte:start,
                    $lte:end
                }
            }
        };
        stageAry.push(match);
        var group1 = {
            $group: {
                _id:{
                    userId:'$userId',
                    yearMonthDay: { $dateToString: { format: "%Y-%m-%d", date: "$start" }}
                },
                count: {$sum:1}
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

        dao.aggregateWithCustomStages(stageAry, $$.m.UserActivity, function(err, value){
            if(err) {
                self.log.error(accountId, userId, 'Error getting DAU:', err);
                return fn(err);
            } else {
                var resultAry = [];
                _.each(value, function (entry) {
                    var result = {
                        total: entry.total,
                        timeframe: {
                            start: entry._id
                        }
                    };
                    result.timeframe.end = moment(entry._id).add(1, 'days').format('YYYY-MM-DD');
                    resultAry.push(result);
                });
                resultAry = _.sortBy(resultAry, function(result){return result.timeframe.start;});
                resultAry = self._zeroMissingDays(resultAry, {total:0}, moment(start).format('YYYY-MM-DD'), moment(end).format('YYYY-MM-DD'));
                self.log.debug(accountId, userId, '<< getDailyActiveUsers');
                return fn(null, resultAry);
            }

        });
    },

    getRevenueByMonth: function(accountId, userId, start, end, previousStart, previousEnd, isAggregate, fn) {
        var self = this;
        self.log = _log;
        self.log.debug(accountId, userId, '>> getRevenueByMonth');

        var stageAry = [];
        var match = {
            $match:{
                account_id:accountId,
                created_at:{
                    $gte:start,
                    $lte:end
                }
            }
        };
        if(isAggregate === true) {
            delete match.$match.account_id;
        }
        stageAry.push(match);

        var group1 = {
            $group: {
                _id:{ $dateToString: { format: "%Y-%m-%d", date: "$created_at" }},
                count: {$sum:1},
                totals: {$push:'$total'}
            }
        };
        stageAry.push(group1);

        async.waterfall([
            function(cb){
                orderDao.aggregateWithCustomStages(stageAry, $$.m.Order, function(err, value){
                    var resultAry = [];
                    _.each(value, function (entry) {
                        var total = 0;
                        _.each(entry.totals, function(_total){
                            if(!isNaN(parseFloat(_total)) && isFinite(_total)) {
                                total+= parseFloat(_total);
                            }
                        });
                        var result = {
                            total: total,
                            count: entry.count,
                            timeframe: {
                                start: entry._id
                            }
                        };
                        result.timeframe.end = moment(entry._id).add(1, 'days').format('YYYY-MM-DD');
                        resultAry.push(result);
                    });
                    resultAry = _.sortBy(resultAry, function(result){return result.timeframe.start;});
                    resultAry = self._zeroMissingDays(resultAry, {total:0, count:0}, moment(start).format('YYYY-MM-DD'), moment(end).format('YYYY-MM-DD'));
                    cb(err, resultAry);
                });
            },
            function(currentMonth, cb) {
                stageAry[0].$match.created_at.$gte = previousStart;
                stageAry[0].$match.created_at.$lte = previousEnd;
                orderDao.aggregateWithCustomStages(stageAry, $$.m.Order, function(err, value){
                    var resultAry = [];
                    _.each(value, function (entry) {
                        var total = 0;
                        _.each(entry.totals, function(_total){
                            if(!isNaN(parseFloat(_total)) && isFinite(_total)) {
                                total+= parseFloat(_total);
                            }
                        });
                        var result = {
                            total: total,
                            count: entry.count,
                            timeframe: {
                                start: entry._id
                            }
                        };
                        result.timeframe.end = moment(entry._id).add(1, 'days').format('YYYY-MM-DD');
                        resultAry.push(result);
                    });
                    resultAry = _.sortBy(resultAry, function(result){return result.timeframe.start;});
                    resultAry = self._zeroMissingDays(resultAry, {total:0, count:0}, moment(start).format('YYYY-MM-DD'), moment(end).format('YYYY-MM-DD'));
                    var results = {
                        currentMonth:currentMonth,
                        prevMonth:resultAry
                    };
                    cb(err, results);
                });
            }
        ], function(err, results){
            if(err) {
                self.log.error(accountId, userId, 'Error in getRevenueByMonth:', err);
                return fn(err);
            } else {
                self.log.debug(accountId, userId, '<< getRevenueByMonth');
                fn(err, results);
            }

        });
    }
};