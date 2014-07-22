/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */
process.env.NODE_ENV = "testing";
var app = require('../../app');
var testHelpers = require('../../testhelpers/testhelpers.js');
var eventDao = require('../dao/stripe_event.dao.js');

var _log = $$.g.getLogger("stripe.event.dao.test");
var testContext = {};
testContext.plans = [];


exports.stripe_event_dao_test = {
    setUp: function (cb) {
        var self = this;
        var promiseAry = [];
        promiseAry[0] = $.Deferred();

        //remove all existing subscription records
        eventDao.findMany(null, $$.m.StripeEvent, function(err, events){
            promiseAry[0].resolve();
            //if all we have is the counter, we are done.
            if(events.length === 1 && events[0].get('_id') === '__counter__') {
                //;
            } else {
                for(var i=0; i<events.length; i++) {
                    var id = events[i].get('_id');

                    if(id !== '__counter__') {
                        promiseAry[id] = $.Deferred();
                        eventDao.removeById(id, $$.m.StripeEvent, function(err, obj){
                            if(err) {_log.error('Error: ' + err);}
                            promiseAry[id].resolve();
                        });
                    }

                }
            }


        });
        $.when(promiseAry).done(function(){
            _log.debug('setUp');
            cb();
        });
    },

    tearDown: function (cb) {
        var self = this;
        _log.debug('tearDown.');
        cb();
    },

    testGetStripeEventByStripeId: function(test) {
        var self = this;
        _log.debug('>> testGetStripeEventByStripeId');
        test.expect(1);
        var createdTime = Date.now();
        var p1 = $.Deferred(), p2 = $.Deferred();
        var event1 = new $$.m.StripeEvent({'eventId':'event1','type':'bogus.event', 'created':createdTime});
        var event2 = new $$.m.StripeEvent({'eventId':'event2','type':'bogus.event', 'created':createdTime});

        eventDao.saveOrUpdate(event1, function(err, evnt){
            _log.debug('cb for saveOrUpdate');
            if(err) {
                p1.reject();
                test.ok(false, 'Error creating event: ' + err);
                test.done();
            }
            _log.debug('saved 1');
            p1.resolve();

        });
        eventDao.saveOrUpdate(event2, function(err, evnt){
            if(err) {
                p2.reject();
                test.ok(false, 'Error creating event: ' + err);
                test.done();
            }
            _log.debug('saved 2');
            p2.resolve();
        });


        _log.debug('waiting...');
        $.when(p1,p2).done(function(){
            eventDao.getStripeEventByStripeId('event1', function(err, evnt){
                if(err) {
                    test.ok(false, 'Error getting event: ' + err);
                    test.done();
                }
                console.dir(evnt);
                test.equals('event1', evnt.get('eventId'));
                test.done();
                _log.debug('<< testGetStripeEventByStripeId');
            });
        });

    },

    testGetStripeEventsByState: function(test) {
        var self = this;
        _log.debug('>> testGetStripeEventsByState');
        test.expect(3);
        var createdTime = Date.now();
        var p1 = $.Deferred(), p2 = $.Deferred(), p3 = $.Deferred();
        var event1 = new $$.m.StripeEvent({'eventId':'event1','type':'bogus.event', 'created':createdTime});
        var event2 = new $$.m.StripeEvent({'eventId':'event2','type':'bogus.event', 'created':createdTime, 'state':'PROCESSED'});
        var event3 = new $$.m.StripeEvent({'eventId':'event3','type':'bogus.event', 'created':createdTime, 'state':'PROCESSED'});

        eventDao.saveOrUpdate(event1, function(err, evnt){
            _log.debug('cb for saveOrUpdate');
            if(err) {
                p1.reject();
                test.ok(false, 'Error creating event: ' + err);
                test.done();
            }
            _log.debug('saved 1');
            p1.resolve();

        });
        eventDao.saveOrUpdate(event2, function(err, evnt){
            if(err) {
                p2.reject();
                test.ok(false, 'Error creating event: ' + err);
                test.done();
            }
            _log.debug('saved 2');
            p2.resolve();

        });
        eventDao.saveOrUpdate(event3, function(err, evnt){
            if(err) {
                p3.reject();
                test.ok(false, 'Error creating event: ' + err);
                test.done();
            }
            _log.debug('saved 3');
            p3.resolve();
        });


        _log.debug('waiting...');
        $.when(p1,p2,p3).done(function(){
            eventDao.getStripeEventsByState('NEW', function(err, events){
                if(err) {
                    test.ok(false, 'Error: ' + err);
                    test.done();
                }
                test.equals(1, events.length);
                test.equals('event1', events[0].get('eventId'));
            });
            eventDao.getStripeEventsByState('PROCESSED', function(err, events){
                if(err) {
                    test.ok(false, 'Error: ' + err);
                    test.done();
                }
                test.equals(2, events.length);
                test.done();
            });
        });
    },

    testUpdateStripeEventState: function(test) {
        var self = this;
        _log.debug('>> testUpdateStripeEventState');
        test.expect(2);
        var createdTime = Date.now();
        var event2Id = null;
        var p1 = $.Deferred(), p2 = $.Deferred(), p3 = $.Deferred();
        var event1 = new $$.m.StripeEvent({'eventId':'event1','type':'bogus.event', 'created':createdTime});
        var event2 = new $$.m.StripeEvent({'eventId':'event2','type':'bogus.event', 'created':createdTime, 'state':'PROCESSED'});
        var event3 = new $$.m.StripeEvent({'eventId':'event3','type':'bogus.event', 'created':createdTime, 'state':'PROCESSED'});

        eventDao.saveOrUpdate(event1, function(err, evnt){
            _log.debug('cb for saveOrUpdate');
            if(err) {
                p1.reject();
                test.ok(false, 'Error creating event: ' + err);
                test.done();
            }
            _log.debug('saved 1');
            p1.resolve();

        });
        eventDao.saveOrUpdate(event2, function(err, evnt){
            if(err) {
                p2.reject();
                test.ok(false, 'Error creating event: ' + err);
                test.done();
            }
            _log.debug('saved 2');
            event2Id = evnt.get('_id');
            p2.resolve();

        });
        eventDao.saveOrUpdate(event3, function(err, evnt){
            if(err) {
                p3.reject();
                test.ok(false, 'Error creating event: ' + err);
                test.done();
            }
            _log.debug('saved 3');
            p3.resolve();
        });


        _log.debug('waiting...');
        $.when(p1,p2,p3).done(function(){
            eventDao.updateStripeEventState(event2Id, 'DONE', function(err, evnt){
                if(err) {
                    test.ok(false, 'Error updating event state: ' + err);
                    test.done();
                }
                eventDao.getStripeEventsByState('DONE', function(err, updatedEventAry){
                    if(err) {
                        test.ok(false, 'Error getting updated event: ' + err);
                        test.done();
                    }
                    test.equals(1, updatedEventAry.length);
                    test.equals(event2Id, updatedEventAry[0].get('_id'));
                    test.done();
                });
            });
        });
    }
}
