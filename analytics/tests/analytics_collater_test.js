/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */
process.env.NODE_ENV = "testing";
var app = require('../../app');
var collater = require('../analytics_collater');
var analyticsDao = require('../dao/analytics.dao.js');
var async = require('async');

var _log = $$.g.getLogger("analytics_collater_test");
var testContext = {};
var initialized = false;
var moment = require('moment');
moment().format();
require('../model/page_event');
require('../model/session_event');
require('../model/ping_event');


exports.collater_test = {
    setUp: function (cb) {
        var self = this;
        _log.debug('>> setup');
        if(!initialized) {
            var sessionPromise = $.Deferred();
            var pagesPromise = $.Deferred();
            var pingPromise = $.Deferred();
            //delete all objects
            analyticsDao.findMany({}, $$.m.SessionEvent, function(err, list){
                if(err) {
                    _log.error('Exception removing events.  Tests may not be accurate.');
                } else {
                    async.each(list,
                        function(sessionEvent, callback){
                            analyticsDao.remove(sessionEvent, function(err, value){
                                callback();
                            });
                        }, function(err){
                            //initialized = true;
                            //cb();
                            sessionPromise.resolve();
                        });
                }
            });
            analyticsDao.findMany({}, $$.m.PageEvent, function(err, list){
                if(err) {
                    _log.error('Exception removing events.  Tests may not be accurate.');
                } else {
                    async.each(list,
                        function(pageEvent, callback){
                            analyticsDao.remove(pageEvent, function(err, value){
                                callback();
                            });
                        }, function(err){
                            //initialized = true;
                            //cb();
                            pagesPromise.resolve();
                        });
                }
            });
            analyticsDao.findMany({}, $$.m.PingEvent, function(err, list){
                if(err) {
                    _log.error('Exception removing events.  Tests may not be accurate.');
                } else {
                    async.each(list,
                        function(pingEvent, callback){
                            analyticsDao.remove(pingEvent, function(err, value){
                                callback();
                            });
                        }, function(err){
                            //initialized = true;
                            //cb();
                            pingPromise.resolve();
                        });
                }
            });
            _log.debug('waiting on promises');
            $.when(sessionPromise, pagesPromise, pingPromise).done(function(){
                initialized = true;
                _log.debug('<< setUp');
                cb();
            });
        } else {
            cb();
        }


    },

    tearDown: function (cb) {
        var self = this;
        cb();
    },

    testCollateSession: function(test) {
        var self = this;
        _log.debug('>> testCollateSession');
        test.expect(1);
        var sessionId = new Date().getTime();
        var url1 = {
            domain: "www.example.com",
            protocol: "http",
            port: 80,
            source: "http://www.example.com",
            path: "/",
            anchor: ""
        };
        var url2 = {
            domain: "www.example.com",
            protocol: "http",
            port: 80,
            source: "http://www.example.com/page1",
            path: "/page1",
            anchor: ""
        };
        var time1 = moment().subtract(5, 'minutes');
        var time2 = moment().subtract(4, 'minutes');
        var time3 = moment().subtract(3, 'minutes');
        var time4 = moment().subtract(2, 'minutes');
        var sessionObj = {
            session_id: sessionId,
            session_start: time1.valueOf()
        };
        var page1 = {
            session_id: sessionId,
            start_time: time1.valueOf(),
            url: url1
        };
        var page2 = {
            session_id: sessionId,
            start_time: time3.valueOf(),
            url: url2
        };
        var ping1 = {
            session_id: sessionId,
            ping_time: time2.valueOf(),
            server_time: time2.valueOf(),
            url: url1,
            pageActions: [
                {y:0, x:0, type:'mm', ms:100}
            ]
        };
        var ping2 = {
            session_id: sessionId,
            ping_time: time4.valueOf(),
            server_time: time4.valueOf(),
            url: url2,
            pageActions: [
                {y:0, x:0, type:'mm', ms:100}
            ]
        };
        _log.debug('saving objects');
        analyticsDao.saveOrUpdate(new $$.m.SessionEvent(sessionObj), function(err, value){
            if(err) {
                test.ok(false, 'error saving session event', err);
                return test.done();
            }
            analyticsDao.saveOrUpdate(new $$.m.PageEvent(page1), function(err, value){
                if(err) {
                    test.ok(false, 'error saving page event 1', err);
                    return test.done();
                }
                analyticsDao.saveOrUpdate(new $$.m.PingEvent(ping1), function(err, value){
                    if(err) {
                        test.ok(false, 'error saving ping1', err);
                        return test.done();
                    }
                    analyticsDao.saveOrUpdate(new $$.m.PageEvent(page2), function(err, value){
                        if(err) {
                            test.ok(false, 'error saving page event 2', err);
                            return test.done();
                        }
                        analyticsDao.saveOrUpdate(new $$.m.PingEvent(ping2), function(err, value) {
                            if (err) {
                                test.ok(false, 'error saving ping2', err);
                                return test.done();
                            }
                            _log.debug('running collater');
                            collater.findCheckGroupAndSend(null);
                            console.log('waiting 10 seconds.');
                            setTimeout(function(){
                                console.log('ending test');
                                test.ok(true);
                                test.done();
                            }, 10000);
                        });
                    });
                });
            });
        });

    }
}
