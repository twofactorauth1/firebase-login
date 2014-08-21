/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */
process.env.NODE_ENV = "testing";
var app = require('../../app');
var manager = require('../analytics_manager.js');
var analyticsDao = require('../dao/analytics.dao.js');
var async = require('async');

var _log = $$.g.getLogger("analytics_manager_test");
var testContext = {};
var initialized = false;


exports.subscription_dao_test = {
    setUp: function (cb) {
        var self = this;
        if(!initialized) {
            //delete all objects
            analyticsDao.findMany({}, $$.m.AnalyticsEvent, function(err, list){
                if(err) {
                    _log.error('Exception removing events.  Tests may not be accurate.');
                } else {
                    async.each(list,
                        function(analyticEvent, callback){
                            analyticsDao.remove(analyticEvent, function(err, value){
                                callback();
                            });
                        }, function(err){
                            initialized = true;
                            cb();
                        });
                }
            });
        } else {
            cb();
        }


    },

    tearDown: function (cb) {
        var self = this;
        cb();
    },

    testCreateEventFromSegment: function(test) {
        var self = this;
        test.expect(5);
        var groupSegmentObj = {
            type: 'group',
            anonymousId: '',
            channel: '',
            context: {},
            integrations: {},
            projectId: '',
            receivedAt: '',
            id: '',
            sentAt: '',
            timestamp: '',
            userId: '',
            version: 1,
            groupId: '1',
            traits: {
                groupId:'BOGUS'
            }
        };

        var identifySegmentObj = {
            type: 'identify',
            anonymousId: '',
            channel: '',
            context: {},
            integrations: {},
            projectId: '',
            receivedAt: '',
            id: '',
            sentAt: '',
            timestamp: '',
            userId: '',
            version: 1,
            traits: {
                accountId:'2'
            }
        };

        var trackSegmentObj = {
            type: 'track',
            anonymousId: '',
            channel: '',
            context: {},
            integrations: {},
            projectId: '',
            receivedAt: '',
            id: '',
            sentAt: '',
            timestamp: '',
            userId: '',
            version: 1,
            event: 'track',
            properties: {
                accountId:'3'
            }};

        var pageSegmentObj = {
            type: 'page',
            anonymousId: '',
            channel: '',
            context: {},
            integrations: {},
            projectId: '',
            receivedAt: '',
            id: '',
            sentAt: '',
            timestamp: '',
            userId: '',
            version: 1,
            category: 'page',
            name: 'page',
            properties: {
                accountId:'4'
            }
        };

        var segmentObjects = [];
        segmentObjects.push(groupSegmentObj);
        segmentObjects.push(identifySegmentObj);
        segmentObjects.push(trackSegmentObj);
        segmentObjects.push(pageSegmentObj);

        async.each(segmentObjects,
            function(obj, cb){
                manager.createEventFromSegment(obj, function(err, value){
                    if(err) {
                        cb(err);
                    } else {
                        cb();
                    }
                });
            },
            function(err){
                if(err) {
                    test.ok(false, "error creating objects");
                    test.done();
                } else {
                    //verify that objects exist and accountIDs are correct
                    manager.listEvents(null, null, null, function(err, list){
                        _log.debug('got events: ' + err + ', ' + list);
                        console.dir(list);
                        test.equals(4, list.length);
                        for(var i=0; i<list.length; i++) {
                            if(list[i].get('type') === 'group'){
                                test.equals(1, list[i].get('accountId'));
                            } else if(list[i].get('type') === 'identify'){
                                test.equals(2, list[i].get('accountId'));
                            } else if(list[i].get('type') === 'track') {
                                test.equals(3, list[i].get('accountId'));
                            } else if(list[i].get('type') === 'page') {
                                test.equals(4, list[i].get('accountId'));
                            } else {
                                test.ok(false, "unknown type");
                            }
                        }
                        test.done();
                    });

                }
            });
    },

    testCreateEvent: function(test) {
        test.expect(2);
        var event = new $$.m.AnalyticsEvent({
            type: 'click',
            source: 'manual',
            accountId: 1,
            timestamp: new Date(),
            body: {}
        });

        manager.createEvent(event, function(err, value){
            if(err) {
                test.ok(false, "error creating objects");
                test.done();
            } else {
                testContext.eventId = value.id();
                testContext.event = value;
                test.equals(1, value.get('accountId'));
                test.equals('click', value.get('type'));
                test.done();
            }
        });
    },

    testUpdateEvent: function(test) {
        test.expect(2);
        testContext.event.set('type', 'view');
        manager.updateEvent(testContext.event, function(err, value){
            if(err) {
                test.ok(false, "error updating objects");
                test.done();
            } else {
                test.equals(1, value.get('accountId'));
                test.equals('view', value.get('type'));
                test.done();
            }
        });
    },

    testGetEvent: function(test) {
        test.expect(2);
        manager.getEvent(testContext.eventId, function(err, value){
            if(err) {
                test.ok(false, "error getting event");
                test.done();
            } else {

                test.equals(1, value.get('accountId'));
                test.equals('view', value.get('type'));
                test.done();
            }
        });
    },

    testRemoveEvent: function(test) {
        test.expect(1);
        manager.removeEvent(testContext.eventId, function(err, value){
            if(err) {
                test.ok(false, "error deleting event");
                test.done();
            } else {
                test.ok(true);
                test.done();
            }
        });
    }
}
