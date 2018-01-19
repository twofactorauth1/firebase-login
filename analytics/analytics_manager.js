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
var readOnlyDao = require('./dao/analytics.dao.js');
readOnlyDao.setReadOnly();
//var Analytics = require('analytics-node');
//var analytics = new Analytics(segmentConfig.SEGMENT_WRITE_KEY);
var contactDao = require('../dao/contact.dao');
var contactActivityManager = require('../contactactivities/contactactivity_manager');
var async = require('async');
var accountDao = require('../dao/account.dao');
var userDao = require('../dao/user.dao');
var orderDao = require('../orders/dao/order.dao');
var emailMessageManager = require('../emailmessages/emailMessageManager');
var accountManager = require('../accounts/account.manager');
var geoiputil = require('../utils/geoiputil');
var orgManager = require('../organizations/organization_manager');

require('./model/session_event');
require('./model/page_event');
require('./model/ping_event');

const not404s= [ "/404", "/apple-touch-icon.png", "/apple-touch-icon-120x120.png", "/favicon.ico", "/apple-touch-icon-120x120-precomposed.png", "/apple-touch-icon-precomposed.png", "/favicon-32x32.png", "/favicon-16x16.png", "/safari-pinned-tab.svg" ];
var fs = require('fs');
var filteredIPs = [];
var filteredIPRaw = fs.readFileSync('./analytics/filtered_ips.txt', 'utf8');

