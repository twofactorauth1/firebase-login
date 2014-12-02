/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */
require('./dao/analytics.dao.js');
var log = $$.g.getLogger("analytics_collater");
var dao = require('./dao/analytics.dao.js');
require('./model/page_event');
require('./model/session_event');
require('./model/ping_event');
var analyticsTimerConfig = require('../configs/analyticstimer.config');

var Keen = require('keen.io');
var keenConfig = require('../configs/keen.config');
var async = require('async');
var moment = require('moment');


// Configure instance. Only projectId and writeKey are required to send data.
var client = Keen.configure({
    projectId: keenConfig.KEEN_PROJECT_ID,
    writeKey: keenConfig.KEEN_WRITE_KEY,
    readKey: keenConfig.KEEN_READ_KEY,
    masterKey: keenConfig.KEEN_MASTER_KEY
});

var secondsSinceLastPingThreshold = analyticsTimerConfig.ANALYTICS_LAST_PING_SECONDS || 120;

var collator = {

    secondsThreshold: 120,

    findCheckGroupAndSend: function(cb) {
        var self = this;

        log.debug('>> findCheckGroupAndSend');
        var startTime = new Date();
        //search through session events where session_end = 0
        var query = {session_end:0};
        dao.findMany(query, $$.m.SessionEvent, function(err, list){
            if(err) {
                log.error('Error finding session events: ' + err);
                return;
            }
            if(list != null && list.length > 0) {
                log.info('processing ' + list.length + ' session events');
                //_.each(list,  self._processSessionEvent, self);
                async.each(list, collator._processSessionEventWithCallback.bind(self), function(err){
                    if(err) {
                        log.error('error processing session events.');
                        if(cb) {
                            cb(err);
                        }

                    } else {
                        var duration = new Date().getTime() - startTime.getTime();
                        log.debug('<< findCheckGroupAndSend');
                        if(cb) {
                            cb(null, 'Processed '+ list.length + ' sessionEvents in ' + duration + 'ms.');
                        }
                    }

                });
            } else {
                log.debug('<< findCheckGroupAndSend(0)');
                if(cb) {
                    cb(null, '0 records to process');
                }
            }

        });

    },

    _processSessionEventWithCallback: function(sessionEvent, callback) {
        var self = this;
        log.debug('processing session event with id: ' + sessionEvent.id());
        dao.getMaxValue({session_id:sessionEvent.get('session_id')}, 'server_time', $$.m.PingEvent, function(err, value){
            if(err) {
                log.error('Error finding max server_time for sessionEvent ' + sessionEvent.get('session_id'));
                return;
            }
            //log.debug('maxValue: ', value);
            if(value === undefined) {
                log.debug('No pings found for session ' + sessionEvent.id() + '.  Closing.');
                collator._closeSessionWithNoPings(sessionEvent, callback);
            } else {
                var lastSeenVsNowInSecs = (new Date().getTime() - value) / 1000;
                log.debug('lastSeenVsNowInSecs '+ lastSeenVsNowInSecs+' secondsSinceLastPingThreshold '+secondsSinceLastPingThreshold);
                if(lastSeenVsNowInSecs >= secondsSinceLastPingThreshold) {
                    collator._groupAndSendWithCallback(sessionEvent, value, function(err, value){
                        if(err) {
                            log.error('Error grouping and sending: ' + err);
                            callback(err);
                        } else {
                            log.debug('<< _processSessionEvent');
                            callback();
                        }
                    });
                }
            }


        });
    },

    _groupAndSendWithCallback: function(sessionEvent, lastSeenMS, fn) {
        var self = this;
        log.debug('>> _groupAndSendWithCallback');
        //set endtime so we don't get caught up in another run.
        sessionEvent.set('session_end', lastSeenMS);
        sessionEvent.set('session_length', lastSeenMS - sessionEvent.get('session_start'));

        async.waterfall([
            function(cb){
                dao.saveOrUpdate(sessionEvent, function(err, value) {
                    if (err) {
                        log.error('Error updating session event: ' + err);
                        cb(err);
                    } else {
                        cb(null);
                    }
                });
            },
            function(cb) {
                dao.findAndOrder({session_id:sessionEvent.get('session_id')}, null, $$.m.PageEvent, 'start_time', 1, function(err, pageList) {
                    if (err) {
                        log.error('Error retrieving page list for session event with id: ' + sessionEvent.get('session_id'));
                        cb(err);
                    } else {
                        cb(null, pageList);
                    }
                });
            },
            function(pageList, cb) {
                dao.findAndOrder({session_id:sessionEvent.get('session_id')}, null, $$.m.PingEvent, 'ping_time', 1, function(err, pingList) { //order by ping_time
                    if (err) {
                        log.error('Error retrieving ping list for session event with id: ' + sessionEvent.get('session_id'));
                        cb(err);
                    }

                    //set the end_time for each page as the start_time from the next one.
                    _.each(pageList, function (page, index, list) {
                        if (index < list.length - 1) {//not the last one.
                            page.set('end_time', list[index + 1].get('start_time'));
                            page.set('exit', false);
                        } else {//last one
                            page.set('end_time', lastSeenMS);
                            page.set('exit', true);
                        }
                        var timeOnPage = page.get('start_time') - page.get('end_time');
                        page.set('timeOnPage', timeOnPage);
                    });
                    _.each(pingList, function (ping, index, list) {
                        //var page = _.findWhere(pageList, {url: ping.get('url')});
                        var page = _.find(pageList, function(page){
                            return _.isEqual(page.get('url'), ping.get('url'));
                        });


                        if (page != undefined) {
                            page.get('pageActions').push(ping.get('pageActions'));
                        } else {
                            log.warn('no page found for ping event', ping);
                        }
                    });

                    sessionEvent.set('page_depth', pageList.length);
                    //send to keen unless test environment
                    if (process.env.NODE_ENV !== "testing") {
                        client.addEvents({
                            "session_data": [sessionEvent],
                            "page_data": pageList
                        }, function (err, res) {
                            if (err) {
                                log.error('Error sending data to keen.');
                            } else {
                                log.info('Successfully sent events to keen.');
                            }
                        });
                    } else {
                        log.info('skipping keen because of testing environment.');
                    }
                    dao.batchUpdate(pageList, $$.m.PageEvent, function(err, value){
                        if(err) {
                            log.error('Error saving page events for session with id: ' + sessionEvent.get('session_id'));
                        } else {
                            log.debug('finished processing session event ' + sessionEvent.get('session_id'));
                        }
                        cb(null, 'OK');
                        log.debug('<< _groupAndSend');
                    });
                });
            }
        ], function(err, result){
            fn(err, result);
        });
    },

    _closeSessionWithNoPings: function(sessionEvent, callback){
        var serverTime = moment();
        var secondsToSubtract = collator.secondsThreshold*2;

        var serverTime = serverTime.subtract(secondsToSubtract, 'seconds');

        if(sessionEvent.get('server_time') === undefined || sessionEvent.get('server_time')===null) {
            //close it right now.
        } else {
            serverTime = moment(sessionEvent.get('server_time'));
        }
        var now = moment().valueOf();
        var serverTimeMS = serverTime.valueOf();
        //console.log('comparing ' + now + ' to ' + serverTimeMS +' is ' + (now - serverTimeMS));
        if(moment().valueOf() - moment(serverTime).valueOf() > (collator.secondsThreshold*1000)) {
            sessionEvent.set('session_end', moment().valueOf());
            sessionEvent.set('session_length', collator.secondsThreshold*1000);
            sessionEvent.set('page_depth', 1);

            if (process.env.NODE_ENV !== "testing") {
                client.addEvents({
                    "session_data": [sessionEvent]
                }, function (err, res) {
                    if (err) {
                        log.error('Error sending data to keen.');
                    } else {
                        log.info('Successfully sent events to keen.');
                    }
                });
            } else {
                log.info('skipping keen because of testing environment.');
            }
            
            dao.saveOrUpdate(sessionEvent, function(err, value) {
                if (err) {
                    log.error('Error updating session event: ' + err);
                    callback(err);
                } else {
                    //handle any pages that don't have pings
                    collator._closePagesWithNoPings(sessionEvent, callback);
                }
            });
        }
    },

    _closePagesWithNoPings: function(sessionEvent, callback) {
        var lastSeenMS = sessionEvent.get('session_end');
        dao.findAndOrder({session_id:sessionEvent.get('session_id')}, null, $$.m.PageEvent, 'start_time', 1, function(err, pageList) {
            if (err) {
                log.error('Error retrieving page list for session event with id: ' + sessionEvent.get('session_id'));
                cb(err);
            } else {
                //set the end_time for each page as the start_time from the next one.
                _.each(pageList, function (page, index, list) {
                    if (index < list.length - 1) {//not the last one.
                        page.set('end_time', list[index + 1].get('start_time'));
                    } else {//last one
                        page.set('end_time', lastSeenMS);
                    }
                    var timeOnPage = page.get('end_time') - page.get('start_time');
                    page.set('timeOnPage', timeOnPage);
                });
                //send to keen unless test environment
                if (process.env.NODE_ENV !== "testing") {
                    client.addEvents({
                        "session_data": [sessionEvent],
                        "page_data": pageList
                    }, function (err, res) {
                        if (err) {
                            log.error('Error sending data to keen.');
                        } else {
                            log.info('Successfully sent events to keen.');
                        }
                    });
                } else {
                    log.info('skipping keen because of testing environment.');
                }
                dao.batchUpdate(pageList, $$.m.PageEvent, function(err, value){
                    if(err) {
                        log.error('Error saving page events for session with id: ' + sessionEvent.get('session_id'));
                    } else {
                        log.debug('finished processing session event ' + sessionEvent.get('session_id'));
                    }
                    callback(null, 'OK');
                });

            }
        });





    },


    _processSessionEvent: function(sessionEvent, index, list) {
        var self = this;
        log.debug('processing sessionEvent #' + index + ' of '+list.length);
        //get max ping time for session
        dao.getMaxValue({session_id:sessionEvent.get('session_id')}, 'server_time', $$.m.PingEvent, function(err, value){
            if(err) {
                log.error('Error finding max server_time for sessionEvent ' + sessionEvent.get('session_id'));
                return;
            }
            log.debug('maxValue: ', value);
            var lastSeenVsNowInSecs = (new Date().getTime() - value) / 1000;
            if(lastSeenVsNowInSecs >= secondsSinceLastPingThreshold) {
                self._groupAndSend(sessionEvent, value);
            }
            log.debug('<< _processSessionEvent');
        });

        //if last seen exceeds threshold, group pages, set endtime, send to Keen
    },

    _groupAndSend: function(sessionEvent, lastSeenMS) {
        var self = this;
        log.debug('>> _groupAndSend');
        //set endtime so we don't get caught up in another run.
        sessionEvent.set('session_end', lastSeenMS);
        sessionEvent.set('session_length', lastSeenMS - sessionEvent.get('session_start'));
        dao.saveOrUpdate(sessionEvent, function(err, value){
            if(err) {
                log.error('Error updating session event: ' + err);
                return;
            }
            dao.findAndOrder({session_id:sessionEvent.get('session_id')}, null, $$.m.PageEvent, 'start_time', 1, function(err, pageList){
                if(err) {
                    log.error('Error retrieving page list for session event with id: ' + sessionEvent.get('session_id'));
                    return;
                }
                dao.findAndOrder({session_id:sessionEvent.get('session_id')}, null, $$.m.PingEvent, 'ping_time', 1, function(err, pingList){ //order by ping_time
                    if(err) {
                        log.error('Error retrieving ping list for session event with id: ' + sessionEvent.get('session_id'));
                        return;
                    }
                    //set the end_time for each page as the start_time from the next one.
                    _.each(pageList, function(page, index, list){
                        if(index < list.length-1) {//not the last one.
                            page.set('end_time', list[index+1].get('start_time'));
                            page.set('exit', false);
                        } else {//last one
                            page.set('end_time', lastSeenMS);
                            page.set('exit', true);
                        }
                    });
                    _.each(pingList, function(ping, index, list){
                        var page = _.findWhere(pageList, {url: ping.get('url')});
                        if(page != undefined) {
                            page.get('pageActions').push(ping.get('pageActions'));
                        } else{
                            log.warn('no page found for ping event', ping);
                        }
                    });

                    sessionEvent.set('page_depth', pageList.length);

                    //send to keen unless test environment
                    if (process.env.NODE_ENV !== "testing") {
                        client.addEvents({
                            "session_data": [sessionEvent],
                            "page_data": pageList
                        }, function (err, res) {
                            if (err) {
                                log.error('Error sending data to keen.');
                            } else {
                                log.info('Successfully sent events to keen.');
                            }
                        });
                    } else {
                        log.info('skipping keen because of testing environment.');
                    }
                    //persist changes
                    dao.batchUpdate(pageList, $$.m.PageEvent, function(err, value){
                        if(err) {
                            log.error('Error saving page events for session with id: ' + sessionEvent.get('session_id'));
                        } else {
                            log.debug('finished processing session event ' + sessionEvent.get('session_id'));
                        }
                        log.debug('<< _groupAndSend');
                    });
                });
            });
        });

    }

}

module.exports = collator;