_.each(filteredIPRaw.split('\n'), function(line){
    if(line.indexOf('#') < 0 && line.indexOf('.') > 1) {
        filteredIPs.push(line.trim());
    }
});
_log.info('filtering [' + filteredIPs.length + '] IPs');
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

    storeSessionEvent: function(sessionEvent, fn) {
        var self = this;
        _log.trace('>> storeSessionEvent ', sessionEvent.get('fingerprint'), sessionEvent.get('session_id'));
        //see if we can discard
        if(filteredIPs && _.contains(filteredIPs, sessionEvent.get('ip_address'))) {
            _log.info('skipping analytics event from [' + sessionEvent.get('ip_address') + ']');
            fn();
        } else {
            //check if we have one already....
            accountDao.getAccountByID(sessionEvent.get('accountId'), function(err, account){
                var orgId = 0;
                if(account && account.get('orgId')) {
                    orgId = account.get('orgId');
                    sessionEvent.set('subdomain', account.get('subdomain'));
                }
                sessionEvent.set('orgId', orgId);
                if(!sessionEvent.get('subdomain')) {
                    sessionEvent.set('subdomain', account.get('subdomain'));
                }

                orgManager.getOrgById(0,0,orgId, function(err, organization){
                    if(organization) {
                        sessionEvent.set('orgDomain', organization.get('orgDomain'));
                    }
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
                                    //_log.trace('>> found contacts with matching fingerprint ', list);
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
                                        _log.trace('>> createActivity2 ', contactActivity);
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
                                        geoiputil.getMaxMindGeoForIP(sessionEvent.get('ip_address'), function(err, ip_geo_info) {
                                            if (ip_geo_info) {
                                                var replacementObject = {
                                                    province: ip_geo_info.region,
                                                    city: ip_geo_info.city,
                                                    postal_code: ip_geo_info.postal,
                                                    continent: ip_geo_info.continent,
                                                    country: ip_geo_info.countryName
                                                };
                                                sessionEvent.set('maxmind', replacementObject);
                                            } else {
                                                var replacementObject = {
                                                    province: '',
                                                    city: '',
                                                    postal_code: '',
                                                    continent: '',
                                                    country: ''
                                                };
                                                sessionEvent.set('maxmind', replacementObject);
                                                _log.warn('Could not find geo info for ' + sessionEvent.get('ip_address'));
                                            }
                                            dao.saveOrUpdate(sessionEvent, fn);
                                        });

                                    });
                                }
                            });
                        } else {
                            //already have one.  Store a ping instead.
                            var pingEvent = new $$.m.PingEvent({
                                session_id: sessionEvent.get('session_id'),
                                server_time: sessionEvent.get('server_time'),
                                accountId:sessionEvent.get('accountId'),
                                orgId:sessionEvent.get('orgId')
                            });
                            dao.saveOrUpdate(pingEvent, fn);
                        }
                    });
                });

            });
        }




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
        if(filteredIPs && _.contains(filteredIPs, pageEvent.get('ip_address'))) {
            _log.info('skipping analytics event from [' + pageEvent.get('ip_address') + ']');
            fn();
        } else {
            accountDao.getAccountByID(pageEvent.get('accountId'), function(err, account) {
                var orgId = 0;
                if (account && account.get('orgId')) {
                    orgId = account.get('orgId');
                }
                pageEvent.set('orgId', orgId);
                dao.saveOrUpdate(pageEvent, fn);
            });
        }


    },

    storePingEvent: function(pingEvent, fn) {
        //_log.debug('>> storePingEvent');
        if(filteredIPs && _.contains(filteredIPs, pingEvent.get('ip_address'))) {
            _log.info('skipping analytics event from [' + pingEvent.get('ip_address') + ']');
            fn();
        } else {
            accountDao.getAccountByID(pingEvent.get('accountId'), function(err, account) {
                var orgId = 0;
                if (account && account.get('orgId')) {
                    orgId = account.get('orgId');
                }
                pingEvent.set('orgId', orgId);
                dao.saveOrUpdate(pingEvent, fn);
            });
        }

    },

    getLiveVisitors: function(accountId, userId, lookBackInMinutes, isAggregate, orgId, fn) {
        var self = this;
        self.log = _log;
        self.log.trace(accountId, userId, '>> getLiveVistiors');


        if(!lookBackInMinutes || lookBackInMinutes === 0) {
            lookBackInMinutes = 30;
        }
        var targetDate = moment.utc().subtract(lookBackInMinutes, 'minutes');
        var rightnow = moment.utc().subtract(1, 'minutes');
        //self.log.debug('targetDate:', targetDate.toDate());
        var stageAry = [];
        var match = {
            $match:{
                accountId:accountId,
                server_time_dt:{
                    $gte:targetDate.toDate()
                }
            }
        };
        if(isAggregate === true) {
            delete match.$match.accountId;
        }
        if(orgId !== null) {
            match.$match.orgId = orgId;
        }
        stageAry.push(match);
        var filterStages = [];
        self._buildLookupAndFilterStages(accountId, userId, isAggregate, function(err, extraStages){
            if(err) {
                self.log.error(accountId, userId, 'Error building lookup and filter:', err);
                return fn(err);
            } else {
                if(extraStages && extraStages.length > 0) {
                    stageAry = stageAry.concat(extraStages);
                    filterStages = extraStages;
                }
                //see: http://stackoverflow.com/questions/26814427/group-result-by-15-minutes-time-interval-in-mongodb
                var group1 = {
                    $group:{
                        _id:{
                            session_id:'$session_id',
                            secondsAgo:{$add:[{
                                "$subtract": [
                                    { "$subtract": [ "$server_time_dt", new Date("1970-01-01") ] },
                                    { "$mod": [
                                        { "$subtract": [ "$server_time_dt", new Date("1970-01-01") ] },
                                            1000 * 60]
                                    }
                                ]},
                                new Date(0)
                            ]}
                        },
                        count:{$sum:1}
                    }
                };
                stageAry.push(group1);

                var lookup = {"$lookup":{
                    from: "session_events",
                        localField: "_id.session_id",
                        foreignField: "session_id",
                        as: "session_event"
                }};
                stageAry.push(lookup);
                var project2 = {$project:{_id:1, count:1, fingerprint: '$session_event.fingerprint'}};
                stageAry.push(project2);

                var group2 = {
                    $group:{
                        _id: {secondsAgo:'$_id.secondsAgo', fingerprint:'$fingerprint'},
                        count:{$sum:1}
                    }
                };
                stageAry.push(group2);
                var group3 = {
                    $group:{_id:'$_id.secondsAgo', count:{$sum:'$count'}}
                };

                stageAry.push(group3);
                var sort = {
                    $sort:{'_id':-1}
                };
                stageAry.push(sort);
                //self.log.debug('stageAry:', JSON.stringify(stageAry));
                dao.aggregateWithCustomStages(stageAry, $$.m.PingEvent, function(err, value) {
                    if(err) {
                        self.log.error('Error getting analytics:', err);
                        fn(err);
                    } else {
                        var results = [];
                        if(value) {
                            results = self._zeroMissingMinutes(value.reverse(), {count:0}, targetDate.toDate(), rightnow.toDate());
                        }
                        self.log.trace(accountId, userId, '<< getLiveVistiors');


                        // Adding location data
                        var stageAry = [];
                        var match = {
                            $match:{
                                accountId:accountId,
                                server_time_dt:{
                                    $gte:targetDate.toDate()
                                },
                                fingerprint:{$ne:null},
                                "maxmind.country":{$ne:null}
                            }
                        };
                        if(isAggregate === true) {
                            delete match.$match.accountId;
                        }
                        if(orgId !== null) {
                            match.$match.orgId = orgId;
                        }
                        stageAry.push(match);

                        stageAry.push({
                            $group:{
                                _id:'$maxmind.country',
                                provinces:{$push:'$maxmind.province'},
                                result:{$sum:1}
                            }
                        });
                        stageAry.push({ $unwind:'$provinces'})
                        stageAry.push({
                            $group:{
                                _id:'$provinces',
                                country:{$first:'$_id'},
                                country_count:{$first:'$result'},
                                province_count:{$sum:1}
                            }
                        })
                        stageAry.push({
                            $group:{
                                _id:'$country',
                                count:{$first:'$country_count'},
                                provinces:{
                                     $push:{
                                         name:'$_id',
                                         count:'$province_count'
                                     }
                                },
                            }
                        })

                        self._addAccountFilterByID(accountId, userId, isAggregate, match, function(err, newMatch){
                            dao.aggregateWithCustomStages(stageAry, $$.m.SessionEvent, function(err, value) {
                               /* _.each(value, function(result){
                                    result['ip_geo_info.province'] = result._id;
                                });*/
                                self.log.trace(accountId, userId, '<< getLiveVisitors');
                                //fn(err, value);
                                if(results.length > 0){
                                    results[0].locations = value;
                                }
                                fn(null, results);
                            });
                        });


                    }
                });
            }
        });

    },

    getLiveVisitorDetails: function(accountId, userId, lookBackInMinutes, isAggregate, orgId, fn) {
        var self = this;
        self.log = _log;
        self.log.trace(accountId, userId, '>> getLiveVisitorDetails');


        var targetDate = moment.utc().subtract(lookBackInMinutes, 'minutes');
        var rightnow = moment.utc().subtract(1, 'minutes');
        //self.log.debug('targetDate:', targetDate.toDate());
        var stageAry = [];
        var match = {
            $match:{
                accountId:accountId,
                server_time_dt:{
                    $gte:targetDate.toDate()
                }
            }
        };
        if(isAggregate === true) {
            delete match.$match.accountId;
        }
        if(orgId !== null) {
            match.$match.orgId = orgId;
        }


        stageAry.push(match);
        self._addAccountFilterByID(accountId, userId, isAggregate, match, function(err, newMatch){
            var lookup = {
                $lookup: {
                    from: "page_events",
                    localField: "session_id",
                    foreignField: "session_id",
                    as: "page_events"
                }
            };
            stageAry.push(lookup);
            var lookup2 = {
                $lookup:{
                    from: 'ping_events',
                    localField: 'session_id',
                    foreignField: 'session_id',
                    as: 'ping_events'
                }
            };
            stageAry.push(lookup2);
            var group = {
                $group:{
                    _id: '$fingerprint',
                    sessions:{$push:'$$ROOT'}
                }
            };
            stageAry.push(group);

            dao.aggregateWithCustomStages(stageAry, $$.m.SessionEvent, function(err, results) {
                if(err) {
                    self.log.error('Error getting analytics:', err);
                    fn(err);
                } else {
                    self.log.trace('results:', JSON.stringify(results));
                    var _resultDetails = [];
                    async.forEachLimit(results, 1, function(result, resultCallback){
                        var _result = {  _id: result._id,  session_id:[],
                            ip_address:null,  maxmind:null,
                            user_agent:null, timestamp:null,
                            server_time:null,  subdomain:null,
                            fingerprint:null,  pageEvents:[], pingEvents:[]
                        };
                        async.forEachLimit(result.sessions, 1, function(session, sessionCallback){
                            if(!_.contains(_result.session_id, session.session_id)){
                                _result.session_id.push(session.session_id);
                            }
                            if(!_result.ip_address) {
                                _result.ip_address = session.ip_address;
                            }
                            if(!_result.fingerprint) {
                                _result.fingerprint = session.fingerprint;
                            }
                            if(!_result.subdomain) {
                                _result.subdomain = session.subdomain;
                            }
                            if(!_result.maxmind) {
                                _result.maxmind = session.maxmind;
                            }
                            if(!_result.user_agent) {
                                _result.user_agent = session.user_agent;
                            }
                            if(!_result.timestamp) {
                                _result.timestamp = session.timestamp;
                            }
                            if(!_result.server_time) {
                                _result.server_time = session.server_time;
                            }
                            if(session.page_events) {
                                _result.pageEvents = _result.pageEvents.concat(session.page_events);
                            }
                            if(session.ping_events) {
                                _result.pingEvents = _result.pingEvents.concat(session.ping_events);
                            }

                            dao.findMany({sessionId: session.session_id},  $$.m.ContactActivity, function(err, list) {
                                if (err) {
                                    self.log.error('Error finding activities: ' + err);
                                    return sessionCallback();
                                } else {
                                    if(list) {
                                        _.each(list, function(activity){
                                            _result.pageEvents.push({
                                                activityType:activity.get("activityType"),
                                                extraFields:activity.get("extraFields"),
                                                start:activity.get("start"),
                                                contactId: activity.get("contactId")
                                            });
                                        });
                                    }
                                    return sessionCallback();
                                }
                            });

                        }, function(err){
                            _result.session_id = _result.session_id.join(',');
                            var _pageEvents = [];
                            _.each(_result.pageEvents, function(pageEvent){
                                var obj = {};
                                if(pageEvent.server_time_dt) {
                                    obj.pageTime = pageEvent.server_time_dt;
                                }
                                if(pageEvent.url && pageEvent.url.source) {
                                    obj.pageRequested = pageEvent.url.source;
                                }
                                if(pageEvent.activityType){
                                    obj.activityType=pageEvent.activityType;
                                    obj.extraFields=pageEvent.extraFields;
                                    obj.pageTime = pageEvent.start;
                                    obj.contactId = pageEvent.contactId;
                                } else {
                                    obj.activityType="PAGE_VIEW";
                                }
                                _pageEvents.push(obj);
                            });
                            if(!isAggregate) {
                                _result.pageEvents = _.filter(_result.pageEvents, function(event){
                                    return event.accountId == accountId
                                })
                                _result.pingEvents = _.filter(_result.pingEvents, function(event){
                                    return event.accountId == accountId
                                })
                            }
                            
                            _result.pageEvents = _.sortBy(_pageEvents, function(p) {
                                return p.pageTime;
                            });
                            _result.pingEvents = _.sortBy(_result.pingEvents, function(p){
                                return -p.server_time;
                            });
                            if(_result.pingEvents.length > 1) {
                                _result.difference = Math.round(_result.pingEvents[0].server_time - _result.pingEvents[_result.pingEvents.length -1].server_time);
                            } else {
                                _result.difference = 0;
                            }
                            delete _result.pingEvents;
                            
                            _resultDetails.push(_result);
                            resultCallback();
                        });
                    }, function(err){
                        _resultDetails = _.sortBy(_resultDetails, function(result){return -result.server_time;});
                        self.log.trace(accountId, userId, '<< getLiveVisitorDetails');
                        fn(err, _resultDetails);
                    });
                }
            });
        });

    },

    _getLiveVisitorDetails: function(accountId, userId, lookBackInMinutes, isAggregate, orgId, fn) {
        var self = this;
        self.log = _log;
        self.log.trace(accountId, userId, '>> getLiveVisitorDetails');


        var targetDate = moment.utc().subtract(lookBackInMinutes, 'minutes');
        var rightnow = moment.utc().subtract(1, 'minutes');
        //self.log.debug('targetDate:', targetDate.toDate());
        var stageAry = [];
        var match = {
            $match:{
                accountId:accountId,
                server_time_dt:{
                    $gte:targetDate.toDate()
                }
            }
        };
        if(isAggregate === true) {
            delete match.$match.accountId;
        }
        if(orgId !== null) {
            match.$match.orgId = orgId;
        }


        stageAry.push(match);
        self._addAccountFilterByID(accountId, userId, isAggregate, match, function(err, newMatch){
            dao.aggregateWithCustomStages(stageAry, $$.m.SessionEvent, function(err, results) {
                if(err) {
                    self.log.error('Error getting analytics:', err);
                    fn(err);
                } else {
                    var _resultDetails = [];

                    async.eachLimit(results, 10, function(sessionEvent, cb){
                        var query = {session_id:sessionEvent.session_id};
                        var skip = 0;
                        var limit = 1;
                        var sort = {server_time:-1};
                        var fields = null;
                        var type = $$.m.PageEvent;
                        dao.findAllWithFieldsSortAndLimit(query, skip, null, sort, fields, type, function(err, pageEvents){
                            if(err) {
                                self.log.error('Error getting page event:', err);
                                cb();
                            } else if(pageEvents) {
                                var _pageEvents = [];
                                _.each(pageEvents, function(pEvent){
                                    _pageEvents.push({
                                        pageTime : pEvent.get('server_time_dt'),
                                        pageRequested : pEvent.get('url').source
                                    })
                                });
                                _resultDetails.push({
                                    "_id": sessionEvent._id,
                                    "session_id": sessionEvent.session_id,
                                    "ip_address": sessionEvent.ip_address,
                                    "maxmind": sessionEvent.maxmind,
                                    "user_agent": sessionEvent.user_agent,
                                    "timestamp": sessionEvent.server_time_dt,
                                    "server_time": sessionEvent.server_time,
                                    pageEvents : _pageEvents
                                });
                                cb();
                            } else {
                                _resultDetails.push({
                                    "_id": sessionEvent._id,
                                    "session_id": sessionEvent.session_id,
                                    "ip_address": sessionEvent.ip_address,
                                    "maxmind": sessionEvent.maxmind,
                                    "user_agent": sessionEvent.user_agent,
                                    "timestamp": sessionEvent.server_time_dt,
                                    "server_time": sessionEvent.server_time
                                });
                                cb();
                            }
                        });
                    }, function(err){
                        self.log.trace(accountId, userId, '<< getLiveVisitorDetails');
                        _resultDetails = _.sortBy(_resultDetails, function(result){return -result.server_time;});
                        fn(err, _resultDetails);
                    });
                }
            });
        });


    },

    getVisitorCount: function(accountId, userId, startDate, endDate, previousStart, previousEnd, isAggregate, fn) {
        var self = this;
        self.log = _log;
        self.log.debug(accountId, userId, '>> getVisitorCount');

        var stageAry = [];
        var match = {
            $match:{
                accountId:accountId,
                server_time_dt:{
                    $gte:startDate,
                    $lte:endDate
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
                    permanent_tracker:'$permanent_tracker'
                },
                count: {$sum:1}
            }
        };
        stageAry.push(group1);

        dao.aggregateWithCustomStages(stageAry, $$.m.SessionEvent, function(err, value) {
            if(err) {
                self.log.error(accountId, userId, 'Error getting visitor count: ', err);
                fn(err);
            } else {
                var currentCount = 0;
                if(value) {
                    currentCount = value.length;
                }
                var results = {currentCount:currentCount};
                stageAry[0].$match.server_time_dt = {
                    $gte:previousStart,
                    $lte:previousEnd
                };
                dao.aggregateWithCustomStages(stageAry, $$.m.SessionEvent, function(err, value) {
                    if(err) {
                        self.log.error(accountId, userId, 'Error getting visitor count: ', err);
                        fn(err);
                    } else {
                        var previousCount = 0;
                        if(value) {
                            previousCount = value.length;
                        }
                        results.previousCount = previousCount;
                        self.log.debug(accountId, userId, '<< getVisitorCount');
                        fn(null, results);
                    }
                });

            }
        });
    },

    getVisitCount: function(accountId, userId, startDate, endDate, previousStart, previousEnd, isAggregate, fn) {
        var self = this;
        self.log = _log;
        self.log.debug(accountId, userId, '>> getVisitCount');

        var currentQuery = {
            accountId:accountId,
            server_time_dt:{
                $gte:startDate,
                $lte:endDate
            }
        };
        var previousQuery = {
            accountId:accountId,
            server_time_dt:{
                $gte:previousStart,
                $lte:previousEnd
            }
        };
        dao.findCount(currentQuery, $$.m.SessionEvent, function(err, count){
            if(err) {
                self.log.error(accountId, userId, 'Error getting visit count: ', err);
                fn(err);
            } else {
                var results = {
                    currentCount: count || 0
                };
                dao.findCount(previousQuery, $$.m.SessionEvent, function(err, count){
                    if(err) {
                        self.log.error(accountId, userId, 'Error getting visit count: ', err);
                        fn(err);
                    } else {
                        var previousCount = 0;
                        if(count) {
                            previousCount = count;
                        }
                        results.previousCount = previousCount;
                        self.log.debug(accountId, userId, '<< getVisitCount');
                        fn(null, results);
                    }
                });
            }
        });

    },

    getPageViewCount: function(accountId, userId, startDate, endDate, previousStart, previousEnd, isAggregate, fn) {
        var self = this;
        self.log = _log;
        self.log.debug(accountId, userId, '>> getPageViewCount');

        var currentQuery = {
            accountId:accountId,
            server_time_dt:{
                $gte:startDate,
                $lte:endDate
            }
        };
        var previousQuery = {
            accountId:accountId,
            server_time_dt:{
                $gte:previousStart,
                $lte:previousEnd
            }
        };
        dao.findCount(currentQuery, $$.m.PageEvent, function(err, count){
            if(err) {
                self.log.error(accountId, userId, 'Error getting page view count: ', err);
                fn(err);
            } else {
                var results = {
                    currentCount: count || 0
                };
                dao.findCount(previousQuery, $$.m.PageEvent, function(err, count){
                    if(err) {
                        self.log.error(accountId, userId, 'Error getting page view count: ', err);
                        fn(err);
                    } else {
                        var previousCount = 0;
                        if(count) {
                            previousCount = count;
                        }
                        results.previousCount = previousCount;
                        self.log.debug(accountId, userId, '<< getPageViewCount');
                        fn(null, results);
                    }
                });
            }
        });
    },

    getSearchReferrals: function(accountId, userId, startDate, endDate, previousStart, previousEnd, isAggregate, fn) {
        var self = this;
        self.log = _log;
        self.log.debug(accountId, userId, '>> getSearchReferrals');

        var currentQuery = {
            accountId:accountId,
            server_time_dt:{
                $gte:startDate,
                $lte:endDate
            },
            'referrer.domain': {$in:['www.google.com']}
        };
        var previousQuery = {
            accountId:accountId,
            server_time_dt:{
                $gte:previousStart,
                $lte:previousEnd
            },
            'referrer.domain': {$in:['www.google.com']}
        };
        dao.findCount(currentQuery, $$.m.SessionEvent, function(err, count){
            if(err) {
                self.log.error(accountId, userId, 'Error getting search referral count: ', err);
                fn(err);
            } else {
                var results = {
                    currentCount: count || 0
                };
                dao.findCount(previousQuery, $$.m.SessionEvent, function(err, count){
                    if(err) {
                        self.log.error(accountId, userId, 'Error getting search referral count: ', err);
                        fn(err);
                    } else {
                        var previousCount = 0;
                        if(count) {
                            previousCount = count;
                        }
                        results.previousCount = previousCount;
                        self.log.debug(accountId, userId, '<< getSearchReferrals');
                        fn(null, results);
                    }
                });
            }
        });
    },

    getBounceRate: function(accountId, userId, startDate, endDate, previousStart, previousEnd, isAggregate, fn) {
        var self = this;
        self.log = _log;
        self.log.debug(accountId, userId, '>> getBounceRate');

        var currentQuery = {
            accountId:accountId,
            server_time_dt:{
                $gte:startDate,
                $lte:endDate
            },
            fingerprint:{$ne:0},
            session_length: {$lte:360000}//exclude tabs left-open
        };

        var previousQuery = {
            accountId:accountId,
            server_time_dt:{
                $gte:previousStart,
                $lte:previousEnd
            },
            fingerprint:{$ne:0},
            session_length: {$lte:360000}//exclude tabs left-open
        };

        dao.findMany(currentQuery, $$.m.SessionEvent, function(err, sessionAry){
            if(err) {
                self.log.error(accountId, userId, 'Error finding sessions:', err);
                fn(err);
            } else {
                var currentBounceRate = self._calculateBounceRate(sessionAry);
                dao.findMany(previousQuery, $$.m.SessionEvent, function(err, sessionAry){
                    if(err) {
                        self.log.error(accountId, userId, 'Error finding sessions:', err);
                        fn(err);
                    } else {
                        var previousBounceRate = self._calculateBounceRate(sessionAry);
                        var results = {
                            currentBounceRate:currentBounceRate.toFixed(2)*100,
                            previousBounceRate:previousBounceRate.toFixed(2)*100
                        };
                        self.log.debug(accountId, userId, '<< getBounceRate');
                        return fn(null, results);
                    }
                });
            }
        });

    },

    _calculateBounceRate: function(sessionAry) {
        var bounceCount = 0;
        var totalCount = sessionAry.length;

        _.each(sessionAry, function(sessionEvent){
            if(sessionEvent.get('session_length') < 5000) {
                bounceCount++;
            }
        });
        if(totalCount > 0) {
            return bounceCount / totalCount;
        } else {
            return 0;
        }
    },

    getVisitorReports: function(accountId, userId, startDate, endDate, isAggregate, orgId, fn) {
        var self = this;
        self.log = _log;
        self.log.debug(accountId, userId, '>> getVisitorReports');
        var granularity = self._determineGranularity(startDate, endDate);

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
        if(orgId !== null) {
            match.$match.orgId = orgId;
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
        if(granularity === 'hours') {
            group1.$group._id.yearMonthDay.$dateToString.format = '%Y-%m-%d %H:00';
        }
        stageAry.push(group1);

        var group2 = {$group:{_id:"$_id.yearMonthDay", visits:{$sum:1} }};
        stageAry.push(group2);
        self._addAccountFilterByID(accountId, userId, isAggregate, match, function(err, match){
            if(err) {
                self.log.error(accountId, userId, 'Error adding filter:', err);
                fn(err);
            } else {
                //match is applied via pass-by-reference
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
                                    if(granularity === 'hours') {
                                        result.timeframe.end = moment(entry._id).add(1, 'hours').format('YYYY-MM-DD HH:mm');
                                    } else {
                                        result.timeframe.end = moment(entry._id).add(1, 'days').format('YYYY-MM-DD');
                                    }
                                    resultAry.push(result);
                                });
                                resultAry = _.sortBy(resultAry, function(result){return result.timeframe.start;});
                                if(granularity === 'hours') {
                                    resultAry = self._zeroMissingHours(resultAry, {value:0}, moment(startDate).format('YYYY-MM-DD HH:mm'), moment(endDate).format('YYYY-MM-DD HH:mm'));
                                } else {
                                    resultAry = self._zeroMissingDays(resultAry, {value:0}, moment(startDate).format('YYYY-MM-DD'), moment(endDate).format('YYYY-MM-DD'));
                                }
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
                                    if(granularity === 'hours') {
                                        result.timeframe.end = moment(entry._id).add(1, 'hours').format('YYYY-MM-DD HH:mm');
                                    } else {
                                        result.timeframe.end = moment(entry._id).add(1, 'days').format('YYYY-MM-DD');
                                    }
                                    resultAry.push(result);
                                });
                                resultAry = _.sortBy(resultAry, function(result){return result.timeframe.start;});
                                if(granularity === 'hours') {
                                    resultAry = self._zeroMissingHours(resultAry, {value:0}, moment(startDate).format('YYYY-MM-DD HH:mm'), moment(endDate).format('YYYY-MM-DD HH:mm'));
                                } else {
                                    resultAry = self._zeroMissingDays(resultAry, {value:0}, moment(startDate).format('YYYY-MM-DD'), moment(endDate).format('YYYY-MM-DD'));
                                }
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
            }


        });



    },

    getVisitorLocationsReport: function(accountId, userId, startDate, endDate, isAggregate, orgId, fn) {
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
                fingerprint:{$ne:null},
                "maxmind.country":{$ne:null}
            }
        };
        if(isAggregate === true) {
            delete match.$match.accountId;
        }
        if(orgId !== null) {
            match.$match.orgId = orgId;
        }
        stageAry.push(match);
        stageAry.push({
            $group:{
                _id:'$maxmind.country',
                provinces:{$push:'$maxmind.province'},
                result:{$sum:1}
            }
        });
        stageAry.push({ $unwind:'$provinces'})
        stageAry.push({
            $group:{
                _id:'$provinces',
                country:{$first:'$_id'},
                country_count:{$first:'$result'},
                province_count:{$sum:1}
            }
        })
        stageAry.push({
            $group:{
                _id:'$country',
                count:{$first:'$country_count'},
                provinces:{
                     $push:{
                         name:'$_id',
                         count:'$province_count'
                     }
                },
            }
        })
        self._addAccountFilterByID(accountId, userId, isAggregate, match, function(err, match) {
            if (err) {
                self.log.error(accountId, userId, 'Error adding filter:', err);
                fn(err);
            } else {
                //match is applied via pass-by-reference
                dao.aggregateWithCustomStages(stageAry, $$.m.SessionEvent, function(err, value) {
                    /*_.each(value, function(result){
                        result['ip_geo_info.province'] = result._id;
                    });
                    */
                    self.log.debug(accountId, userId, '<< getVisitorLocationsReport');
                    fn(err, value);
                });
            }
        });

    },

    getVisitorLocationsByCountryReport: function(accountId, userId, startDate, endDate, isAggregate, orgId, fn) {
        var self = this;
        self.log = _log;
        self.log.debug(accountId, userId, '>> getVisitorLocationsByCountryReport');

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
        if(isAggregate === true) {
            delete match.$match.accountId;
        }
        if(orgId !== null) {
            match.$match.orgId = orgId;
        }
        stageAry.push(match);

        var group1 = {
            $group: {
                _id: '$maxmind.country',
                result: {$sum:1}
            }
        };
        stageAry.push(group1);
        self._addAccountFilterByID(accountId, userId, isAggregate, match, function(err, match) {
            if (err) {
                self.log.error(accountId, userId, 'Error adding filter:', err);
                fn(err);
            } else {
                dao.aggregateWithCustomStages(stageAry, $$.m.SessionEvent, function(err, value) {
                    _.each(value, function(result){
                        if(result._id !== null) {
                            result['ip_geo_info.country'] = result._id;
                        } else {
                            result['ip_geo_info.country'] = 'Unknown';
                        }

                    });
                    self.log.debug(accountId, userId, '<< getVisitorLocationsByCountryReport');
                    fn(err, value);
                });
            }
        });

    },

    getVisitorDeviceReport: function(accountId, userId, startDate, endDate, isAggregate, orgId, fn) {

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
        if(orgId !== null) {
            match.$match.orgId = orgId;
        }
        stageAry.push(match);

        var group1 = {
            $group: {
                _id: '$user_agent.device',
                count: {$sum:1}
            }
        };
        stageAry.push(group1);
        self._addAccountFilterByID(accountId, userId, isAggregate, match, function(err, match) {
            if (err) {
                self.log.error(accountId, userId, 'Error adding filter:', err);
                fn(err);
            } else {
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
            }
        });

    },

    getUserReport:function(accountId, userId, start, end, previousStart, previousEnd, isAggregate, orgId, fn) {
        var self = this;
        self.log = _log;
        self.log.debug(accountId, userId, '>> getUserReport');
        var startTime = new Date().getTime();
        var granularity = self._determineGranularity(start, end);

        var stageAry = [];
        var match = {
            $match:{
                accountId:accountId,
                server_time_dt:{
                    $gte:previousStart,
                    $lte:end
                },
                fingerprint:{$ne:0}

            }
        };
        if(isAggregate === true) {
            delete match.$match.accountId;
        }
        if(orgId !== null) {
            match.$match.orgId = orgId;
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
        if(granularity === 'hours') {
            group1.$group._id.yearMonthDay.$dateToString.format = '%Y-%m-%d %H:00';
        }
        stageAry.push(group1);

        var group2 = {
            $group: {
                _id: '$_id.yearMonthDay',
                total:{$sum:1}
            }
        };
        stageAry.push(group2);
        self._addAccountFilterByID(accountId, userId, isAggregate, match, function(err, match) {
            if (err) {
                self.log.error(accountId, userId, 'Error adding filter:', err);
                fn(err);
            } else {
                async.waterfall([
                    function(cb) {
                        var startTime1 = new Date().getTime();
                        dao.aggregateWithCustomStages(stageAry, $$.m.SessionEvent, function(err, value) {
                            var duration1 = new Date().getTime() - startTime1;
                            self.log.warn('duration1:', duration1);
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
                                    if(granularity === 'hours') {
                                        result.timeframe.end = moment(entry._id).add(1, 'hours').format('YYYY-MM-DD HH:mm');
                                    } else {
                                        result.timeframe.end = moment(entry._id).add(1, 'days').format('YYYY-MM-DD');
                                    }
                                    resultAry.push(result);
                                });
                                resultAry = _.sortBy(resultAry, function(result){return result.timeframe.start;});

                                if(granularity === 'hours') {
                                    resultAry = self._zeroMissingHours(resultAry, {value:0}, moment(previousStart).format('YYYY-MM-DD HH:mm'), moment(end).format('YYYY-MM-DD HH:mm'));
                                } else {
                                    resultAry = self._zeroMissingDays(resultAry, {value:0}, moment(previousStart).format('YYYY-MM-DD'), moment(end).format('YYYY-MM-DD'));
                                }
                                cb(null, resultAry);
                            }
                        });
                    },
                    function (totalResults, cb) {
                        var currentMonth = [];
                        var previousMonth = [];
                        _.each(totalResults, function(result){
                            var resultEnd = moment(result.timeframe.start, "YYYY-MM-DD HH:mm");
                            if(granularity === 'hours') {
                                if(resultEnd.isAfter(start) || resultEnd.isSame(start, 'hour')) {
                                    currentMonth.push(result);
                                } else {
                                    previousMonth.push(result);
                                }
                            } else {
                                if(resultEnd.isAfter(start) || resultEnd.isSame(start, 'day')) {
                                    currentMonth.push(result);
                                } else {
                                    previousMonth.push(result);
                                }
                            }
                        });
                        cb(null, currentMonth, previousMonth);
                    },
                    function(currentMonth, previousMonth, cb) {

                        var result = {
                            currentMonth:currentMonth,
                            previousMonth: previousMonth
                        };
                        cb(null, result);
                    }
                ], function(err, results){
                    var duration = new Date().getTime() - startTime;
                    self.log.debug(accountId, userId, '<< getUserReport [' + duration + ']');
                    fn(err, results);
                });
            }
        });


    },

    getPageViewsReport: function(accountId, userId, start, end, previousStart, previousEnd, isAggregate, orgId, fn) {
        var self = this;
        self.log = _log;
        self.log.debug(accountId, userId, '>> getPageViewsReport');
        var granularity = self._determineGranularity(start, end);

        var stageAry = [];
        var match = {
            $match:{
                accountId:accountId,
                server_time_dt:{
                    $gte:previousStart,
                    $lte:end
                }

            }
        };
        if(isAggregate === true) {
            delete match.$match.accountId;
        }
        if(orgId !== null) {
            match.$match.orgId = orgId;
        }
        stageAry.push(match);

        self._buildLookupAndFilterStages(accountId, userId, isAggregate, function(err, extraStages){
            if(extraStages && extraStages.length > 0) {
                stageAry = stageAry.concat(extraStages);
            }
            var group = {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$server_time_dt" }},
                    count:{$sum:1}
                }
            };
            if(granularity === 'hours') {
                group.$group._id.$dateToString.format = '%Y-%m-%d %H:00';
            }
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
                                if(granularity === 'hours') {
                                    result.timeframe.end = moment(entry._id).add(1, 'hours').format('YYYY-MM-DD HH:mm');
                                } else {
                                    result.timeframe.end = moment(entry._id).add(1, 'days').format('YYYY-MM-DD');
                                }
                                resultAry.push(result);
                            });
                            resultAry = _.sortBy(resultAry, function(result){return result.timeframe.start;});
                            if(granularity === 'hours') {
                                resultAry = self._zeroMissingHours(resultAry, {value:0}, moment(previousStart).format('YYYY-MM-DD HH:mm'), moment(end).format('YYYY-MM-DD HH:mm'));
                            } else {
                                resultAry = self._zeroMissingDays(resultAry, {value:0}, moment(previousStart).format('YYYY-MM-DD'), moment(end).format('YYYY-MM-DD'));
                            }

                            cb(null, resultAry);
                        }
                    });
                },
                function (totalResults, cb) {
                    var currentMonth = [];
                    var previousMonth = [];
                    _.each(totalResults, function(result){
                        var resultEnd = moment(result.timeframe.start, "YYYY-MM-DD HH:mm");
                        if(granularity === 'hours') {
                            if(resultEnd.isAfter(start) || resultEnd.isSame(start, 'hour')) {
                                currentMonth.push(result);
                            } else {
                                previousMonth.push(result);
                            }
                        } else {
                            if(resultEnd.isAfter(start) || resultEnd.isSame(start, 'day')) {
                                currentMonth.push(result);
                            } else {
                                previousMonth.push(result);
                            }
                        }
                    });
                    cb(null, currentMonth, previousMonth);
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
        });



    },

    getPageViewPerformanceReport: function(accountId, userId, start, end, orgId, accountIds, fn) {
        var self = this;
        self.log = _log;
        self.log.debug(accountId, userId, '>> getPageViewPerformanceReport');
        var granularity = self._determineGranularity(start, end);

        var stageAry = [];
        var match = {
            $match:{
                accountId:{$in: accountIds},
                server_time_dt:{
                    $gte:start,
                    $lte:end
                }
            }
        };

        if(orgId !== null) {
            match.$match.orgId = orgId;
        }
        stageAry.push(match);

        self._buildLookupAndFilterStages(accountId, userId, true, function(err, extraStages) {
            if (extraStages && extraStages.length > 0) {
                stageAry = stageAry.concat(extraStages);
            }
            var group = {
                $group: {
                    _id: {
                        _date: {$dateToString: { format: "%Y-%m-%d", date: "$server_time_dt" }},
                        accountId:'$accountId'},
                    count:{$sum:1}
                }
            };
            if(granularity === 'hours') {
                group.$group._id._date.$dateToString.format = '%Y-%m-%d %H:00';
            }
            stageAry.push(group);

            dao.aggregateWithCustomStages(stageAry, $$.m.PageEvent, function(err, value) {
                if(err) {
                    self.log.error('Error finding current month:', err);
                    fn(err);
                } else {
                    var resultsByAccount = {};
                    var resultAry = null;
                    _.each(value, function (entry) {
                        if(resultsByAccount[entry._id.accountId]) {
                            resultAry = resultsByAccount[entry._id.accountId];
                        } else {
                            resultsByAccount[entry._id.accountId] = [];
                            resultAry = resultsByAccount[entry._id.accountId];
                        }
                        var result = {
                            accountId: entry._id.accountId,
                            value: entry.count,
                            timeframe: {
                                start: entry._id._date
                            }
                        };
                        if(granularity === 'hours') {
                            result.timeframe.end = moment(entry._id._date).add(1, 'hours').format('YYYY-MM-DD HH:mm');
                        } else {
                            result.timeframe.end = moment(entry._id._date).add(1, 'days').format('YYYY-MM-DD');
                        }
                        resultAry.push(result);
                    });
                    var results = _.mapObject(resultsByAccount, function(val, key){
                        val = _.sortBy(val, function(result){return result.timeframe.start});
                        if(granularity === 'hours') {
                            val = self._zeroMissingHours(val, {accountId:key, value:0}, moment(start).format('YYYY-MM-DD HH:mm'), moment(end).format('YYYY-MM-DD HH:mm'));
                        } else {
                            val = self._zeroMissingDays(val, {value:0, accountId:key}, moment(start).format('YYYY-MM-DD'), moment(end).format('YYYY-MM-DD'));
                        }
                        return val;
                    });

                    self.log.debug(accountId, userId, '<< getPageViewPerformanceReport');
                    fn(null, results);
                }
            });
        });



    },

    getSessionsReport:function(accountId, userId, start, end, previousStart, previousEnd, isAggregate, orgId, fn) {
        var self = this;
        self.log = _log;
        self.log.debug(accountId, userId, '>> getSessionsReport');
        var granularity = self._determineGranularity(start, end);

        var stageAry = [];
        var match = {
            $match:{
                accountId:accountId,
                server_time_dt:{
                    $gte:previousStart,
                    $lte:end
                },
                fingerprint:{$ne:0}

            }
        };
        if(isAggregate === true) {
            delete match.$match.accountId;
        }
        if(orgId !== null) {
            match.$match.orgId = orgId;
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
        if(granularity === 'hours') {
            group1.$group._id.yearMonthDay.$dateToString.format = '%Y-%m-%d %H:00';
        }
        stageAry.push(group1);

        var group2 = {
            $group: {
                _id: '$_id.yearMonthDay',
                total:{$sum:1}
            }
        };
        stageAry.push(group2);
        self._addAccountFilterByID(accountId, userId, isAggregate, match, function(err, match) {
            if (err) {
                self.log.error(accountId, userId, 'Error adding filter:', err);
                fn(err);
            } else {
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
                                    if(granularity === 'hours') {
                                        result.timeframe.end = moment(entry._id).add(1, 'hours').format('YYYY-MM-DD HH:mm');
                                    } else {
                                        result.timeframe.end = moment(entry._id).add(1, 'days').format('YYYY-MM-DD');
                                    }

                                    resultAry.push(result);
                                });
                                resultAry = _.sortBy(resultAry, function(result){return result.timeframe.start;});
                                if(granularity === 'hours') {
                                    resultAry = self._zeroMissingHours(resultAry, {total:0}, moment(previousStart).format('YYYY-MM-DD HH:mm'), moment(end).format('YYYY-MM-DD HH:mm'));
                                } else {
                                    resultAry = self._zeroMissingDays(resultAry, {total:0}, moment(previousStart).format('YYYY-MM-DD'), moment(end).format('YYYY-MM-DD'));
                                }

                                cb(null, resultAry);
                            }
                        });
                    },
                    function (totalResults, cb) {
                        var currentMonth = [];
                        var previousMonth = [];
                        _.each(totalResults, function(result) {
                            var resultEnd = moment(result.timeframe.start, "YYYY-MM-DD HH:mm");
                            if(granularity === 'hours') {
                                if(resultEnd.isAfter(start) || resultEnd.isSame(start, 'hour')) {
                                    currentMonth.push(result);
                                } else {
                                    previousMonth.push(result);
                                }
                            } else {
                                if(resultEnd.isAfter(start) || resultEnd.isSame(start, 'day')) {
                                    currentMonth.push(result);
                                } else {
                                    previousMonth.push(result);
                                }
                            }
                        });
                        cb(null, currentMonth, previousMonth);
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
            }
        });


    },

    sessionLengthReport: function(accountId, userId, start, end, previousStart, previousEnd, isAggregate, orgId, fn) {
        var self = this;
        self.log = _log;
        self.log.debug(accountId, userId, '>> sessionLengthReport');
        var granularity = self._determineGranularity(start, end);
        var stageAry = [];
        var match = {
            $match:{
                accountId:accountId,
                server_time_dt:{
                    $gte:start,
                    $lte:end
                },
                fingerprint:{$ne:0},
                session_length: {$gte:5000, $lte:360000}
            }
        };
        if(isAggregate === true) {
            delete match.$match.accountId;
        }
        if(orgId !== null) {
            match.$match.orgId = orgId;
        }
        stageAry.push(match);

        var group1 = {
            $group: {
                _id:{ $dateToString: { format: "%Y-%m-%d", date: "$server_time_dt" }},
                averageTime:{$avg:'$session_length'},
                count:{$sum:1}
            }
        };
        if(granularity === 'hours') {
            group1.$group._id.$dateToString.format = '%Y-%m-%d %H:00';
        }
        stageAry.push(group1);
        self._addAccountFilterByID(accountId, userId, isAggregate, match, function(err, match) {
            if (err) {
                self.log.error(accountId, userId, 'Error adding filter:', err);
                fn(err);
            } else {
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
                                    if(granularity === 'hours') {
                                        result.timeframe.end = moment(entry._id).add(1, 'hours').format('YYYY-MM-DD HH:mm');
                                    } else {
                                        result.timeframe.end = moment(entry._id).add(1, 'days').format('YYYY-MM-DD');
                                    }
                                    resultAry.push(result);
                                });
                                resultAry = _.sortBy(resultAry, function(result){return result.timeframe.start;});
                                if(granularity === 'hours') {
                                    resultAry = self._zeroMissingHours(resultAry, {value:0, count:0}, moment(start).format('YYYY-MM-DD HH:mm'), moment(end).format('YYYY-MM-DD HH:mm'));
                                } else {
                                    resultAry = self._zeroMissingDays(resultAry, {value:0, count:0}, moment(start).format('YYYY-MM-DD'), moment(end).format('YYYY-MM-DD'));
                                }
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
                                    if(granularity === 'hours') {
                                        result.timeframe.end = moment(entry._id).add(1, 'hours').format('YYYY-MM-DD HH:mm');
                                    } else {
                                        result.timeframe.end = moment(entry._id).add(1, 'days').format('YYYY-MM-DD');
                                    }
                                    resultAry.push(result);
                                });
                                resultAry = _.sortBy(resultAry, function(result){return result.timeframe.start;});
                                if(granularity === 'hours') {
                                    resultAry = self._zeroMissingHours(resultAry, {value:0, count:0}, moment(start).format('YYYY-MM-DD HH:mm'), moment(end).format('YYYY-MM-DD HH:mm'));
                                } else {
                                    resultAry = self._zeroMissingDays(resultAry, {value:0, count:0}, moment(start).format('YYYY-MM-DD'), moment(end).format('YYYY-MM-DD'));
                                }
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
                                    if(granularity === 'hours') {
                                        result.timeframe.end = moment(entry._id).add(1, 'hours').format('YYYY-MM-DD HH:mm');
                                    } else {
                                        result.timeframe.end = moment(entry._id).add(1, 'days').format('YYYY-MM-DD');
                                    }
                                    resultAry.push(result);
                                });
                                resultAry = _.sortBy(resultAry, function(result){return result.timeframe.start;});
                                if(granularity === 'hours') {
                                    resultAry = self._zeroMissingHours(resultAry, {value:0, count:0}, moment(previousStart).format('YYYY-MM-DD HH:mm'), moment(previousEnd).format('YYYY-MM-DD HH:mm'));
                                } else {
                                    resultAry = self._zeroMissingDays(resultAry, {value:0, count:0}, moment(previousStart).format('YYYY-MM-DD'), moment(previousEnd).format('YYYY-MM-DD'));
                                }
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
                                    if(granularity === 'hours') {
                                        result.timeframe.end = moment(entry._id).add(1, 'hours').format('YYYY-MM-DD HH:mm');
                                    } else {
                                        result.timeframe.end = moment(entry._id).add(1, 'days').format('YYYY-MM-DD');
                                    }
                                    resultAry.push(result);
                                });
                                resultAry = _.sortBy(resultAry, function(result){return result.timeframe.start;});
                                if(granularity === 'hours') {
                                    resultAry = self._zeroMissingHours(resultAry, {value:0, count:0}, moment(previousStart).format('YYYY-MM-DD HH:mm'), moment(previousEnd).format('YYYY-MM-DD HH:mm'));
                                } else {
                                    resultAry = self._zeroMissingDays(resultAry, {value:0, count:0}, moment(previousStart).format('YYYY-MM-DD'), moment(previousEnd).format('YYYY-MM-DD'));
                                }
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
            }
        });


    },

    trafficSourcesReport: function(accountId, userId, start, end, isAggregate, orgId, fn) {
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
        if(orgId !== null) {
            match.$match.orgId = orgId;
        }
        stageAry.push(match);

        var group = {
            $group:{
                _id:'$referrer.domain',
                result:{$sum:1}
            }
        };
        stageAry.push(group);

        self._addAccountFilterByID(accountId, userId, isAggregate, match, function(err, match) {
            if (err) {
                self.log.error(accountId, userId, 'Error adding filter:', err);
                fn(err);
            } else {
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
            }
        });

    },

    newVsReturningReport: function(accountId, userId, start, end, isAggregate, orgId, fn) {
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
        if(orgId !== null) {
            match.$match.orgId = orgId;
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

        self._addAccountFilterByID(accountId, userId, isAggregate, match, function(err, match) {
            if (err) {
                self.log.error(accountId, userId, 'Error adding filter:', err);
                fn(err);
            } else {
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
            }
        });

    },

    pageAnalyticsReport: function(accountId, userId, start, end, isAggregate, orgId, fn) {
        var self = this;
        self.log = _log;
        self.log.debug(accountId, userId, '>> pageAnalyticsReport');
        var startTime = new Date().getTime();

        var stageAry = [];
        var match, group1, group2;
        if(isAggregate === true) {
            match = {
                $match:{
                    server_time_dt:{
                        $gte:start,
                        $lte:end
                    },
                    timeOnPage:{$gte:0, $lte:3600000}
                }
            };
            if(orgId !== null) {
                match.$match.orgId = orgId;
            }

            group1 = {
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

            group2 = {
                $group: {
                    _id: '$_id.path',
                    uniquePageviews: {$sum:1},
                    pageviews: {$sum:'$pageviews'},
                    timeOnPage: {$sum:'$timeOnPage'},
                    avgTimeOnPage:{$avg:'$avgTimeOnPage'}
                }
            };
        } else {
            match = {
                $match:{
                    accountId:accountId,
                    server_time_dt:{
                        $gte:start,
                        $lte:end
                    },
                    timeOnPage:{$gte:0, $lte:3600000}
                }
            };

            group1 = {
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

            group2 = {
                $group: {
                    _id: '$_id.path',
                    uniquePageviews: {$sum:1},
                    pageviews: {$sum:'$pageviews'},
                    timeOnPage: {$sum:'$timeOnPage'},
                    avgTimeOnPage:{$avg:'$avgTimeOnPage'}
                }
            };

        }
        stageAry.push(match);

        self._buildLookupAndFilterStages(accountId, userId, isAggregate, function(err, extraStages){
            if(extraStages && extraStages.length > 0) {
                stageAry = stageAry.concat(extraStages);
            }
            stageAry.push(group1);
            stageAry.push(group2);
            //self.log.debug(accountId, userId, 'stageAry:', JSON.stringify(stageAry));
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
                                var duration = new Date().getTime() - startTime;
                                self.log.debug(accountId, userId, '<< pageAnalyticsReport [' + duration + ']');
                                fn(null, value);
                            }

                        });
                    } else {
                        var duration = new Date().getTime() - startTime;
                        self.log.debug(accountId, userId, '<< pageAnalyticsReport [' + duration + ']');
                        fn(null, value);
                    }

                }
            });
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

    _zeroMissingHours: function(resultAry, blankResult, firstDate, lastDate) {
        var currentDate = firstDate;
        var zeroedResultAry = [];
        _.each(resultAry, function(result){
            while(moment(currentDate).isBefore(result.timeframe.start)) {

                zeroedResultAry.push({
                    timeframe:{
                        start : currentDate,
                        end : moment(currentDate).add(1, 'hours').format('YYYY-MM-DD HH:mm')
                    }
                });
                zeroedResultAry.push(_.extend(zeroedResultAry.pop(), blankResult));
                currentDate = moment(currentDate).add(1, 'hours').format('YYYY-MM-DD HH:mm');
            }
            zeroedResultAry.push(result);
            currentDate = moment(result.timeframe.start).add(1, 'hours').format('YYYY-MM-DD HH:mm');
        });
        while(moment(currentDate).isBefore(moment(lastDate)) || moment(currentDate).isSame(moment(lastDate), 'hour')) {
            zeroedResultAry.push({
                timeframe:{
                    start : currentDate,
                    end : moment(currentDate).add(1, 'hours').format('YYYY-MM-DD HH:mm')
                }
            });
            zeroedResultAry.push(_.extend(zeroedResultAry.pop(), blankResult));
            currentDate = moment(currentDate).add(1, 'hours').format('YYYY-MM-DD HH:mm');
        }

        return zeroedResultAry;
    },

    _zeroMissingMinutes: function(resultAry, blankResult, firstDate, lastDate) {
        var currentDate = firstDate;
        var zeroedResultAry = [];
        _.each(resultAry, function(result){
            while(moment(currentDate).isBefore(result._id)) {

                zeroedResultAry.push({
                    _id: moment(currentDate).format('YYYY-MM-DD[T]HH:mm:00.000Z')
                });
                zeroedResultAry.push(_.extend(zeroedResultAry.pop(), blankResult));
                currentDate = moment(currentDate).add(1, 'minutes').format('YYYY-MM-DD[T]HH:mm:00.000Z');
            }
            zeroedResultAry.push({
                _id: moment(result._id).format('YYYY-MM-DD[T]HH:mm:00.000Z'),
                count: result.count
            });
            currentDate = moment(result._id).add(1, 'minutes').format('YYYY-MM-DD[T]HH:mm:00.000Z');
        });
        while(moment(currentDate).isBefore(moment(lastDate)) || moment(currentDate).isSame(moment(lastDate), 'minute')) {
            zeroedResultAry.push({
                _id: moment(currentDate).format('YYYY-MM-DD[T]HH:mm:00.000Z')
            });
            zeroedResultAry.push(_.extend(zeroedResultAry.pop(), blankResult));
            currentDate = moment(currentDate).add(1, 'minutes').format('YYYY-MM-DD[T]HH:mm:00.000Z');
        }

        return zeroedResultAry;
    },

    getUserAgentReport: function(accountId, userId, start, end, isAggregate, orgId, fn) {
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
        if(orgId !== null) {
            match.$match.orgId = orgId;
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

        self._addAccountFilterByID(accountId, userId, isAggregate, match, function(err, match) {
            if (err) {
                self.log.error(accountId, userId, 'Error adding filter:', err);
                fn(err);
            } else {
                dao.aggregateWithCustomStages(stageAry, $$.m.SessionEvent, function(err, value) {
                    var sortedResults = _.sortBy(value, function(result){return result.count;});
                    self.log.debug(accountId, userId, '<< getUserAgentReport');
                    fn(err, sortedResults);
                });
            }
        });

    },

    //TODO: No IP Filtering here... do we need it?
    getDailyActiveUsers: function(accountId, userId, start, end, orgId, fn) {
        var self = this;
        self.log = _log;
        self.log.debug(accountId, userId, '>> getDailyActiveUsers');
        var granularity = self._determineGranularity(start, end);

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
        if(orgId !== null) {
            match.$match.orgId = orgId;
        }
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
        if(granularity === 'hours') {
            group1.$group._id.yearMonthDay.$dateToString.format = '%Y-%m-%d %H:00';
        }
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
                    if(granularity === 'hours') {
                        result.timeframe.end = moment(entry._id).add(1, 'hours').format('YYYY-MM-DD HH:mm');
                    } else {
                        result.timeframe.end = moment(entry._id).add(1, 'days').format('YYYY-MM-DD');
                    }
                    resultAry.push(result);
                });
                resultAry = _.sortBy(resultAry, function(result){return result.timeframe.start;});
                if(granularity === 'hours') {
                    resultAry = self._zeroMissingHours(resultAry, {total:0}, moment(start).format('YYYY-MM-DD HH:mm'), moment(end).format('YYYY-MM-DD HH:mm'));
                } else {
                    resultAry = self._zeroMissingDays(resultAry, {total:0}, moment(start).format('YYYY-MM-DD'), moment(end).format('YYYY-MM-DD'));
                }
                self.log.debug(accountId, userId, '<< getDailyActiveUsers');
                return fn(null, resultAry);
            }

        });
    },

    //TODO: No IP Filtering Here... do we need it?
    getRevenueByMonth: function(accountId, userId, start, end, previousStart, previousEnd, isAggregate, orgId, fn) {
        var self = this;
        self.log = _log;
        self.log.debug(accountId, userId, '>> getRevenueByMonth');
        var granularity = self._determineGranularity(start, end);

        var stageAry = [];
        var match = {
            $match:{
                account_id:accountId,
                status:{$nin:['failed', 'pending_payment', 'refunded']},
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
        if(granularity === 'hours') {
            group1.$group._id.$dateToString.format = '%Y-%m-%d %H:00';
        }
        stageAry.push(group1);

        async.waterfall([
            function(cb) {
                if(orgId !== null) {
                    accountManager.getAccountIdsByOrg(accountId, userId, orgId, function(err, accountIds){
                        if(err) {
                            cb(err);
                        } else {
                            match.$match.account_id = {$in:accountIds};
                            cb();
                        }
                    });
                } else {
                    cb();
                }
            },
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
                        if(granularity === 'hours') {
                            result.timeframe.end = moment(entry._id).add(1, 'hours').format('YYYY-MM-DD HH:mm');
                        } else {
                            result.timeframe.end = moment(entry._id).add(1, 'days').format('YYYY-MM-DD');
                        }
                        resultAry.push(result);
                    });
                    resultAry = _.sortBy(resultAry, function(result){return result.timeframe.start;});
                    if(granularity === 'hours') {
                        resultAry = self._zeroMissingHours(resultAry, {total:0, count:0}, moment(start).format('YYYY-MM-DD HH:mm'), moment(end).format('YYYY-MM-DD HH:mm'));
                    } else {
                        resultAry = self._zeroMissingDays(resultAry, {total:0, count:0}, moment(start).format('YYYY-MM-DD'), moment(end).format('YYYY-MM-DD'));
                    }
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
                        if(granularity === 'hours') {
                            result.timeframe.end = moment(entry._id).add(1, 'hours').format('YYYY-MM-DD HH:mm');
                        } else {
                            result.timeframe.end = moment(entry._id).add(1, 'days').format('YYYY-MM-DD');
                        }
                        resultAry.push(result);
                    });
                    resultAry = _.sortBy(resultAry, function(result){return result.timeframe.start;});
                    if(granularity === 'hours') {
                        resultAry = self._zeroMissingHours(resultAry, {total:0, count:0}, moment(previousStart).format('YYYY-MM-DD HH:mm'), moment(previousEnd).format('YYYY-MM-DD HH:mm'));
                    } else {
                        resultAry = self._zeroMissingDays(resultAry, {total:0, count:0}, moment(previousStart).format('YYYY-MM-DD'), moment(previousEnd).format('YYYY-MM-DD'));
                    }
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
    },

    getOSReport: function(accountId, userId, start, end, isAggregate, orgId, fn) {
        var self = this;
        self.log = _log;
        self.log.debug(accountId, userId, '>> getOSReport');

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
        if(orgId !== null) {
            match.$match.orgId = orgId;
        }
        stageAry.push(match);

        var group1 = {
            $group: {
                _id:{
                    osName:'$user_agent.os.name',
                    osVersion:'$user_agent.os.version'
                },
                count: {$sum:1}
            }
        };
        stageAry.push(group1);
        self._addAccountFilterByID(accountId, userId, isAggregate, match, function(err, match) {
            if (err) {
                self.log.error(accountId, userId, 'Error adding filter:', err);
                fn(err);
            } else {
                dao.aggregateWithCustomStages(stageAry, $$.m.SessionEvent, function(err, value) {
                    var sortedResults = _.sortBy(value, function(result){return result.count;});
                    self.log.debug(accountId, userId, '<< getOSReport');
                    fn(err, sortedResults);
                });
            }
        });

    },

    //TODO: No IP Filtering here... do we need it?
    getCampaignEmailsReport: function(accountId, userId, start, end, previousStart, previousEnd, isAggregate, orgId, fn) {
        var self = this;
        self.log = _log;
        self.log.debug(accountId, userId, '>> getCampaignEmailsReport');
        var granularity = self._determineGranularity(start, end);

        var campaignsByDayStageAry = [];
        var match = {
            $match:{
                accountId:accountId,
                batchId:{$ne:null},
                sendDate:{
                    $gte:start,
                    $lte:end
                }
            }
        };
        if(isAggregate === true) {
            delete match.$match.accountId;
        }
        campaignsByDayStageAry.push(match);

        var group = {
            $group:{
                _id:{
                    campaignId:'$batchId',
                    yearMonthDay: { $dateToString: { format: "%Y-%m-%d", date: "$sendDate" }}
                },
                count:{$sum:1}
            }
        };
        if(granularity === 'hours') {
            group.$group._id.yearMonthDay.$dateToString.format = '%Y-%m-%d %H:00';
        }
        campaignsByDayStageAry.push(group);
        var group2 = {
            $group:{
                _id:{
                    yearMonthDay:'$_id.yearMonthDay'
                },
                count:{$sum:1}
            }
        };
        campaignsByDayStageAry.push(group2);

        var emailsByDayStageAry = [];
        var emailsMatch = {
            $match:{
                accountId:accountId,
                sendDate:{
                    $gte:start,
                    $lte:end
                }
            }
        };
        if(isAggregate === true) {
            delete emailsMatch.$match.accountId;
        }
        emailsByDayStageAry.push(emailsMatch);
        var emailsGroup = {
            $group:{
                _id:{
                    yearMonthDay: { $dateToString: { format: "%Y-%m-%d", date: "$sendDate" }}
                },
                count:{$sum:1}
            }
        };
        if(granularity === 'hours') {
            emailsGroup.$group._id.yearMonthDay.$dateToString.format = '%Y-%m-%d %H:00';
        }
        emailsByDayStageAry.push(emailsGroup);

        var opensByDayStageAry = [];
        var opensMatch = {
            $match:{
                accountId:accountId,
                openedDate:{
                    $gte:start,
                    $lte:end
                }
            }
        };
        if(isAggregate === true) {
            delete opensMatch.$match.accountId;
        }
        opensByDayStageAry.push(opensMatch);
        var opensGroup = {
            $group:{
                _id:{
                    yearMonthDay: { $dateToString: { format: "%Y-%m-%d", date: "$openedDate" }}
                },
                count:{$sum:1}
            }
        };
        if(granularity === 'hours') {
            opensGroup.$group._id.yearMonthDay.$dateToString.format = '%Y-%m-%d %H:00';
        }
        opensByDayStageAry.push(opensGroup);

        var clicksByDayStageAry = [];
        var clicksMatch = {
            $match:{
                accountId:accountId,
                clickedDate:{
                    $gte:start,
                    $lte:end
                }
            }
        };
        if(isAggregate === true) {
            delete clicksMatch.$match.accountId;
        }
        clicksByDayStageAry.push(clicksMatch);
        var clicksGroup = {
            $group:{
                _id:{
                    yearMonthDay: { $dateToString: { format: "%Y-%m-%d", date: "$clickedDate" }}
                },
                count:{$sum:1}
            }
        };
        if(granularity === 'hours') {
            clicksGroup.$group._id.yearMonthDay.$dateToString.format = '%Y-%m-%d %H:00';
        }
        clicksByDayStageAry.push(clicksGroup);

        async.waterfall([
            function(callback) {
                if(orgId !== null) {
                    accountManager.getAccountIdsByOrg(accountId, userId, orgId, function(err, accountIds){
                        if(err) {
                            callback(err);
                        } else {
                            match.$match.accountId = {$in:accountIds};
                            emailsMatch.$match.accountId = {$in:accountIds};
                            opensMatch.$match.accountId = {$in:accountIds};
                            clicksMatch.$match.accountId = {$in:accountIds};
                            callback();
                        }
                    });
                } else {
                    callback();
                }
            },
            function(callback) {
                async.parallel({
                    campaigns: function campaigns(cb){
                        dao.aggregateWithCustomStages(campaignsByDayStageAry, $$.m.Emailmessage, function(err, value) {
                            var resultAry = [];
                            _.each(value, function (entry) {
                                var result = {
                                    total: entry.count,
                                    timeframe: {
                                        start: entry._id.yearMonthDay
                                    }
                                };
                                if(granularity === 'hours') {
                                    result.timeframe.end = moment(entry._id.yearMonthDay).add(1, 'hours').format('YYYY-MM-DD HH:mm');
                                } else {
                                    result.timeframe.end = moment(entry._id.yearMonthDay).add(1, 'days').format('YYYY-MM-DD');
                                }
                                resultAry.push(result);
                            });
                            resultAry = _.sortBy(resultAry, function(result){return result.timeframe.start;});
                            if(granularity === 'hours') {
                                resultAry = self._zeroMissingHours(resultAry, {total:0}, moment(start).format('YYYY-MM-DD HH:mm'), moment(end).format('YYYY-MM-DD HH:mm'));
                            } else {
                                resultAry = self._zeroMissingDays(resultAry, {total:0}, moment(start).format('YYYY-MM-DD'), moment(end).format('YYYY-MM-DD'));
                            }
                            cb(err, resultAry);
                        });
                    },
                    emails: function emails(cb) {
                        dao.aggregateWithCustomStages(emailsByDayStageAry, $$.m.Emailmessage, function(err, value) {
                            var resultAry = [];
                            _.each(value, function (entry) {
                                var result = {
                                    total: entry.count,
                                    timeframe: {
                                        start: entry._id.yearMonthDay
                                    }
                                };
                                if(granularity === 'hours') {
                                    result.timeframe.end = moment(entry._id.yearMonthDay).add(1, 'hours').format('YYYY-MM-DD HH:mm');
                                } else {
                                    result.timeframe.end = moment(entry._id.yearMonthDay).add(1, 'days').format('YYYY-MM-DD');
                                }
                                resultAry.push(result);
                            });
                            resultAry = _.sortBy(resultAry, function(result){return result.timeframe.start;});
                            if(granularity === 'hours') {
                                resultAry = self._zeroMissingHours(resultAry, {total:0}, moment(start).format('YYYY-MM-DD HH:mm'), moment(end).format('YYYY-MM-DD HH:mm'));
                            } else {
                                resultAry = self._zeroMissingDays(resultAry, {total:0}, moment(start).format('YYYY-MM-DD'), moment(end).format('YYYY-MM-DD'));
                            }
                            cb(err, resultAry);
                        });
                    },
                    opens: function opens(cb){
                        dao.aggregateWithCustomStages(opensByDayStageAry, $$.m.Emailmessage, function(err, value) {
                            var resultAry = [];
                            _.each(value, function (entry) {
                                var result = {
                                    total: entry.count,
                                    timeframe: {
                                        start: entry._id.yearMonthDay
                                    }
                                };
                                if(granularity === 'hours') {
                                    result.timeframe.end = moment(entry._id.yearMonthDay).add(1, 'hours').format('YYYY-MM-DD HH:mm');
                                } else {
                                    result.timeframe.end = moment(entry._id.yearMonthDay).add(1, 'days').format('YYYY-MM-DD');
                                }
                                resultAry.push(result);
                            });
                            resultAry = _.sortBy(resultAry, function(result){return result.timeframe.start;});
                            if(granularity === 'hours') {
                                resultAry = self._zeroMissingHours(resultAry, {total:0}, moment(start).format('YYYY-MM-DD HH:mm'), moment(end).format('YYYY-MM-DD HH:mm'));
                            } else {
                                resultAry = self._zeroMissingDays(resultAry, {total:0}, moment(start).format('YYYY-MM-DD'), moment(end).format('YYYY-MM-DD'));
                            }
                            cb(err, resultAry);
                        });
                    },
                    clicks: function clicks(cb){
                        dao.aggregateWithCustomStages(clicksByDayStageAry, $$.m.Emailmessage, function(err, value) {
                            var resultAry = [];
                            _.each(value, function (entry) {
                                var result = {
                                    total: entry.count,
                                    timeframe: {
                                        start: entry._id.yearMonthDay
                                    }
                                };
                                if(granularity === 'hours') {
                                    result.timeframe.end = moment(entry._id.yearMonthDay).add(1, 'hours').format('YYYY-MM-DD HH:mm');
                                } else {
                                    result.timeframe.end = moment(entry._id.yearMonthDay).add(1, 'days').format('YYYY-MM-DD');
                                }
                                resultAry.push(result);
                            });
                            resultAry = _.sortBy(resultAry, function(result){return result.timeframe.start;});
                            if(granularity === 'hours') {
                                resultAry = self._zeroMissingHours(resultAry, {total:0}, moment(start).format('YYYY-MM-DD HH:mm'), moment(end).format('YYYY-MM-DD HH:mm'));
                            } else {
                                resultAry = self._zeroMissingDays(resultAry, {total:0}, moment(start).format('YYYY-MM-DD'), moment(end).format('YYYY-MM-DD'));
                            }
                            cb(err, resultAry);
                        });
                    }
                }, function(err, results){
                    callback(err, results);

                });
            }
        ], function(err, results){
            self.log.debug(accountId, userId, '<< getCampaignEmailsReport');
            return fn(err, results);
        });
    },

    //TODO: No IP Filtering here... do we need it?
    get404sReport: function(accountId, userId, start, end, isAggregate, orgId, fn) {
        var self = this;
        self.log = _log;
        self.log.debug(accountId, userId, '>> get404sReport');
        var granularity = self._determineGranularity(start, end);

        var stageAry = [];
        var match = {
            $match:{
                accountId:accountId,
                server_time_dt:{
                    $gte:start,
                    $lte:end
                },
                'url.path':'/404',
                "requestedUrl.path": {  $nin:  not404s },
            }
        };
        if(isAggregate === true) {
            delete match.$match.accountId;
        }
        if(orgId !== null) {
            match.$match.orgId = orgId;
        }
        stageAry.push(match);
        var group1 = {
            $group: {
                _id:{
                    path:'$requestedUrl.path'
                },
                count:{$sum:1}
            }
        };
        stageAry.push(group1);
        var group2 = {
            $group: {
                _id: {path:'$_id.path'},
                total:{$sum:'$count'}
            }
        };
        stageAry.push(group2);
        dao.aggregateWithCustomStages(stageAry, $$.m.PageEvent, function(err, value) {
            var resultAry = [];
            _.each(value, function (entry) {
                var result = {
                    total: entry.total,
                    path: entry._id.path || 'unknown'
                };

                resultAry.push(result);
            });
            var sortedResults = _.sortBy(resultAry, function(result){return result.total;}).reverse();
            self.log.debug(accountId, userId, '<< get404sReport');
            fn(err, sortedResults);
        });
    },

    get404sByDateAndPathReport: function(accountId, userId, start, end, isAggregate, orgId, fn) {
        var self = this;
        self.log = _log;
        self.log.debug(accountId, userId, '>> get404sByDateAndPathReport');
        var granularity = self._determineGranularity(start, end);

        var stageAry = [];
        var match = {
            $match:{
                accountId:accountId,
                server_time_dt:{
                    $gte:start,
                    $lte:end
                },
                'url.path':'/404',
                "requestedUrl.path": {  $nin:  not404s }
            }
        };
        if(isAggregate === true) {
            delete match.$match.accountId;
        }
        if(orgId !== null) {
            match.$match.orgId = orgId;
        }
        stageAry.push(match);
        self._buildLookupAndFilterStages(accountId, userId, isAggregate, function(err, extraStages) {
            if (extraStages && extraStages.length > 0) {
                stageAry = stageAry.concat(extraStages);
            }
            var group1 = {
                $group: {
                    _id:{
                        yearMonthDay: { $dateToString: { format: "%Y-%m-%d", date: "$server_time_dt" }}
                    },
                    count:{$sum:1}
                }
            };
            if(granularity === 'hours') {
                group1.$group._id.yearMonthDay.$dateToString.format = '%Y-%m-%d %H:00';
            }
            stageAry.push(group1);

            var group2 = {
                $group: {
                    _id: {date:'$_id.yearMonthDay'},
                    total:{$sum:'$count'}
                }
            };
            stageAry.push(group2);

            dao.aggregateWithCustomStages(stageAry, $$.m.PageEvent, function(err, value) {
                var resultAry = [];
                _.each(value, function (entry) {
                    var result = {
                        total: entry.total,
                        timeframe: {
                            start: entry._id.date
                        }
                    };
                    if(granularity === 'hours') {
                        result.timeframe.end = moment(entry._id.date).add(1, 'hours').format('YYYY-MM-DD HH:mm');
                    } else {
                        result.timeframe.end = moment(entry._id.date).add(1, 'days').format('YYYY-MM-DD');
                    }
                    resultAry.push(result);
                });
                //self.log.info('resultAry:', resultAry);
                var sortedResults = _.sortBy(resultAry, function(result){return result.timeframe.start;});
                //self.log.info('sortedResults:', sortedResults);
                if(granularity === 'hours') {
                    sortedResults = self._zeroMissingHours(sortedResults, {total:0}, moment(start).format('YYYY-MM-DD HH:mm'), moment(end).format('YYYY-MM-DD HH:mm'));
                } else {
                    sortedResults = self._zeroMissingDays(sortedResults, {total:0}, moment(start).format('YYYY-MM-DD'), moment(end).format('YYYY-MM-DD'));
                }
                self.log.debug(accountId, userId, '<< get404sByDateAndPathReport');
                fn(err, sortedResults);
            });
        });

    },

    getTopSearches: function(accountId, userId, start, end, isAggregate, orgId, fn) {
        var self = this;
        self.log = _log;
        self.log.debug(accountId, userId, '>> getTopSearches');

        var stageAry = [];
        var match = {
            $match:{
                accountId:accountId,
                activityType: 'INV_SEARCH',
                start:{
                    $gte:start,
                    $lte:end
                }
            }
        };
        if(isAggregate === true) {
            delete match.$match.accountId;
        }
        if(orgId !== null) {
            match.$match.orgId = orgId;
        }
        stageAry.push(match);

        var group = {
            $group:{
                _id:'$note',
                total:{$sum:1}
            }
        };
        stageAry.push(group);

        dao.aggregateWithCustomStages(stageAry, $$.m.UserActivity, function(err, value) {
            if(err) {
                self.log.error('Error finding current month:', err);
                fn(err);
            } else {
                self.log.debug(accountId, userId, '<< getTopSearches');
                fn(null, value);
            }
        });

    },

    getMostActiveUsers: function(accountId, userId, start, end, isAggregate, orgId, fn) {
        var self = this;
        self.log = _log;
        self.log.debug(accountId, userId, '>> getMostActiveUsers');

        var stageAry = [];
        var match = {
            $match:{
                accountId:accountId,
                activityType: 'LOGIN',
                start:{
                    $gte:start,
                    $lte:end
                }
            }
        };
        if(isAggregate === true) {
            delete match.$match.accountId;
        }
        if(orgId !== null) {
            match.$match.orgId = orgId;
        }
        stageAry.push(match);

        var group = {
            $group:{
                _id:'$userId',
                total:{$sum:1}
            }
        };
        stageAry.push(group);

        dao.aggregateWithCustomStages(stageAry, $$.m.UserActivity, function(err, value) {
            if(err) {
                self.log.error('Error finding current month:', err);
                fn(err);
            } else {
                self.log.debug(accountId, userId, '<< getMostActiveUsers');
                async.each(value, function(record, cb){
                    userDao.getById(record._id, $$.m.User, function(err, user){
                        if(err) {
                            cb()
                        }
                        else if(user){
                            record.user = user.get("username");
                            cb();
                        }
                        else{
                            cb();
                        }

                    })
                }, function(err){
                    fn(null, value);
                })
            }
        });

    },

    getTrafficFingerprints: function(accountId, userId, isAggregate, orgId, fn) {
        var self = this;
        self.log = _log;
        self.log.trace(accountId, userId, '>> getTrafficFingerprints');
        
        var stageAry = [];
        var match = {
            $match:{
                accountId: accountId               
            }
        };
        if(isAggregate === true) {
            delete match.$match.accountId;
        }
        if(orgId !== null) {
            match.$match.orgId = orgId;
        }


        stageAry.push(match);
        self._addAccountFilterByID(accountId, userId, isAggregate, match, function(err, newMatch){            
            var sort = {
                $sort:{'server_time':-1}
            };
            var group = {
                $group:{
                    _id: '$fingerprint',                    
                    sessions:{$push:'$$ROOT'}
                }
            };
            stageAry.push(sort);
            stageAry.push(group);

            dao.aggregateWithCustomStages(stageAry, $$.m.SessionEvent, function(err, results) {
                if(err) {
                    self.log.error('Error getting fingerprints:', err);
                    fn(err);
                } else {
                    var resultArr = [];
                    _.each(results, function(result){
                        if(result.sessions && result.sessions.length){
                            resultArr.push({
                                _id: result._id,
                                server_time_dt: result.sessions[0].server_time_dt,
                                accountId: result.sessions[0].accountId,
                                subdomain: result.sessions[0].subdomain,
                                orgId: result.sessions[0].orgId,
                                user_agent: result.sessions[0].user_agent
                            })
                        }
                    })
                    fn(err, resultArr);
                }
            });
        });

    },

    /*
     * If duration is 7 days or less, granularity will be 'hours'.  Else 'days'
     */
    _determineGranularity: function(startDate, endDate) {
        if(moment(endDate).diff(moment(startDate), 'days') <=7) {
            return 'hours';
        } else {
            return 'days';
        }
    },

    _addAccountFilterByID: function(accountId, userId, isAggregate, query, fn) {
        var self = this;
        if(isAggregate === true) {
            fn(null, query);
        } else {
            accountDao.getAccountByID(accountId, function(err, account){
                if(err) {
                    self.log.error(accountId, userId, 'Error fetching account:', err);
                    fn(err);
                } else {
                    self._addAccountFilter(account, userId, isAggregate, query, fn);
                }
            });
        }
    },

    _addAccountFilter: function(account, userId, isAggregate, query, fn) {
        var self = this;
        if(isAggregate === true) {
            fn(null, query);
        } else if(!account){
            self.log.warn('No account to filter');
            fn(null, query);
        } else {
            var prefs = account.get('analyticsPreferences');
            if(!prefs) {
                fn(null, query);
            } else {
                var filterIPs = prefs.filterIPs;
                query.$match.ip_address = {$nin:filterIPs};
                fn(null, query);
            }
        }
    },

    _buildLookupAndFilterStages: function(accountId, userId, isAggregate, fn){
        var self = this;
        if(isAggregate === true) {
            fn(null, []);
        } else {
            accountDao.getAccountByID(accountId, function(err, account){
                if(err) {
                    self.log.error(accountId, userId, 'Error fetching account:', err);
                    fn(err);
                } else if(!account || !account.get('analyticsPreferences')){
                    fn(null, []);
                } else {
                    var prefs = account.get('analyticsPreferences');
                    if(!prefs) {
                        fn(null, []);
                    } else {
                        var filterIPs = prefs.filterIPs;
                        var lookupStage = {
                            $lookup:{
                                from:'session_events',
                                localField:'session_id',
                                foreignField:'session_id',
                                as:'sessionEvent'
                            }
                        };
                        var extraStages = [];
                        extraStages.push(lookupStage);
                        var filter = {
                            $match:{
                                'sessionEvent.ip_address':{$nin:filterIPs}
                            }
                        };
                        extraStages.push(filter);

                        fn(null, extraStages);
                    }
                }
            });
        }
    }
};
